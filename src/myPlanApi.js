import { auth } from "./firebaseClient";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

async function getAuthTokenOrThrow() {
  const user = auth?.currentUser || null;

  if (!user) {
    throw new Error("Musisz byc zalogowany, aby wykonac te akcje.");
  }

  return user.getIdToken();
}

async function requestMyPlan(path, { method = "GET", body } = {}) {
  const token = await getAuthTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.ok) {
    const message =
      data?.message ||
      "Nie udalo sie wykonac operacji na Twoim prywatnym planie.";
    throw new Error(message);
  }

  return data;
}

export async function addEventToMyPlan(eventId) {
  const cleanEventId = String(eventId || "").trim();

  if (!cleanEventId) {
    throw new Error("Brak identyfikatora eventu do dodania.");
  }

  return requestMyPlan("/api/my-plan/add-event", {
    method: "POST",
    body: {
      event_id: cleanEventId,
      reason: "makeup",
    },
  });
}

export async function getAddedEventsFromMyPlan({ dateFrom, dateTo }) {
  const params = new URLSearchParams();

  if (dateFrom) {
    params.set("date_from", String(dateFrom).slice(0, 10));
  }

  if (dateTo) {
    params.set("date_to", String(dateTo).slice(0, 10));
  }

  const query = params.toString();
  const endpoint = query
    ? `/api/my-plan/added-events?${query}`
    : "/api/my-plan/added-events";

  return requestMyPlan(endpoint, { method: "GET" });
}

export async function removeAddedEventFromMyPlan(addedEventId) {
  const cleanAddedEventId = String(addedEventId || "").trim();

  if (!cleanAddedEventId) {
    throw new Error("Brak identyfikatora dopisanego eventu do usuniecia.");
  }

  return requestMyPlan("/api/my-plan/remove-event", {
    method: "POST",
    body: {
      added_event_id: cleanAddedEventId,
    },
  });
}
