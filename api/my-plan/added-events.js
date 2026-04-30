const { verifyRequestUser } = require("../_lib/requestAuth");
const { getSupabaseAdminClient } = require("../_lib/supabaseAdmin");

/*
  GET /api/my-plan/added-events

  Cel:
  - Zwrócić listę eventów dopisanych przez użytkownika (user_added_events)
    wraz z danymi z tabeli `events` (join), przefiltrowaną po planie i dacie.

  Query:
  - scheduleName: string (wymagane, odpowiada `events.faculty`)
  - date_from: YYYY-MM-DD (opcjonalnie)
  - date_to: YYYY-MM-DD (opcjonalnie)

  Zwracany kształt:
  - eventy są mapowane do formatu, który frontend umie wprost przerobić
    na "slot" w tygodniu (day/start/duration itd.).
*/

function respond(res, status, body) {
  res.status(status).json(body);
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "authorization,content-type");
}

function getDateRangeFromQuery(query) {
  // Przyjmujemy tylko część YYYY-MM-DD (bez czasu), aby unikać problemów stref.
  const dateFrom = String(query?.date_from || "")
    .trim()
    .slice(0, 10);
  const dateTo = String(query?.date_to || "")
    .trim()
    .slice(0, 10);

  return {
    dateFrom,
    dateTo,
  };
}

async function getUserIdByFirebaseUid(supabase, firebaseUid) {
  // Użytkownik może nie istnieć w tabeli `users` (np. pierwszy request).
  // Wtedy zwracamy pustą listę dopisanych eventów.
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

  if (req.method !== "GET") {
    return respond(res, 405, {
      ok: false,
      error: "METHOD_NOT_ALLOWED",
      message: "Dozwolona metoda: GET.",
    });
  }

  try {
    // 1) Auth: zidentyfikuj użytkownika.
    const { uid } = await verifyRequestUser(req);
    const supabase = getSupabaseAdminClient();
    const { dateFrom, dateTo } = getDateRangeFromQuery(req.query || {});
    const scheduleName = String(req.query?.scheduleName || "").trim();

    if (!scheduleName) {
      return respond(res, 400, {
        ok: false,
        error: "BAD_REQUEST",
        message: "Brak parametru scheduleName.",
      });
    }

    const userId = await getUserIdByFirebaseUid(supabase, uid);

    if (!userId) {
      return respond(res, 200, {
        ok: true,
        events: [],
      });
    }

    // 2) Query do `user_added_events` + inner join do `events`.
    // Filtrujemy:
    // - tylko aktywne dopiski użytkownika,
    // - tylko aktywne eventy bazowe,
    // - tylko eventy należące do aktualnie oglądanego planu (`events.faculty`).
    let query = supabase
      .from("user_added_events")
      .select(
        "id,reason,status,event_id,created_at,events!inner(id,faculty,date,start_time,duration_min,subject,type,room,group,instructor,status)",
      )
      .eq("user_id", userId)
      .eq("status", "active")
      .eq("events.faculty", scheduleName)
      .eq("events.status", "aktywne")
      .order("created_at", { ascending: false });

    if (dateFrom) {
      query = query.gte("events.date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("events.date", dateTo);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // 3) Mapowanie do formatu czytelnego dla UI.
    const events = (data || [])
      .map((row) => {
        const event = row?.events;
        if (!event?.id) return null;

        return {
          added_event_id: row.id,
          event_id: event.id,
          origin: "added",
          reason: row.reason || "makeup",

          // Zachowane dla kompatybilności z frontendem.
          // W bazie nie ma już `user_added_events.schedule_name`;
          // źródłem prawdy dla planu jest `events.faculty`.
          schedule_name: event.faculty,

          faculty: event.faculty,
          date: event.date,
          start_time: event.start_time,
          duration_min:
            Number(event.duration_min) > 0 ? Number(event.duration_min) : 90,
          subject: event.subject,
          type: event.type,
          room: event.room,
          group: event.group,
          instructor: event.instructor,
          status: event.status,
        };
      })
      .filter(Boolean);

    return respond(res, 200, {
      ok: true,
      events,
    });
  } catch (error) {
    const statusCode = Number(error?.statusCode) || 500;

    return respond(res, statusCode, {
      ok: false,
      error: statusCode === 401 ? "UNAUTHORIZED" : "LOAD_ADDED_EVENTS_FAILED",
      message:
        statusCode === 401
          ? "Brak autoryzacji. Zaloguj sie ponownie."
          : "Nie udalo sie pobrac dopisanych wydarzen.",
    });
  }
};
