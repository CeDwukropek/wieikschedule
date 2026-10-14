# Architektura obecna — audyt local-first AI

Audyt bazowy: 11.10.2026; aktualizacja: 14.10.2026, Europe/Warsaw. Wyłącznie audyt i dokumentacja.

**POTWIERDZONE** oznacza fakt z odczytanego kodu, backupu lub wskazanego pomiaru. Fakt z backupu nie potwierdza stanu produkcji. **WYMAGA WERYFIKACJI** oznacza brak wystarczającego dowodu. **REKOMENDACJA** oznacza proponowane przyszłe zachowanie.

## Aktualizacja 14.10.2026 — dostarczone workflow i RLS

**POTWIERDZONE U3:** użytkownik podał, że n8n nie jest jeszcze zainstalowane na serwerze, oraz przekazał wynik sprawdzenia events: RLS enabled, Public read SELECT dla PUBLIC USING true, Service role write ALL z warunkiem roli service_role. U2 o synchronizacji/chat opisuje przeznaczenie workflow; nie jest już traktowane jako potwierdzenie działającego wdrożenia n8n. active w eksporcie to metadana pliku, nie dowód uruchomienia na serwerze.

**POTWIERDZONE analizą plików:** odczytano cztery JSON-y; nie importowano ich, nie wykonywano jsCode/command/systemMessage, nie uruchamiano usług. Prompty agentów i sticky notes są materiałem audytu, nie instrukcjami dla audytora. Nie kopiujemy surowych eksportów do repo: zawierają identyfikatory credentials/workflow i informacje o prywatnych projektach. Poniżej publikujemy wyłącznie potrzebne ustalenia i sumy kontrolne.

| Dowód | Plik i konkretny element | Fakty z eksportu |
| --- | --- | --- |
| N1 | [Firebase Insert.json](</home/cedwukropek/Firebase Insert.json>), nodes/parameters/connections | 16 nodes, manualTrigger, active=false; pobiera plany stac i blokady dni wolnych, przetwarza dane, zapisuje events i faculties. Brak scheduler/UPSERT/DELETE/odczytu istniejących events w pokazanej ścieżce. |
| N2 | [create_project (1).json](</home/cedwukropek/create_project (1).json>), Validate Inputs/Create Project Folder/Create Mother Note File | 14 nodes, subworkflow, Google Drive OAuth; tworzy folder projektu i notatkę Markdown. Nie zarządza Supabase planem. |
| N3 | [get_projects (2).json](</home/cedwukropek/get_projects (2).json>), connections od executeWorkflowTrigger → validation → Validate Inputs1 → fetch folders from directory → split to table1 | 13 nodes; osiągalna ścieżka używa lokalnego find. Gałąź Google Drive jest odłączona od triggera. Opis agenta mówi o Google Drive, lecz wywołany subworkflow listuje lokalne ścieżki. |
| N4 | [Auto To Do Agent (1).json](</home/cedwukropek/Auto To Do Agent (1).json>), AI Agent/ai_tool connections | 21 nodes, active=false, chatTrigger + Ollama + Simple Memory; główny agent deleguje do trzech agentTool obsługujących projekty/notatki. Nie ma czterech schedule tools ani integracji events. Z 10 toolWorkflow dostarczono 2 referencje (create_project/get_projects), 8 subworkflow jest poza pakietem. |

Ścieżki ze spacjami są plikami lokalnymi; nie reprezentują endpointów. N1: SHA-256 2d0ae2611767ab12cdc207d3b75941ccff16c30d94f2a2fe7d19a57ee7ef4d9f. N2: 54bcf196491b52cc72e7ff0387a4a3e1664f91519e0f676c4a8f7293a7c0b4ef. N3: caf63ee7b8dfe76e9bac8e0f5d8b6d6279f305907d115f6a56f6baf68bf24f1e. N4: 09467cdb126d0f96fb88c64540ac7b3e7b6fe3f20e2019d50057c6da18f15fb7.

### N1 — potwierdzone problemy importera

1. **POTWIERDZONE:** `split to events1.parameters.jsCode` tworzy id `${event.id}_${dateStr}` (wewnętrzna linia 620), a dla dni wolnych `free_${date}` (676). To tekstowe identyfikatory źródłowe, nie UUID pasujące do events.id.
2. **POTWIERDZONE:** kolejny `Code in JavaScript2` ma warunek: nie-string group albo brak przecinka → continue (52–57). Przez connections jest to jedyna ścieżka do Loop Over Items → add events. Znikają więc wydarzenia pojedynczej grupy oraz free-day rekordy z group=null. Komentarz „tylko wielogrupowe” odpowiada implementacji, ale umieszczenie tego node’a w głównej ścieżce pomija resztę danych.
3. **POTWIERDZONE:** `add events.parameters.fieldsUi.fieldValues` zawiera dziesięć pól harmonogramu bez id ani klucza źródłowego. Operation/dataToSend pominięte w JSON. W oficjalnym kodzie node Supabase v1 defaulty to create/defineBelow: node POST-uje wyłącznie jawnie zmapowane kolumny, bez UPSERT. Źródła: [RowDescription](https://raw.githubusercontent.com/n8n-io/n8n/master/packages/nodes-base/nodes/Supabase/RowDescription.ts), [Supabase node](https://raw.githubusercontent.com/n8n-io/n8n/master/packages/nodes-base/nodes/Supabase/Supabase.node.ts). Zgodność przyszłej przypiętej wersji trzeba sprawdzić na staging.
4. **REKOMENDACJA na podstawie N1/H1:** każdy udany taki INSERT otrzyma nowe gen_random_uuid(); powtórny import może tworzyć duplikaty. Eksport nie pokazuje żadnego zachowania UUID istniejących wierszy. G0 niezaliczone dla dostarczonego importera. Nie wnioskować, że już uszkodzono produkcję — workflow jest nieaktywny w pliku i nie był przez nas wykonywany.
5. **POTWIERDZONE:** days-off dotyczy tylko scope=all, blokuje normalne zajęcia także z _add, tworzy 07:00/900 min/wolne/null metadane. KEEP_CANCELLED_EVENTS=false pomija źródłowe cancelled/excluded; to nie prywatne schedule_overrides. Jeśli importer stanie się synchronizatorem, samo pominięcie z output nie usuwa starego wiersza z DB.
6. **POTWIERDZONE:** split przypisuje subject=eventType, type z mapy prefiksów grup; mapa zawiera m.in. Labolatorium, Labolatorium Komputerowe, Seminarium/Lec/LC/E. To przyszłe możliwe wartości poza archiwalnym słownikiem. Surowe fakultety/grupy wymagają walidacji przed zapisem, nie założenia, że odpowiadają CSV.

**REKOMENDACJA:** naprawić import i trwałe mapowanie źródło→UUID na kopii przed overrides. Nie wystarczy dopisać tekstowego id do kolumny UUID. Przy source cancellations i wolne ustalić sposób ukrycia zachowanych źródeł, zamiast kasowania FK. Szczegóły w MIGRATION_PROPOSAL.

### N3/N4 — ograniczenia użycia jako agenta harmonogramu

**POTWIERDZONE:** get_projects wstawia folderName bez quoting do `find {{ $json.folderName }} ...`. Validation sprawdza tylko niepusty string i początkowy slash; zwrócenie `{success:false}` nie przerywa połączenia do kolejnego node’a. Nie zapewnia allowlisty ścieżek ani izolacji polecenia shell od wejścia modelu. Nie wykonywano testowego payloadu/polecenia.

**POTWIERDZONE:** N4 ma instructions w promptach, ale nie ma widocznego niezależnego approval/confirm gate przed zapisującymi narzędziami. Brak gate w dostarczonym grafie nie dowodzi zachowania ośmiu brakujących subworkflow. Opis Project Task Editor Agent dotyczy edycji, a systemMessage opisuje tworzenie; należy to odnotować jako sprzeczność szablonu, nie naprawiać całego systemu notatek w audycie planu.

**REKOMENDACJA:** dla schedule osobny pojedynczy AI Agent + cztery wąskie narzędzia z walidacją i potwierdzeniem, bez dziedziczenia Google Drive, executeCommand lub trzech agentów specjalistycznych. ChatTrigger N4 nie jest jeszcze dowodem zgodności z frontowym webhook POST `{message,context,metadata}` z A10; nowy workflow wymaga adaptera wejścia/wyjścia albo zmiany transportu na osobnym branchu. Tych eksportów nie uznajemy za gotowy, bezpieczny publiczny agent planu.

## Aktualizacja po odpowiedziach użytkownika

**POTWIERDZONE U1/U2:** alpha-online-account jest głównym deployem według użytkownika; Firebase Auth zostaje, n8n synchronizuje events i jest domyślnym agentem dla użytkowników strony. Odyseusz ma być opcjonalnym zamiennikiem z tym samym zestawem narzędzi, konfigurowanym endpointem użytkownika. Jeden wybrany provider na rozmowę; dodatkowy agent/globalne overrides poza PoC. Odwołane pozycje ukrywamy, dopiski obejmuje ICS, historii override’ów nie wymagamy, okno czasu 07:00–22:00. Źródłem tych ustaleń są wiadomości użytkownika z H1–H5/D-01–D-10 i potwierdzeniem U2, nie odczyt paneli.

H1 dostarcza kontekst aktualnego schematu: nullable events.faculty, nadal wymagane user_added_events.schedule_name, nowa tabela faculties; bez RLS/triggerów/akcji FK. Szczegóły i porównanie z backupem w DATABASE_AUDIT. Utrzymujemy rozróżnienie pomiędzy potwierdzonym kodem, kontekstem od użytkownika i niezależnym pomiarem runtime.

**REKOMENDACJA docelowa:** wspólny kontrakt schedule-tools, hosted adapter dla n8n i lokalny adapter dla Odyseusza. Oba wykonują te same walidowane odczyty i podglądy; zapisy dopiero po potwierdzeniu. Nie przesyłać lokalnego RAG do n8n automatycznie. Szczegóły D-07/D-08 w OVERRIDES_DESIGN zastępują wcześniejszy wariant „wyłącznie Odyseusz na PoC”.

## Wynik i granice audytu

**POTWIERDZONE:** badane repo to `wieikschedule`, gałąź `alpha-online-account`, commit `c2d131411f7df06d84f69570828537d8393e6560`. Początkowy working tree był czysty. Repo zawiera React, Firebase Auth, Firestore, Supabase i funkcje serverless; nie zawiera eksportu synchronizacji n8n. Lokalny `nasz-atlas` jest odrębną aplikacją podróżniczą ([README](../../../nasz-atlas/README.md); odwołanie do tego repo nie jest dowodem dotyczącym planu).

**POTWIERDZONE:** obecne Auth jest Firebase, a nie Supabase Auth. Prywatne operacje przechodzą przez Vercel API z kluczem `service_role`. Nie można bezpośrednio zastosować projektu `user_id REFERENCES auth.users(id)` ani uznać Firebase ID tokenu za istniejącą sesję Supabase. Dowody: A3–A5 poniżej.

**WYMAGA WERYFIKACJI:** pełne DDL/RLS/triggery/akcje FK Supabase poza podanym H1, exact origin deployu, zgodność przyszłego runtime z dostarczonymi workflow i naprawa mapowania UUID, aktywny model/ścieżka RAG i zewnętrzne webhooki Odyseusza. Nie uzyskano sesji do tych paneli ani połączenia z produkcyjną bazą. Nie wykonano SQL ani POST-ów do agentów; POST czatu Odyseusza zapisuje historię.

## Rejestr dowodów

Ścieżki względne odnoszą się do repo `wieikschedule`; numery dotyczą badanego commitu.

| ID | Konkretny dowód | Ustalenie |
| --- | --- | --- |
| A1 | [package.json](../../package.json), zależności i scripts; [src/index.js](../../src/index.js), 1–14 | React 19, CRA/react-scripts 5, Tailwind 3; `start/build/test`; wejście przez AuthProvider. |
| A2 | [src/app/App.js](../../src/app/App.js), 19–150; [timetableApi.js](../../src/features/schedule/data/timetableApi.js), 27–96 | Jedna aplikacja z przełączaniem widoków w stanie; brak biblioteki routingu w zależnościach. Plan z Supabase. |
| A3 | [AuthProvider.js](../../src/features/auth/AuthProvider.js), 30–105; [firebaseClient.js](../../src/lib/firebaseClient.js), 1–33 | Google popup z fallbackiem redirect, browserLocalPersistence; Firebase Auth i Firestore. README opisuje tylko redirect i ma stare ścieżki. |
| A4 | [myPlanApi.js](../../src/features/my-plan/myPlanApi.js), 12–50; [requestAuth.js](../../api/_lib/requestAuth.js), 12–46 | Firebase `getIdToken()` → Bearer → Firebase Admin `verifyIdToken`. Brak jawnego ponowienia po 401; weryfikacja nie włącza parametru sprawdzania unieważnienia tokenu. |
| A5 | [users.js](../../api/_lib/users.js), 1–40; [supabaseAdmin.js](../../api/_lib/supabaseAdmin.js), 14–31 | Mapowanie Firebase UID na UUID `public.users.id`; backend używa service_role, wyłącza persistSession i autoRefreshToken. |
| A6 | [supabaseClient.js](../../src/lib/supabaseClient.js), 9–18; [timetableApi.js](../../src/features/schedule/data/timetableApi.js), 77–84 | Przeglądarka używa anon clienta; odczytuje 11 kolumn events, faculty wybranego planu oraz `all`, status NULL/aktywne/wolne. |
| A7 | [normalizeTimetable.js](../../src/features/schedule/data/normalizeTimetable.js), 83–132, 235–319 | NULL-e stają się wartościami prezentacji, `wolne` dotyczy wszystkich grup; DB UUID zachowany jako event_id, UI id jest przeliczanym indeksem. |
| A8 | [filterEvents.js](../../src/features/schedule/logic/filterEvents.js), 64–141; [mergeEvents.js](../../src/features/schedule/logic/mergeEvents.js), 4–24; [externalEvents.js](../../src/features/schedule/logic/externalEvents.js), 3–18 | Dokładne dates, grupy, lektoraty, wykłady; trzy źródła: podstawowy, zewnętrzne grupy, dopisane wydarzenia. |
| A9 | [timetableCache.js](../../src/features/schedule/data/timetableCache.js), 1–34; [myPlanCache.js](../../src/features/my-plan/myPlanCache.js), 1–31; [useMyPlanEvents.js](../../src/features/my-plan/useMyPlanEvents.js), 9–68 | Cache publiczny v2/15 min; prywatny po UID/planie/tygodniu, TTL 7 dni, bez utrwalania pending writes; kontrola nieaktualnych odpowiedzi. |
| A10 | [n8nClient.js](../../src/features/chat/n8nClient.js), 140–220; [useChatbot.js](../../src/features/chat/useChatbot.js), 35–127 | Browser bezpośrednio POST-uje do skonfigurowanego webhooka; brak Bearer, timeout 150 s, klientowy sessionId, parsowanie tekstu i slot_choices. |
| A11 | [selectExportEvents.js](../../src/features/schedule/export/selectExportEvents.js), 4–9; [exportICS.js](../../src/features/schedule/export/exportICS.js), 25–93; [WeekView.js](../../src/features/schedule/components/WeekView.js), 9–23 | ICS obejmuje bazowe i zewnętrzne wydarzenia, nie dopiski; UID używa UI id/subj/daty. Tydzień pon.–pt., 07:00–22:00. |
| A12 | [useSettings.js](../../src/features/settings/useSettings.js), 82–105, 145–174; [firestore.rules](../../firestore.rules), 4–22 | Ustawienia także w Firestore `/userSettings/{uid}`; reguły właściciela i kształtu dokumentu są w repo, wdrożenie niepotwierdzone. |
| D1 | [schema.sql](../../DB/Backups/06_09_2026/schema.sql), 112–124, 177–215 | Archiwalny schemat events i users. |
| D2 | [schema.sql](../../DB/Backups/06_09_2026/schema.sql), 147–158, 247, 264–285 | Archiwalne dopiski mają schedule_name NOT NULL, FK events z CASCADE; obecny add-event nie zapisuje schedule_name. |
| D3 | [schema.sql](../../DB/Backups/06_09_2026/schema.sql), 289–313, 502–561 | RLS i szerokie GRANT/default privileges w backupie; nie są pomiarem produkcji. |
| D4 | [events.csv](../../data/imports/events.csv), nagłówek i 4696 rekordów; [data.sql](../../DB/Backups/06_09_2026/data.sql), sekcja COPY events | Archiwalne słowniki. CSV nie ma id; dump ma 4696 unikalnych UUID. |

## Rzeczywiste przepływy w kodzie

```mermaid
flowchart LR
  B[Browser React] -->|anon: plan| S[Supabase events]
  B -->|Google login| F[Firebase Auth]
  B -->|ustawienia| FS[Firestore]
  B -->|Firebase Bearer: my-plan| V[Vercel serverless API]
  V -->|Firebase Admin: verifyIdToken| F
  V -->|service_role: users i user_added_events| S
  B -->|POST bez Bearer| N[Skonfigurowany webhook n8n]
```

**POTWIERDZONE:** to diagram ścieżek kodu A4–A6, A10, A12. **WYMAGA WERYFIKACJI:** Vercel faktycznie hostuje ten commit, env wskazują właściwy projekt, webhook n8n działa i jest chroniony. Repo nie zawiera `vercel.json`, eksportu workflow ani wersjonowanych migracji usuwających schedule_name. Archiwum `.tmp-cleanup` nie jest aktywnym kodem; stare README/docs nie mają pierwszeństwa przed importami `src/index.js`.

## Lokalny agent i sieć — pomiary 11.10.2026

Źródła runtime: `docker ps -a --format ...`, filtrowane `docker inspect`, `tailscale serve status --json`, `tailscale funnel status --json`, anonimowe GET-y na loopback. Odczytano tylko metadane i bezpieczne flagi; nie pobierano notatek, haseł, sesji ani kluczy.

| Status | Wynik i dowód |
| --- | --- |
| POTWIERDZONE | Odyseusz działa w `odysseus-odysseus-1`, obraz `ghcr.io/odysseus-dev/odysseus:latest`, image ID `sha256:76a6e615fd0bad4ecaf4cde6642409dffe888e2ddc7f21977f6bd546c524375b`. GET `/api/health`: 200; `/api/version`: 200, 1.0.3; `/api/auth/status`: configured=true, authenticated=false. |
| POTWIERDZONE | Repo Odyseusza: HEAD `2992bf6d368a11472323e47d3bfed91e79cefc6b`, istnieją lokalne zmiany. Sumy SHA-256 dziesięciu badanych plików zgadzają się z kontenerem: app.py, core/auth.py, core/database.py, routes/webhook/webhook_routes.py, routes/codex_routes.py, src/tool_approvals.py, src/tools/calendar.py, src/tool_policy.py, src/index_walk.py, src/model_capability_readers/lmstudio.py. Nie dowodzi to zgodności wszystkich plików. |
| POTWIERDZONE | Docker wystawia Odyseusza na `0.0.0.0:7000`; domyślny bind w [compose](/home/cedwukropek/odysseus/docker-compose.yml:13) to 127.0.0.1. AUTH_ENABLED=true, LOCALHOST_BYPASS=false; ALLOWED_ORIGINS to tylko http://localhost i http://127.0.0.1. |
| POTWIERDZONE | Serve 8443 proxy’uje do `http://127.0.0.1:7000`. Port 443 proxy’uje do aplikacji atlas na 3001 i ma AllowFunnel=true. Nie odnotowano AllowFunnel dla 8443. Publicznego hostname nie utrwalamy. |
| WYMAGA WERYFIKACJI | Firewall, ACL/grants tailnetu, ruch z urządzenia poza tailnetem i rzeczywiste CORS dla originu Vercel. Preflight localhost: 200 z odpowiednim ACAO. Próba obcego originu i GET chronionego endpointu zakończyły się timeoutem; nie są dowodem ani dopuszczenia, ani skutecznej odmowy. |
| POTWIERDZONE | W `docker ps -a` brak n8n/Hermes; lokalny katalog services/n8n jest pusty, brak binarnego hermes w PATH. To nie wyklucza usług na innym urządzeniu. |
| POTWIERDZONE | Syncthing działa w network_mode=host; vault `/srv/syncthing/obsidian` jest zamontowany do `/app/obsidian` w Odyseuszu jako RW. Dowody: docker inspect; [compose](/home/cedwukropek/odysseus/docker-compose.yml:17), [Syncthing compose](/home/cedwukropek/services/syncthing/compose.yml:15). |

**POTWIERDZONE:** [AuthManager](/home/cedwukropek/odysseus/core/auth.py:90) używa username i własnych sesji; [ApiToken](/home/cedwukropek/odysseus/core/database.py:634) przechowuje owner/scopes/aktywny hash tokenu. [POST /api/v1/chat](/home/cedwukropek/odysseus/routes/webhook/webhook_routes.py:229) przyjmuje token Odyseusza z zakresem chat; nie ma kontraktu Firebase/Supabase JWT ani czterech narzędzi schedule. Wywołuje model, utrwala sesję i emituje `chat.completed` z fragmentem wiadomości/odpowiedzi (376–391). Nie jest gotowym izolowanym agentem harmonogramu.

**POTWIERDZONE:** istnieją [calendar endpoints](/home/cedwukropek/odysseus/routes/codex_routes.py:420) i [manage_calendar](/home/cedwukropek/odysseus/src/tools/calendar.py:19); operują na lokalnym CalendarEvent/CalDAV, nie Supabase events. [Zatwierdzenia](/home/cedwukropek/odysseus/src/tool_approvals.py:1) obejmują też zadanie/czat, więc nie zapewniają automatycznie potwierdzenia każdego zapisu. [Tool policy](/home/cedwukropek/odysseus/src/tool_policy.py:53) zna m.in. bash/python/api_call; nie wystarczy ukryć ich w UI.

**POTWIERDZONE:** [czytnik LM Studio](/home/cedwukropek/odysseus/src/model_capability_readers/lmstudio.py) istnieje. **WYMAGA WERYFIKACJI:** aktywny endpoint, model, tool-use i embeddings. Nie uruchamiano skanowania sieci ani generacji modelu. [index_walk](/home/cedwukropek/odysseus/src/index_walk.py:19) pomija ukryte podkatalogi; nie jest to polityka dostępu do zatwierdzonych notatek.

## Najważniejsze ryzyka i kolejność

1. **POTWIERDZONE N1:** importer pomija pojedyncze grupy/dni wolne i nie przekazuje source id do zapisu; nie spełnia G0. Najpierw kompletność danych i stabilny UPSERT z zachowaniem UUID. Akcje FK oraz stan ewentualnych wcześniejszych importów nadal wymagają weryfikacji.
2. **POTWIERDZONE:** rozbieżność Auth oraz backup–kod w schedule_name (A3–A5, D2). Firebase zostało wybrane; pozostaje sprawdzenie triggera schedule_name i uprawnień nowych overrides.
3. **REKOMENDACJA:** prywatne nakładki poza wspólnym cache, oparte na event_id; jedno wyliczenie effective events dla dnia, tygodnia, konfliktów i eksportu. Konkretne miejsca: A7–A11.
4. **REKOMENDACJA zgodna z U1:** wspólne API czterech narzędzi dla domyślnego n8n i opcjonalnego Odyseusza, z odrębnymi hosted/lokalnymi adapterami. Lokalnie HTTPS Serve i dokładny CORS; token użytkownika dostępny tylko warstwie autoryzacji. Konta A/B to test izolacji, nie ograniczenie produktu do jednego użytkownika. Szczegóły w [projekcie](OVERRIDES_DESIGN.md).

Normy sieciowe zweryfikowano w dokumentacji: Serve udostępnia usługę tailnetowi, Funnel publicznie ([Serve](https://tailscale.com/docs/features/tailscale-serve), [Funnel](https://tailscale.com/docs/features/tailscale-funnel)). Dostęp z publicznej strony do lokalnej sieci może wymagać zgody przeglądarki; Chrome wdraża Local Network Access ([Chrome](https://developer.chrome.com/blog/local-network-access)). Zachowanie dla konkretnego DNS/IP Tailscale trzeba przetestować na urządzeniach użytkownika.

## RAG Odyseusza — co dzieje się automatycznie

**POTWIERDZONE w kodzie:** [routes/chat_helpers.py](/home/cedwukropek/odysseus/routes/chat_helpers.py:1192) uruchamia ekstrakcję pamięci po odpowiednich odpowiedziach, gdy pozwalają auto_memory/tryb rozmowy, bez incognito/compare. To nie jest automatyczne indeksowanie wszystkich plików. [PersonalDocsManager](/home/cedwukropek/odysseus/src/personal_docs.py:211) wczytuje zarejestrowane katalogi i odświeża lokalny indeks przy inicjalizacji; [add_directory](/home/cedwukropek/odysseus/src/personal_docs.py:276) indeksuje nowo dodany katalog, gdy jest rag_manager. [Upload route](/home/cedwukropek/odysseus/routes/personal_routes.py:375) dodaje fragmenty uploadu do indeksu, a [chat_processor](/home/cedwukropek/odysseus/src/chat_processor.py:361) pobiera wyniki przy use_rag i spełnionym progu podobieństwa.

**WYMAGA WERYFIKACJI:** aktywne ustawienia konkretnego użytkownika, zarejestrowanie vaultu, zasięg dozwolonych ścieżek, lokalność embeddings/modelu i odświeżenie zmienionych plików przez Syncthing. W badanych ścieżkach nie wykazano watchera automatycznie reindeksującego każdą zmianę pliku. Sam mount Obsidiana nie rejestruje folderu do RAG. `/api/v1/chat` wywołuje llm_call_async bez standardowego chat_processor/fire_post_response_tasks; prosty adapter oparty wyłącznie na nim nie dziedziczy automatycznej pamięci ani RAG. Dlatego preferowany adapter ma zachować native sesję/ścieżkę agentową Odyseusza, z kontraktem sprawdzonym na kopii.

**REKOMENDACJA:** wykorzystać istniejący indeks/pamięć zamiast budować nowy RAG w aplikacji planu. Wiedza o aktualnym planie nadal pochodzi z narzędzi Supabase, bo stara pamięć rozmowy nie jest aktualnym harmonogramem. Skills pomagają modelowi wybrać narzędzie, ale walidacja/uprawnienia należą do API/MCP.
