# Eventy — dokumentacja (Supabase + Mój plan)

## Słownik pojęć

- **event**: rekord zajęć/terminu w bazie (Supabase) w tabeli `events`.
- **plan / schedule**: w UI to wybór planu; w bazie Supabase identyfikowany przez pole `events.faculty`.
- **Mój plan**: prywatna warstwa użytkownika pozwalająca dopisywać/usuwać (soft-remove) eventy; przechowywana w tabeli `user_added_events`.

## Źródła danych (Supabase)

### Tabela `events`

- Jest to główna tabela z terminami.
- Frontend pobiera eventy przez anon client (zob. [src/supabaseClient.js](../src/supabaseClient.js)).
- Loader planów filtruje eventy po `faculty` (czyli po wybranym planie).

Najważniejsze pola używane przez UI:

- `id` (string) — identyfikator eventu.
- `faculty` (string) — nazwa planu.
- `date` (YYYY-MM-DD)
- `start_time` (TIME / HH:mm:ss)
- `duration_min` (number)
- `subject`, `type`, `room`, `group`, `instructor`
- `status` (np. `aktywne`)

### Tabela `users`

- Mapuje użytkownika Firebase na identyfikator w Supabase.
- Klucz mapowania: `firebase_uid`.

### Tabela `user_added_events`

- Przechowuje dopisane przez użytkownika eventy.
- Jest to „link” do bazowego `events.id`.
- Usuwanie jest realizowane jako soft-delete:
  - `status = 'removed'`
  - `removed_at = <ISO timestamp>`

## Wczytywanie eventów do UI (timetable)

Główna ścieżka:

1. Hook [src/hooks/useScheduleManager.js](../src/hooks/useScheduleManager.js) wywołuje:
   - `loadAllTimetableOptions()` (lista planów)
   - `loadTimetableById()` (eventy planu)
2. Funkcje te są w [src/timetables/index.js](../src/timetables/index.js) i:
   - pobierają dane z Supabase (`events`),
   - normalizują do kształtu wykorzystywanego przez UI,
   - cache’ują w pamięci i w localStorage (TTL).

### Cache timetables (localStorage)

- Klucze cache:
  - `wieik:timetable-options:v1` — lista planów (unikalne `faculty`).
  - `wieik:timetable:v1:<faculty>` — dane konkretnego planu.
- Wartość jest opakowana w obiekt `{ savedAt, data }`.
- TTL domyślnie: 10 minut.
- Dopuszczone jest zwrócenie danych przeterminowanych, a następnie odświeżenie w tle
  (żeby UI było responsywne).

## Mój plan — API (dodawanie/usuwanie/wczytywanie)

Frontend woła endpointy przez [src/myPlanApi.js](../src/myPlanApi.js). Wszystkie endpointy wymagają:

- `Authorization: Bearer <Firebase ID token>`
- Token jest pobierany z Firebase Auth w przeglądarce.

### POST `/api/my-plan/add-event`

Plik: [api/my-plan/add-event.js](../api/my-plan/add-event.js)

Body:

- `event_id` (string) — `events.id`
- `scheduleName` (string) — musi być równe `events.faculty`
- `reason` (string, opcjonalnie) — np. `makeup`

Zachowanie:

- Endpoint jest idempotentny: jeśli user już ma aktywny wpis dla `(user_id, schedule_name, event_id)`
  to zwraca `ok: true` + `already_added: true`.

### GET `/api/my-plan/added-events`

Plik: [api/my-plan/added-events.js](../api/my-plan/added-events.js)

Query:

- `scheduleName` (wymagane)
- `date_from` (opcjonalnie, YYYY-MM-DD)
- `date_to` (opcjonalnie, YYYY-MM-DD)

Zwraca:

- listę eventów dopisanych przez użytkownika, zjoinowaną z `events`.
- format jest mapowany po stronie API do kształtu dogodnego dla UI (m.in. `added_event_id`, `event_id`).

### POST `/api/my-plan/remove-event`

Plik: [api/my-plan/remove-event.js](../api/my-plan/remove-event.js)

Body:

- `added_event_id` (string) — id rekordu w `user_added_events`
- `scheduleName` (string)

Zachowanie:

- soft-remove: `status = 'removed'`, `removed_at = now()`

## Mój plan — integracja w UI

Główna logika jest w [src/App.js](../src/App.js):

- `addedEventsByWeek` trzyma cache dopisanych eventów per tydzień.
- UI stosuje optimistic update przy usuwaniu oraz przy dodawaniu (chatbot slot).
- Dodatkowe przyciski/akcje są w [src/EventCard.js](../src/EventCard.js) (np. „Usuń z mojego planu”).

### Cache dopisanych eventów (localStorage)

- Klucz: `wieikschedule.<uid|guest>.added-events.<scheduleName>.<weekStart>`
- Wartość: `{ savedAt, events }`
- TTL: 7 dni (używany jako szybki fallback przy przełączaniu planów/tygodni)
- Cache jest uzupełniany po optimistic add oraz po fetchu z `/api/my-plan/added-events`.

## localStorage (pozostałe)

- [src/hooks/useUserId.js](../src/hooks/useUserId.js): generuje stabilne id gościa do namespacingu.
- [src/hooks/useEventFiltering.js](../src/hooks/useEventFiltering.js): cache filtrowania eventów per-user (`wieikschedule.<userId>.cachedFiltered`, TTL 60 dni).
- [src/hooks/useSettings.js](../src/hooks/useSettings.js): persystencja ustawień UI (localStorage + opcjonalnie Firestore).

## Zmienne środowiskowe

Frontend (REACT*APP*\*):

- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_API_BASE_URL` (opcjonalnie; domyślnie puste — ten sam origin)

Backend (API):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Najczęstsze problemy

- Brak `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` ⇒ brak listy planów i eventów.
- Brak tokenu Firebase lub wygasła sesja ⇒ endpointy `my-plan` zwracają 401 (frontend powinien poprosić o ponowne logowanie).
