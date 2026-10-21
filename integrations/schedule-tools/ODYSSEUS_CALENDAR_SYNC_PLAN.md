# Plan zajęć w kalendarzu Odysseusa — projekt do zatwierdzenia (21.10.2026)

## Cel i wniosek

Zmiana zajęć wykonana w kalendarzu Odysseusa ma być widoczna w planie
wieikschedule (tydzień, karta wydarzenia, ICS, odpowiedzi agenta), a plan
z wieikschedule ma sam pojawiać się w Odysseusie. Ten sam termin nie powinien
być poprawiany w dwóch miejscach.

**Jest to wykonalne bez zmian w `events` i bez przebudowy bazy.** Potrzebne są:
jedna nowa tabela w Supabase, kilka kolumn w SQLite Odysseusa, nowe endpointy
backendu oraz zmiana ścieżek zapisu kalendarza w Odysseusie. Wymaga to jednak
odejścia od ustalenia z [ROADMAP](ROADMAP_2026-10-18.md) „nie wdrażamy teraz
parowania kont obu aplikacji” — bez trwałego powiązania kont Odysseus nie może
ani pobierać planu, ani zapisywać zmian, gdy wieikschedule nie jest otwarte.

## Stan obecny (sprawdzony 21.10.2026)

### Odysseus

- Kalendarz to `calendars` + `calendar_events` w `data/app.db` (SQLite).
  `calendar_events.uid` jest **globalnym** kluczem głównym, właściciel wynika
  z `calendars.owner`. Brak pola na identyfikator zewnętrzny poza CalDAV
  (`remote_href`, `origin`).
- Konto `admin` ma kalendarz **`timetable`** (`source='import'`): 225 wydarzeń
  2026-10-02 → 2027-02-01. To jednorazowy import ICS; `POST /api/calendar/import`
  nadaje każdemu wydarzeniu nowe `uuid4`, więc powiązanie ze źródłem jest
  utracone. Ten kalendarz nie odświeża się po imporcie uczelni ani po prywatnych
  zmianach — to właśnie obecne „dwa miejsca”.
- 188 z 225 wierszy zostało później zmienionych przez automaty Odysseusa
  (np. `event_type='work'`); 10 wydarzeń WF zapisano jako UTC.
- `tidy_calendar` (`src/builtin_actions.py`) usuwa duplikaty po
  (tytuł, początek) **bez filtra właściciela i kalendarza**. Przy dwóch kopiach
  planu usunie jedną z nich; dotyczy to także kont innych użytkowników.
- Sekrety integracji Odysseus szyfruje przez `src/secret_storage.py` (Fernet,
  klucz w `data/.app_key`) — użyjemy tego samego mechanizmu.
- Uwaga poboczna: w niezatwierdzonych zmianach głównego checkoutu
  `/home/cedwukropek/odysseus` funkcja nosi nazwę `_create_lendar_reminder`,
  a wywołania (linie 399 i 464 `src/tools/calendar.py`) używają
  `_create_calendar_reminder`. Tworzenie wydarzenia z przypomnieniem przez
  agenta skończy się `NameError`. Nie poprawiam tego bez Twojej decyzji.

### wieikschedule (Supabase + Firebase)

- Widoczny plan = `events` wybranego wydziału przefiltrowane grupami
  z aktywnego zestawu grup (Firestore `userSettings/{uid}.settings`) i
  `externalSelections` + `user_added_events` (dopiski) + `schedule_overrides`
  (prywatne `modify`/`cancel`).
- Prywatna zmiana przechodzi `propose_schedule_change` →
  `confirm_schedule_change` z porównaniem pełnego rekordu źródła i rewizji
  override (CAS). `confirm` wymaga Firebase ID token; token delegowany agenta
  jest celowo odrzucany.
- Dozwolony `patch`: `date`, `start_time`, `duration_min`, `room`, `instructor`;
  daty pon.–pt., godziny 07–22, bez przejścia przez północ.
  `schedule_change_proposals.provider` ∈ `manual|n8n|odysseus`.
- Backend ma już `firebase-admin` z dostępem do Firestore
  (`api/_lib/aiCredentials.js`), więc może odczytać wybór grup po stronie serwera.

### Dopasowanie istniejącego kalendarza `timetable` do bazy stagingu

| Wynik | Liczba | Postępowanie |
| --- | --- | --- |
| Jednoznacznie dopasowane do `events.id` (EiAs3) | 171 | Przeniesienie lokalnych metadanych na lustro |
| Dni wolne (w bazie `status='wolne'`) | 41 | Zastąpione dniami wolnymi z feedu |
| WF zapisane jako UTC | 10 | Ręczna weryfikacja w raporcie |
| Niejednoznaczne | 3 | Ręczna weryfikacja w raporcie |

## Proponowana architektura

### 1. Jedno źródło prawdy, w Odysseusie zarządzane lustro

Supabase pozostaje jedynym źródłem planu. W Odysseusie powstaje kalendarz
`source='wieikschedule'`, którego wiersze są **lustrem efektywnego planu**.
Edycja w Odysseusie nie zmienia wiersza lokalnie „na zapas”: wywołuje zapis
w wieikschedule (write-through), a lustro przyjmuje wynik zwrócony przez backend.
Nie budujemy dwukierunkowej synchronizacji z rozstrzyganiem konfliktów — przy
jednym źródle konflikt oznacza po prostu nieaktualny stan i odświeżenie.

### 2. Mapowanie operacji z Odysseusa

| Operacja w Odysseusie | Skutek w wieikschedule |
| --- | --- |
| Przesunięcie, zmiana długości (`dtstart`/`dtend`) | `modify` z `date`, `start_time`, `duration_min` |
| Zmiana `location` | `modify` z `room` |
| Usunięcie lub `status='cancelled'` zajęć z planu | `cancel` |
| Usunięcie dopisanych zajęć (odrabianie) | `/api/my-plan/remove-event` |
| „Przywróć oryginalny termin” (nowa akcja) | usunięcie override |
| Tytuł, opis, kolor, ważność, typ, przypomnienia | tylko lokalnie w Odysseusie; zachowane przy odświeżeniu |
| Nowe wydarzenie lub `rrule` w kalendarzu planu | odrzucone z komunikatem; własne wydarzenia to etap 6 ROADMAP |
| Termin poza walidacją (weekend, po 22:00) | odrzucone z komunikatem backendu; lustro bez zmian |

Odwołane zajęcia trafiają do lustra jako `status='cancelled'` (Odysseus ukrywa
je w widokach i narzędziach), dzięki czemu można je przywrócić. Prowadzący nie
ma pola w Odysseusie; zmiana prowadzącego pozostaje w wieikschedule.

### 3. Kto zatwierdza zmianę

- **Ręczna edycja w UI Odysseusa** (zalogowany człowiek, `routes/calendar_routes.py`)
  jest traktowana jak potwierdzenie: backend wykonuje propose + confirm w jednym
  żądaniu, z tym samym CAS co dziś. *(D2 — zatwierdzone 21.10.2026)*
- **Agent Odysseusa** (`manage_calendar` w `src/tools/calendar.py`) tworzy tylko
  podgląd, który użytkownik zatwierdza kliknięciem w Odysseusie (czat lub
  kalendarz). Zasada „model nie potwierdza zapisów” zostaje zachowana.
  *(D3 — zatwierdzone 21.10.2026)*
- **Automaty** (`tidy_calendar`, klasyfikacja wydarzeń, synchronizacja CalDAV)
  nigdy nie zapisują do planu. W lustrze mogą zmieniać wyłącznie lokalne metadane.
  Write-back jest wywoływany jawnie w ścieżce trasy/narzędzia, a nie
  przez hook bazy, więc nie da się go uruchomić przypadkiem.

### 4. Powiązanie kont *(D1 — zatwierdzone 21.10.2026)*

Zastępuje ustalenie ROADMAP „nie wdrażamy teraz parowania kont” w zakresie
wyłącznie tej integracji kalendarza.

W wieikschedule: Menu → Integracje → „Połącz z Odysseusem” generuje kod ważny
10 minut. W Odysseusie: Ustawienia kalendarza → „Plan zajęć wieikschedule”,
wklejenie adresu i kodu. Backend wymienia kod na token połączenia:

- kod jest jednorazowy i wygasa po 10 minutach; token jest długotrwały, bo
  Odysseus używa go przy każdym pobraniu planu i zapisie zmiany;
- token wygasa po 180 dniach bez użycia (liczone od `last_used_at`) albo po
  ręcznym odwołaniu; regularna synchronizacja utrzymuje go w mocy;
- 256 bitów losowości; w Supabase zapisany jest tylko hash SHA-256;
- zakres wyłącznie: odczyt efektywnego planu tego użytkownika oraz jego prywatne
  zmiany i dopiski — bez kluczy AI, bez narzędzi agenta i bez innych kont;
- widoczny na liście połączeń, z `last_used_at`; jedno kliknięcie odwołuje dostęp;
- w Odysseusie zaszyfrowany przez `secret_storage`, przypisany do jednego `owner`.

Firebase Auth i obecny przepływ `context`/`confirm` pozostają bez zmian.

### 5. Które grupy trafiają do lustra *(D4 — zatwierdzone 21.10.2026)*

Przy łączeniu użytkownik wskazuje plan i nazwany zestaw grup,
a backend przy każdym pobraniu odczytuje jego aktualną zawartość z Firestore.
Zmiana grup w aplikacji zmienia wtedy także lustro. Usunięcie zestawu daje
czytelny błąd połączenia zamiast pustego kalendarza.

### 6. Transport: pobieranie przez Odysseusa

Odysseus działa za Tailscale, więc backend nie wysyła do niego webhooków.
Odysseus pobiera plan co 15 minut, przy otwarciu kalendarza i po każdym zapisie.
Odpowiedź ma `ETag`; brak zmian kończy się `304`. Opóźnienie zmian wykonanych
w wieikschedule wynosi więc maksymalnie 15 minut. Zmiany wykonane w Odysseusie są
widoczne w wieikschedule natychmiast, bo zapis przechodzi przez backend.

## Zmiany w bazach danych

### Supabase (nowa migracja, najpierw staging)

- `calendar_links`: `id`, `user_id → users`, `token_hash` (unique), `label`,
  `selection jsonb` (`faculty`, `group_set_id`), `created_at`, `last_used_at`,
  `revoked_at`. RLS włączone, uprawnienia `anon`/`authenticated` odebrane.
- `calendar_link_codes`: hash kodu, `user_id`, `expires_at`, `consumed_at`.
- `schedule_change_proposals.provider`: dodanie `odysseus-calendar`, aby audyt
  odróżniał zmianę z kalendarza od rozmowy z agentem.
- Bez zmian w `events`, `schedule_overrides`, `user_added_events`.

### SQLite Odysseusa (migracja w stylu istniejących `_migrate_*`)

- `calendar_events`: `external_source`, `external_id` (`events.id`),
  `external_version` (odcisk rekordu źródła + rewizja override), indeks unikalny
  `(calendar_id, external_id)`.
- `uid` lustra = `uuid5(NS, owner + ':' + event_id)`: stały dla danego konta,
  bez kolizji między kontami, bo `uid` jest globalnym kluczem.
- Kalendarz `source='wieikschedule'`; `account_id` wskazuje połączenie.

## Zmiany w kodzie

### wieikschedule (`api/calendar-sync/`)

- `pair` — wymiana kodu na token (jedyny endpoint bez tokenu połączenia).
- `feed?from=&to=` — efektywne wystąpienia: `event_id`, rodzaj
  (źródło/dopisane/zmienione/odwołane), data, godzina, czas trwania, przedmiot,
  typ, grupa, sala, prowadzący, `external_version`, dni wolne. Zakres:
  od −14 do +150 dni. Wykorzystuje istniejące ładowanie planu i nakładki
  z `api/_lib/scheduleQueries.js` zamiast nowej implementacji.
- `changes` — `{event_id, operation, patch, expected_version, mode:"apply"|"propose", request_id}`;
  idempotentne po `request_id`; zwraca nowe wystąpienie albo 409/422.
- `links` — lista i odwołanie połączeń (Firebase ID token).
- UI: Menu → Integracje (kod, lista, odwołanie, ostatnie użycie).

### Odysseus (nowa gałąź od `fix/google-calendar-sync`)

- `src/wieik_calendar_sync.py` — klient, pobieranie, aktualizacja lustra
  z zachowaniem lokalnych metadanych, usuwanie wyłącznie wierszy lustra.
- `routes/calendar_routes.py` — dla kalendarza `wieikschedule` create/update/delete
  przechodzą przez write-through; niedozwolone pola odrzucane przed zapisem.
- `src/tools/calendar.py` — ten sam kalendarz: wyłącznie podgląd zmiany.
- `src/builtin_actions.py` — `tidy_calendar` z filtrem właściciela i z pominięciem
  kalendarzy zarządzanych (poprawka niezależna od integracji).
- `static/js/calendar.js` — oznaczenie kalendarza planu, akcja „Przywróć”,
  stan synchronizacji (ostatnie pobranie, błąd), czytelne komunikaty 409/422.
- Ustawienia — łączenie, stan i rozłączenie.
- Harmonogram zadań — okresowe pobieranie dla kont z aktywnym połączeniem.

## Stan realizacji (21.10.2026)

- **E0 gotowe.** Główny Odysseus (`odysseus-odysseus-1`) działa na obrazie zbudowanym
  z niezatwierdzonego checkoutu `dev`; błąd `_create_lendar_reminder` jest aktywny.
  Stagingowy `odysseus-local` montuje worktree wskazany w `ODYSSEUS_INTEGRATION_ROOT`.
- **E1 zaimplementowane i wdrożone na stagingu**, bez głównego Odysseusa i produkcji:
  - wieikschedule `feat/odysseus-calendar-sync`: migracja `20261021_calendar_links.sql`,
    `api/calendar-sync/{links,pair,feed,unlink}`, Opcje → „Kalendarz w Odysseusie”
    za flagą `REACT_APP_CALENDAR_SYNC`, zapis `subjectName` w dodatkowych grupach;
  - Odysseus `feat/wieik-calendar-sync` (z `fix/google-calendar-sync`): kalendarz
    `Plan zajęć` tylko do odczytu, ustawienia kalendarza → „Plan zajęć wieikschedule”,
    pobieranie przy otwarciu, ręcznie i co 15 min (gdy pollery są włączone),
    `tidy_calendar` z filtrem właściciela.
  - Testy: Node 33, React 68, SQL `calendar-links-test.sql`, Python 11 nowych
    i 342 powiązanych z kalendarzem/planem; syntetyczna próba
    pair → błąd zestawu → rozłączenie z unieważnieniem tokenu na stagingu.
- **Do zrobienia w E1:** próba z zalogowanym użytkownikiem (prawdziwy zestaw grup
  z Firestore). Na stagingu pobieranie okresowe jest wyłączone
  (`ODYSSEUS_INPROCESS_POLLERS=0`), działa przy otwarciu kalendarza i ręcznie.
- Istniejące dodatkowe grupy bez `subjectName` dają czytelny błąd feedu;
  wystarczy ponownie wybrać przedmiot w aplikacji.
- **E1 potwierdzone przez użytkownika** na stagingu (konto `admin`, EiAs3, „Zestaw 1”).
- **E2 zaimplementowane i wdrożone na stagingu (21.10.2026):**
  - wieikschedule: migracja `20261022_calendar_writes.sql` (provider
    `odysseus-calendar`), `api/calendar-sync/changes` (modify/remove/restore,
    kontrola wersji wystąpienia, scalanie z wcześniejszym patch, idempotencja po
    `request_id`, tryb `propose` dla E3) i `api/calendar-sync/confirm`;
  - Odysseus: przesunięcie, długość i sala zapisują się od razu jako prywatna zmiana;
    usunięcie = prywatne odwołanie albo usunięcie dopisku; „Przywróć termin”
    w formularzu i lista odwołanych w ustawieniach; tytuł/opis/powtarzanie
    zablokowane; odświeżanie co 3 min przy otwartym kalendarzu i co 15 min w tle.
  - Próba na żywo: zmiana sali z Odysseusa → override w Supabase, źródło bez
    zmian → przywrócenie → 0 overrides.
- **E3 zaimplementowane i wdrożone na stagingu (21.10.2026):** `manage_calendar`
  na „Planie zajęć” tworzy wyłącznie podgląd (`mode: propose`) i mówi modelowi, że
  zmiana nie jest zapisana; zatwierdzenie i odrzucenie tylko przez trasy UI kalendarza
  (`/api/calendar/wieik/proposals/{id}/confirm|reject`, sesja zalogowanego użytkownika,
  tokeny API odrzucone). Lista „Do zatwierdzenia” w ustawieniach kalendarza i
  powiadomienie o nowej propozycji. wieikschedule: `api/calendar-sync/proposals|reject`,
  `api/schedule/reject`; propozycje widać też w panelu „Mój plan”, a odrzucenie tam
  wygasza je również w Odysseusie.
  Próba na żywo: propozycja agenta → bez zmian w planie → odrzucenie → ponowna
  propozycja → zatwierdzenie → przywrócenie; 0 overrides i 0 otwartych podglądów.
- **Pozostaje:** E4 (zastąpienie starego kalendarza `timetable` w głównym Odysseusie,
  wymaga zgody, bo dotyczy działającej instancji) i E5 (wydanie produkcyjne razem
  z etapem 7 ROADMAP).

- **Oszczędny transfer przed wydaniem (21.10.2026, gałąź `perf/plan-versions`):** migracja
  `20261023_plan_versions_and_hygiene.sql` — tabela `timetable_versions` z triggerem na `events`
  (wersja rośnie tylko przy faktycznej zmianie wiersza), indeksy planu i dopisków, jeden aktywny
  dopisek na zajęcia, `ON DELETE CASCADE` dla danych konta, czyszczenie wygasłych podglądów (30 dni)
  i kodów (1 dzień). Przeglądarka pobiera semestr stronami po 1000 wierszy i tylko po zmianie wersji,
  listę planów z `timetable_versions`, nie odświeża ukrytej karty i nie zapisuje do Firestore
  niezmienionych ustawień ani oglądanego tygodnia. Feed dla Odysseusa liczy ETag z wersji i prywatnych
  wierszy przed wczytaniem planu; Odysseus pobiera w tle co 15 min. Test SQL:
  [plan-versions-test.sql](plan-versions-test.sql). Kopia przed migracją:
  `.staging/backups/before-plan-versions-*.sql`.

Wycofanie E2 na stagingu: obraz `wieikschedule-staging-app:before-calendar-writes`,
kopie `*before-calendar-writes-*`.

Wycofanie stagingu: obraz `wieikschedule-staging-app:before-calendar-sync`,
kopie `.staging/backups/*before-calendar-*`, poprzedni
`ODYSSEUS_INTEGRATION_ROOT=/home/cedwukropek/odysseus-schedule-providers`.
Nowe tabele można zostawić; nie zmieniają istniejących danych.

## Etapy i warunki ukończenia

### E0. Decyzje i punkt wyjścia

D1–D4 zatwierdzone 21.10.2026. Ustalenie, z którego commita zbudowano obraz
`odysseus-custom:local` (używają go oba kontenery Odysseusa). Kopia `app.db`
przed jakąkolwiek migracją.

**Gotowe, gdy:** wiadomo, na czym budujemy i jak wrócić do poprzedniego obrazu.

### E1. Lustro tylko do odczytu

Parowanie, `feed`, kalendarz `wieikschedule` w stagingowej kopii Odysseusa
(`odysseus-local`, port 7001), okresowe pobieranie, poprawka `tidy_calendar`.

**Gotowe, gdy:** prywatna zmiana zatwierdzona w wieikschedule pojawia się
w Odysseusie po odświeżeniu; zmiana zestawu grup zmienia lustro; konto B nie
widzi planu A; odwołanie tokenu daje czytelny błąd, a lustro zostaje
nienaruszone i oznaczone jako nieaktualne.

### E2. Zapis z kalendarza Odysseusa

Przesunięcie, sala, odwołanie, przywrócenie i usunięcie dopisku z UI Odysseusa.

**Gotowe, gdy:** przesunięcie labu w Odysseusie jest widoczne w tygodniu
wieikschedule, w ICS i w odpowiedzi agenta planu; `events` pozostaje bez zmian;
ponowione żądanie nie tworzy drugiej zmiany; zmiana źródła w międzyczasie daje
409, odświeżenie i komunikat; weekend lub godzina 23:00 dają 422 bez zmiany lustra.
Automaty nie wywołują zapisu.

### E3. Zmiany proponowane przez agenta Odysseusa

`manage_calendar` na kalendarzu planu tworzy podgląd, potwierdzany zgodnie z D3.

**Gotowe, gdy:** żadne wywołanie modelu nie zmienia planu bez kliknięcia
użytkownika; podgląd wygasa po 10 minutach jak dotychczas.

### E4. Zastąpienie kalendarza `timetable` w głównym Odysseusie

Skrypt z trybem próbnym: raport dopasowań (171/41/10/3 jak wyżej), przeniesienie
lokalnych metadanych i przypomnień na lustro, archiwizacja starego kalendarza
(ukryty, nieusunięty). Usunięcie archiwum dopiero po Twojej akceptacji.

**Gotowe, gdy:** w głównym Odysseusie jest jeden plan zajęć bez duplikatów,
z zachowanymi przypomnieniami.

### E5. Produkcja

Razem z etapem 7 ROADMAP: migracja Supabase na kopii, potem produkcja; flaga
wyłączająca synchronizację; poprzednie obrazy jako ścieżka wycofania.

## Testy

- Python (Odysseus): mapowanie pól, walidacja, idempotencja, 409/422, zachowanie
  lokalnych metadanych, `tidy_calendar` z izolacją właścicieli, brak zapisu z automatów.
- Node (wieikschedule): hash i odwołanie tokenu, wygaśnięcie kodu, izolacja A/B,
  `ETag`, CAS, idempotencja `request_id`.
- SQL: rozszerzenie [database-test.sql](database-test.sql) o nowego providera
  i uprawnienia `calendar_links`.
- Staging end-to-end według scenariuszy z warunków ukończenia E1–E3.

## Poza zakresem

Własne wydarzenia niezależne od zajęć (etap 6 ROADMAP), wysyłanie planu do
Google Calendar z Odysseusa, edycja prowadzącego w Odysseusie, agent n8n.
