const { verifyRequestUser } = require("../_lib/requestAuth");
const { getSupabaseAdminClient } = require("../_lib/supabaseAdmin");

function respond(res, status, body) {
  res.status(status).json(body);
}

async function resolveUserIdByFirebaseUid(supabase, firebaseUid) {
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
  if (req.method !== "POST") {
    return respond(res, 405, {
      ok: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Dozwolona metoda: POST.",
    });
  }

  try {
    const { uid } = await verifyRequestUser(req);
    const supabase = getSupabaseAdminClient();

    const eventId = String(req.body?.event_id || "").trim();
    const reason = String(req.body?.reason || "makeup").trim() || "makeup";

    if (!eventId) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak pola event_id.",
      });
    }

    const userId = await resolveUserIdByFirebaseUid(supabase, uid);

    const { data: eventRow, error: eventError } = await supabase
      .from("events")
      .select("id,status")
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

    const { data: addedRow, error: insertError } = await supabase
      .from("user_added_events")
      .insert({
        user_id: userId,
        event_id: eventId,
        reason,
        status: "active",
      })
      .select("id,event_id,status,reason")
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
