const { verifyRequestUser } = require("../_lib/requestAuth");
const { getSupabaseAdminClient } = require("../_lib/supabaseAdmin");

/*
  POST /api/my-plan/add-event

  Cel:
  - Dopisać istniejący event z tabeli `events` do prywatnego planu użytkownika
    (tabela `user_added_events`).

  Autoryzacja:
  - Wymaga Firebase ID token w nagłówku: Authorization: Bearer <token>.

  Body:
  - event_id: string (id rekordu w `events`)
  - scheduleName: string (musi odpowiadać `events.faculty`)
  - reason: opcjonalnie (np. 'makeup')

  Zachowanie:
  - Endpoint jest idempotentny: jeśli wpis już istnieje jako active -> zwraca ok.
*/

function respond(res, status, body) {
  res.status(status).json(body);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization,content-type");
}

async function resolveUserIdByFirebaseUid(supabase, firebaseUid) {
  // Mapowanie użytkownika Firebase -> user_id w Supabase.
  // Upsert tworzy rekord w `users` przy pierwszym użyciu.
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        firebase_uid: firebaseUid,
      },
      {
        onConflict: "firebase_uid",
      },
    )
    .select("id")
    .single();

  if (error || !data?.id) {
    const err = new Error("Nie udalo sie przygotowac konta uzytkownika.");
    err.statusCode = 500;
    err.code = "USER_RESOLVE_FAILED";
    throw err;
  }

  return data.id;
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return respond(res, 405, {
      ok: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Dozwolona metoda: POST.",
    });
  }

  try {
    // 1) Auth: sprawdź kto wykonuje operację.
    const { uid } = await verifyRequestUser(req);
    const supabase = getSupabaseAdminClient();

    // 2) Walidacja wejścia: event_id + nazwa aktualnie oglądanego planu.
    const eventId = String(req.body?.event_id || "").trim();
    const scheduleName = String(req.body?.scheduleName || "").trim();
    const reason = String(req.body?.reason || "makeup").trim() || "makeup";

    if (!eventId) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak pola event_id.",
      });
    }

    if (!scheduleName) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak pola scheduleName.",
      });
    }

    // 3) Upewnij się, że istnieje rekord użytkownika w Supabase.
    const userId = await resolveUserIdByFirebaseUid(supabase, uid);

    // 4) Weryfikacja, że event istnieje, jest aktywny i należy do aktualnie oglądanego planu.
    const { data: eventRow, error: eventError } = await supabase
      .from("events")
      .select("id,status,faculty")
      .eq("id", eventId)
      .eq("status", "aktywne")
      .maybeSingle();

    if (eventError) {
      throw eventError;
    }

    if (!eventRow?.id) {
      return respond(res, 404, {
        ok: false,
        error: "EVENT_NOT_FOUND",
        message: "Nie znaleziono aktywnego wydarzenia.",
      });
    }

    // Eventy są powiązane z planem przez `faculty`.
    // Zapobiega to dopisywaniu eventów z innego planu niż aktualnie oglądany.
    if (String(eventRow?.faculty || "").trim() !== scheduleName) {
      return respond(res, 400, {
        ok: false,
        error: "EVENT_SCHEDULE_MISMATCH",
        message: "Ten event nie nalezy do aktualnie ogladanego planu.",
      });
    }

    // 5) Idempotencja: jeśli już jest active, nie duplikujemy wpisów.
    const { data: existingActive, error: existingError } = await supabase
      .from("user_added_events")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .eq("status", "active")
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingActive?.id) {
      return respond(res, 200, {
        ok: true,
        already_added: true,
        message: "Ten termin jest juz dodany do Twojego planu.",
      });
    }

    // 6) Zapis do `user_added_events` jako soft-link do `events`.
    const { data: addedRow, error: insertError } = await supabase
      .from("user_added_events")
      .insert({
        user_id: userId,
        event_id: eventId,
        reason,
        status: "active",
      })
      .select("id,event_id,status,reason,created_at")
      .single();

    if (insertError || !addedRow?.id) {
      throw insertError || new Error("Insert failed");
    }

    return respond(res, 200, {
      ok: true,
      added_event: addedRow,
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    const code = String(error?.code || "ADD_EVENT_FAILED");

    return respond(res, statusCode, {
      ok: false,
      error: code,
      message:
        statusCode === 401
          ? "Brak autoryzacji. Zaloguj sie ponownie."
          : "Nie udalo sie dodac wydarzenia do planu.",
    });
  }
};
