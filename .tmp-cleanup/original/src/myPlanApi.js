import { auth } from "./firebaseClient";

// Frontendowa warstwa API dla "Mój plan".
//
// Ten moduł:
// - pobiera Firebase ID token z aktualnej sesji użytkownika,
// - woła endpointy w `api/my-plan/*`,
// - ujednolica obsługę błędów (response.ok + data.ok).

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

async function getAuthTokenOrThrow() {
  // Endpointy /api/my-plan/* wymagają zalogowanego usera (Firebase Auth).
  const user = auth?.currentUser || null;

  if (!user) {
    throw new Error("Musisz byc zalogowany, aby wykonac te akcje.");
  }

  return user.getIdToken();
}

async function requestMyPlan(path, { method = "GET", body } = {}) {
  // Zawsze dodajemy Authorization: Bearer <idToken>.
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

export async function addEventToMyPlan({ eventId, scheduleName }) {
  // Dodaje event (events.id) do prywatnego planu użytkownika.
  // `scheduleName` jest walidowane również na backendzie (events.faculty).
  const cleanEventId = String(eventId || "").trim();
  const cleanScheduleName = String(scheduleName || "").trim();

  if (!cleanEventId) {
    throw new Error("Brak identyfikatora eventu do dodania.");
  }

  if (!cleanScheduleName) {
    throw new Error("Brak nazwy planu do dodania wydarzenia.");
  }

  return requestMyPlan("/api/my-plan/add-event", {
    method: "POST",
    body: {
      event_id: cleanEventId,
      scheduleName: cleanScheduleName,
      reason: "makeup",
    },
  });
}

export async function getAddedEventsFromMyPlan({
  scheduleName,
  dateFrom,
  dateTo,
}) {
  // Pobiera dopisane eventy dla planu i opcjonalnego zakresu dat (YYYY-MM-DD).
  const cleanScheduleName = String(scheduleName || "").trim();

  if (!cleanScheduleName) {
    throw new Error("Brak nazwy planu do pobrania dopisanych wydarzen.");
  }

  const params = new URLSearchParams({ scheduleName: cleanScheduleName });

  if (dateFrom) {
    params.set("date_from", String(dateFrom).slice(0, 10));
  }

  if (dateTo) {
    params.set("date_to", String(dateTo).slice(0, 10));
  }

  const endpoint = `/api/my-plan/added-events?${params.toString()}`;

  return requestMyPlan(endpoint, { method: "GET" });
}

export async function removeAddedEventFromMyPlan({
  addedEventId,
  scheduleName,
}) {
  // Usuwa (soft-remove) dopisany event po `added_event_id`.
  const cleanAddedEventId = String(addedEventId || "").trim();
  const cleanScheduleName = String(scheduleName || "").trim();

  if (!cleanAddedEventId) {
    throw new Error("Brak identyfikatora dopisanego eventu do usuniecia.");
  }

  if (!cleanScheduleName) {
    throw new Error("Brak nazwy planu do usuniecia wydarzenia.");
  }

  return requestMyPlan("/api/my-plan/remove-event", {
    method: "POST",
    body: {
      added_event_id: cleanAddedEventId,
      scheduleName: cleanScheduleName,
    },
  });
}
