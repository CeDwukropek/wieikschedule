const { verifyRequestUser } = require("../_lib/requestAuth");
const { getSupabaseAdminClient } = require("../_lib/supabaseAdmin");

function respond(res, status, body) {
  res.status(status).json(body);
}

async function getUserIdByFirebaseUid(supabase, firebaseUid) {
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

    const addedEventId = String(req.body?.added_event_id || "").trim();

    if (!addedEventId) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak pola added_event_id.",
      });
    }

    const userId = await getUserIdByFirebaseUid(supabase, uid);

    if (!userId) {
      return respond(res, 200, { ok: true, already_removed: true });
    }

    const { error } = await supabase
      .from("user_added_events")
      .update({
        status: "removed",
        removed_at: new Date().toISOString(),
      })
      .eq("id", addedEventId)
      .eq("user_id", userId)
      .eq("status", "active");

    if (error) {
      throw error;
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
