const { verifyRequestUser } = require("../_lib/requestAuth");
const { getSupabaseAdminClient } = require("../_lib/supabaseAdmin");

/*
  POST /api/my-plan/remove-event

  Cel:
  - "Usunąć" dopisany event z prywatnego planu użytkownika.

  Implementacja:
  - To nie jest twardy delete; robimy soft-delete przez ustawienie
    `user_added_events.status = 'removed'` + timestamp `removed_at`.

  Body:
  - added_event_id: string (id rekordu w `user_added_events`)
  - scheduleName: string (musi odpowiadać `events.faculty`)
*/

function respond(res, status, body) {
  res.status(status).json(body);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization,content-type");
}

async function getUserIdByFirebaseUid(supabase, firebaseUid) {
  // Jeżeli user nie istnieje w `users`, traktujemy to jak brak dopisków.
  const { data, error } = await supabase
    .from("users")
    .select("id")
    .eq("firebase_uid", firebaseUid)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.id || null;
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
    // 1) Auth + Supabase.
    const { uid } = await verifyRequestUser(req);
    const supabase = getSupabaseAdminClient();

    const addedEventId = String(req.body?.added_event_id || "").trim();
    const scheduleName = String(req.body?.scheduleName || "").trim();

    if (!addedEventId) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak pola added_event_id.",
      });
    }

    if (!scheduleName) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak pola scheduleName.",
      });
    }

    const userId = await getUserIdByFirebaseUid(supabase, uid);

    if (!userId) {
      return respond(res, 200, { ok: true, already_removed: true });
    }

    // 2) Sprawdź, czy dopisany event:
    // - istnieje,
    // - jest aktywny,
    // - należy do aktualnego użytkownika,
    // - dotyczy planu `scheduleName`, czyli `events.faculty`.
    const { data: existingRow, error: existingError } = await supabase
      .from("user_added_events")
      .select("id,event_id,status,events!inner(id,faculty,status)")
      .eq("id", addedEventId)
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("events.faculty", scheduleName)
      .eq("events.status", "aktywne")
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (!existingRow?.id) {
      return respond(res, 404, {
        ok: false,
        error: "ADDED_EVENT_NOT_FOUND",
        message: "Nie znaleziono aktywnego dopisanego eventu dla tego planu.",
      });
    }

    // 3) Soft-delete.
    const { data, error } = await supabase
      .from("user_added_events")
      .update({
        status: "removed",
        removed_at: new Date().toISOString(),
      })
      .eq("id", existingRow.id)
      .eq("user_id", userId)
      .eq("status", "active")
      .select("id");

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      return respond(res, 404, {
        ok: false,
        error: "ADDED_EVENT_NOT_FOUND",
        message: "Nie znaleziono aktywnego dopisanego eventu dla tego planu.",
      });
    }

    return respond(res, 200, {
      ok: true,
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;

    return respond(res, statusCode, {
      ok: false,
      error: statusCode === 401 ? "UNAUTHORIZED" : "REMOVE_EVENT_FAILED",
      message:
        statusCode === 401
          ? "Brak autoryzacji. Zaloguj sie ponownie."
          : "Nie udalo sie usunac wydarzenia z planu.",
    });
  }
};
