const { respond, setCors } = require("../_lib/http");
const { verifyRequestUser } = require("../_lib/requestAuth");
const { getSupabaseAdminClient } = require("../_lib/supabaseAdmin");

// Firebase identity is verified here; only the service-role backend can invoke
// add_my_plan_event. Validation, user resolution and idempotent insert are atomic.
module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return respond(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED", message: "Dozwolona metoda: POST." });
  }

  try {
    const { uid } = await verifyRequestUser(req);
    const eventId = String(req.body?.event_id || "").trim();
    const scheduleName = String(req.body?.scheduleName || "").trim();
    const reason = String(req.body?.reason || "makeup").trim() || "makeup";
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(eventId) ||
        !scheduleName || !["makeup", "optional", "manual"].includes(reason)) {
      return respond(res, 400, { ok: false, error: "BAD_REQUEST", message: "Niepoprawny event_id, scheduleName lub reason." });
    }

    const { data, error } = await getSupabaseAdminClient().rpc("add_my_plan_event", {
      p_firebase_uid: uid,
      p_event_id: eventId,
      p_schedule_name: scheduleName,
      p_reason: reason,
    });
    if (error) throw error;
    if (!data?.ok) {
      return respond(res, Number(data?.status_code) || 500, {
        ok: false, error: data?.error || "ADD_EVENT_FAILED",
        message: data?.message || "Nie udalo sie dodac wydarzenia do planu.",
      });
    }
    return respond(res, 200, data);
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;
    return respond(res, statusCode, {
      ok: false,
      error: statusCode === 401 ? "UNAUTHORIZED" : "ADD_EVENT_FAILED",
      message: statusCode === 401 ? "Brak autoryzacji. Zaloguj sie ponownie." : "Nie udalo sie dodac wydarzenia do planu.",
    });
  }
};
