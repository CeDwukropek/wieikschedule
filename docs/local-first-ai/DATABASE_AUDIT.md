# Audyt bazy i tożsamości

Data: 11.10.2026. Statusy i dowody A/D odnoszą się do [rejestru](ARCHITECTURE_AS_IS.md). Nie połączono się z produkcyjnym Supabase. SQL poniżej to wyłącznie zapytania do przyszłego odczytu, nie wykonane operacje.

## Aktualizacja H1 — schemat przekazany przez użytkownika

**POTWIERDZONE U1:** użytkownik przekazał kontekst schematu 11.10.2026 z ostrzeżeniem, że nie jest przeznaczony do wykonania. Nie wykonano jego CREATE TABLE. Ten materiał ma pierwszeństwo przed backupem w opisanych poniżej różnicach; nie stanowi pełnego schema-only dumpu z politykami, triggerami i indeksami.

| Obiekt | Potwierdzone w przekazanym H1 | Zmiana względem wcześniejszego audytu |
| --- | --- | --- |
| events | id UUID/default gen_random_uuid; date/start_time/duration_min/subject NOT NULL; instructor/room/group/type/status nullable; duration default 90 | faculty jest nullable. Loader `.in(faculty,[plan,all])` pomija wiersze z NULL faculty; znaczenie takich wierszy trzeba ustalić na danych, nie zgadywać. |
| users | id UUID; firebase_uid TEXT UNIQUE NOT NULL; role student/admin/staff/starosta | Zachowane mapowanie Firebase UID→public.users.id; decyzja użytkownika: Firebase zostaje. |
| user_added_events | schedule_name TEXT NOT NULL, bez defaultu w pokazanym kontekście; user_id/event_id jako FK | Nie potwierdza komentarza w kodzie o usunięciu schedule_name. INSERT add-event 122–131 go nie podaje: bez uzupełniającego triggera insert będzie błędny. |
| tag_definitions | scope system/custom, color_hex z CHECK, nullable user_id FK users | W H1 nie pokazano archiwalnego CHECK powiązania scope z nullability user_id. Nie wnioskować, że nadal obowiązuje. |
| user_event_tags | user_id/event_id/tag_id FK oraz schedule_name NOT NULL | Jak w kodzie/backupie, zależy od stabilnego events.id; rzeczywiste akcje FK do odczytu. |
| faculties | id SMALLINT GENERATED ALWAYS AS IDENTITY, name/short_name VARCHAR NOT NULL | Nowa tabela względem badanego backupu. W obecnej gałęzi loader pobiera listę z events.faculty, nie z faculties; H1 nie zawiera FK wiążącego tekst events.faculty z faculties. |

**WYMAGA WERYFIKACJI:** H1 nie pokazuje ON DELETE/ON UPDATE, RLS, GRANT, default ACL, polityk, indeksów, triggerów ani ich funkcji. Nie wolno przenieść CASCADE z backupu na opis aktualnej produkcji. Gdyby wykonać dokładnie ten kontekst bez ON DELETE, obowiązywałyby domyślne akcje FK, ale nie wykonujemy go i nie przyjmujemy tego za pomiar istniejących constraintów. Potrzebny rzeczywisty wynik pg_get_constraintdef dla powiązań events oraz triggery user_added_events.

H1 częściowo zamyka odczyt typów/FK user_id; nie zamyka H1 uprawnień ani G0 synchronizacji. U2 potwierdza, że synchronizacja i chat działają w n8n. Nowe private overrides nie dostają FK do auth.users, ponieważ wybrano zachowanie Firebase i public.users. **REKOMENDACJA:** Firebase Third-party Auth z RLS to mały dodatek obsługi JWT nowych narzędzi, nie migracja loginu; konfiguracja i test claims pozostają przyszłym krokiem.

## Schemat potwierdzony wyłącznie w backupie

**POTWIERDZONE:** [schema.sql](../../DB/Backups/06_09_2026/schema.sql), 112–124, 189–190:

| events | Typ | NULL | Default / ograniczenie |
| --- | --- | --- | --- |
| id | uuid | nie | gen_random_uuid(), PK |
| faculty | text | nie | brak enum/CHECK |
| date | date | nie | brak ograniczenia zakresu |
| start_time | time without time zone | nie | brak CHECK; sekundy dozwolone w bazie |
| duration_min | integer | nie | 90; brak CHECK dodatniości |
| subject | text | nie | brak CHECK niepustego tekstu |
| instructor, room, group, type | text | tak | brak enum/CHECK |
| status | text | tak | aktywne; brak enum/CHECK |

Indeks `(faculty,date)` jest w linii 219. Nie ma source_id/source_key/upstream revision ani updated_at wydarzenia w tym backupie.

**POTWIERDZONE:** DB nie zamyka słowników status/faculty/group/type. Dopuszcza dowolny tekst; group/type/status dodatkowo SQL NULL. Listy zaobserwowane nie są enumami ani pełną specyfikacją produkcji. Klient ładuje tylko status NULL/aktywne/wolne i faculty aktualnego planu/all (A6). Inny status może istnieć w bazie, lecz zostać pominięty w UI.

**POTWIERDZONE:** `public.users.id` to UUID, `firebase_uid` to unikalny TEXT, role to student/admin/staff/starosta ([schema](../../DB/Backups/06_09_2026/schema.sql), 177–215). Kod mapuje zweryfikowany Firebase UID przez `users.js` (A5). FK dla nowych overrides powinien wskazywać `public.users(id)` przy zachowaniu tej tożsamości. Firebase UID nie wolno rzutować na UUID ani porównywać automatycznie z `auth.uid()`.

## Drift i istniejące prywatne dane

**POTWIERDZONE:** backup wymaga `user_added_events.schedule_name NOT NULL` oraz unikalności aktywnego wpisu po `(user_id,schedule_name,event_id)` (D2). [add-event.js](../../api/my-plan/add-event.js), 122–131, wstawia tylko user_id/event_id/reason/status. [added-events.js](../../api/my-plan/added-events.js), 119–122, komentuje usunięcie schedule_name. **WYMAGA WERYFIKACJI:** aktualne DDL; jeżeli produkcja nadal odpowiada backupowi, INSERT się nie powiedzie. Nie naprawiać na podstawie archiwum.

**POTWIERDZONE:** w backupie usunięcie events kaskadowo usuwa `user_added_events` i `user_event_tags` (264–285). Dlatego ryzyko DELETE+INSERT już dotyczy działających funkcji, nie tylko przyszłych override’ów. Nowy FK RESTRICT nie usuwa danych, ale może zablokować istniejący importer — sam FK nie rozwiązuje synchronizacji.

## RLS i uprawnienia z backupu

| Obiekt | POTWIERDZONE w schema.sql | Wniosek ograniczony do backupu |
| --- | --- | --- |
| events | RLS enabled; Public read FOR SELECT USING true; Service role write z auth.role=service_role (289–301) | Publiczny odczyt; nie widać polityki zwykłego zapisu. |
| tag_definitions | RLS enabled; SELECT wyłącznie scope=system (293,304) | Definicje custom nie mają widocznej polityki użytkownika. |
| users/user_added_events/user_event_tags | RLS enabled, brak polityk osobistych w pliku (307–313) | Zwykły anon/authenticated nie uzyskuje dostępu przez te polityki; service_role omija RLS. |
| wszystkie powyższe | GRANT ALL dla anon/authenticated/service_role (502–528) | Uprawnienia i RLS trzeba oceniać wspólnie, nie uznawać GRANT ALL za dowód wycieku. |
| przyszłe obiekty | DEFAULT PRIVILEGES postgres: szerokie granty tabel/funkcji (538–561) | Nowa tabela/funkcja wymaga jawnych REVOKE/GRANT i testu domyślnych uprawnień. |

`rls_auto_enable` jest funkcją event_trigger SECURITY DEFINER (48–74), ale sama definicja nie potwierdza podpięcia aktywnego event triggera. Trigger `validate_user_event_tag_ownership` istnieje w backupie (80–102,255); sprawdza własność custom tagu, nie stanowi pełnej autoryzacji wiersza. Kod nowych zapisów nie może używać Vercelowego supabaseAdmin w lokalnym agencie.

**POTWIERDZONE U1:** Firebase zostaje. **REKOMENDACJA:** wykorzystać Supabase Third-party Auth dla nowych narzędzi bez przekazywania service_role agentowi. Wymaga integracji wybranego projektu, `role=authenticated` i osobnego klienta z accessToken Firebase; nie migruje automatycznie public.users. Migracja dostawcy Auth nie należy już do planu. Oficjalny [opis integracji Firebase](https://supabase.com/docs/guides/auth/third-party/firebase-auth) potwierdza obsługę Firebase JWT oraz konfigurację claimu i klienta. Obecny anon client tej konfiguracji nie ma (A6).

## Słowniki i dane archiwalne

**POTWIERDZONE:** agregacja `COPY public.events` z [data.sql](../../DB/Backups/06_09_2026/data.sql) i analogicznej sekcji data-fixed.sql: 4696 rekordów, 4696 różnych id, daty 2025-05-07–2026-06-16, duration 45–900. Wszystkie badane kolumny events w tych sekcjach mają zero markerów SQL NULL (`\N`). CSV zawiera te same liczności słowników, lecz nie zawiera id. Dwa pliki tego samego backupu nie są dowodem zachowania UUID między synchronizacjami.

**WYMAGA WERYFIKACJI:** aktualne dane, w szczególności przekazany przykład z 2026-10-02, faculty=all i NULL-ami. `all` ma obsługę w loaderze, ale nie występuje w archiwum. Dokładne kompletne wartości archiwalne znajdują się w dodatku na końcu dokumentu; wartości puste, NULL i wielkość liter muszą być rozróżniane w aktualnej agregacji.

## NULL i wydarzenia specjalne

**POTWIERDZONE:** NULL instructor/room/group → pusty tekst/pusta lista w prezentacji; NULL type → Zajęcia, NULL status → aktywne (A7). `wolne` albo etykieta Wszystkie grupy omija filtrowanie grup (A7–A8). Wartości group ze slashami są dzielone w normalizerze, ale `mapAddedEvent` tworzy pojedynczy element z całego tekstu (A7, [eventMappers](../../src/features/my-plan/eventMappers.js), 23–31).

Przekazany przykład 07:00 + 900 min → 22:00, ma być wydarzeniem specjalnym dostępnym we wszystkich planach i grupach, z pustymi metadanymi. **REKOMENDACJA:** zachować raw NULL aż do granicy prezentacji; nie zmieniać wolne w cancelled ani tworzyć fikcyjnego nauczyciela. Długie wydarzenie nie jest błędem dlatego, że nie trwa 90 min.

**POTWIERDZONE:** widok tygodniowy ogranicza dni i godziny (A11), normalizer zawija end modulo 24h, pomija sekundy (normalizeTimetable 70–80,348–353), mapper dopisków odrzuca weekendy (eventMappers 8). **REKOMENDACJA:** PoC edycji czasu ograniczyć do pon.–pt. i 07:00–22:00 oraz pełnych minut; istniejących rekordów odczytu nie odrzucać tylko z powodu wyjścia poza ten zakres. Szerszą obsługę dodać osobno.

## Pakiet weryfikacji produkcji — tylko odczyt

Uruchomić przez właściciela projektu na prawidłowej bazie; wynik nie powinien zawierać danych kont, tokenów ani haseł. Udostępnić schema-only dump zamiast pełnego dumpu ról/danych.

```sql
BEGIN READ ONLY;
SELECT version();
SELECT table_name, column_name, data_type, udt_name, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('events','users','user_added_events','user_event_tags','tag_definitions','faculties')
ORDER BY table_name, ordinal_position;

SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname='public' AND c.relkind IN ('r','p');
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname='public';
SELECT table_name, grantee, privilege_type
FROM information_schema.role_table_grants WHERE table_schema='public';
SELECT conrelid::regclass AS object, conname, pg_get_constraintdef(oid)
FROM pg_constraint WHERE connamespace='public'::regnamespace;
SELECT tablename,indexname,indexdef FROM pg_indexes WHERE schemaname='public';
SELECT event_object_table,trigger_name,action_statement
FROM information_schema.triggers WHERE event_object_schema='public';
SELECT evtname,evtevent,evtenabled FROM pg_event_trigger;

SELECT 'status' AS field,status AS value,count(*) FROM public.events GROUP BY status
UNION ALL SELECT 'faculty',faculty,count(*) FROM public.events GROUP BY faculty
UNION ALL SELECT 'group',"group",count(*) FROM public.events GROUP BY "group"
UNION ALL SELECT 'type',type,count(*) FROM public.events GROUP BY type
ORDER BY field,value NULLS FIRST;
SELECT count(*),count(DISTINCT id),min(date),max(date),min(duration_min),max(duration_min)
FROM public.events;
ROLLBACK;
```

**REKOMENDACJA:** dołączyć bezpieczne definicje funkcji RPC, widoków, default ACL i triggerów synchronizacji z schema-only dumpu. Przejrzeć funkcje pod kątem literalnych sekretów przed udostępnieniem. Negatywne testy uprawnień muszą używać rzeczywistych tokenów anon/A/B, a nie konta administratora; patrz [plan](IMPLEMENTATION_PLAN.md).

## Dodatek — kompletne wartości z archiwum

**POTWIERDZONE tylko dla D4:** wszystkie surowe wartości ze wskazanego CSV; agregaty zgodne z sekcjami COPY events obu plików backupu. Brak `all`/NULL w tym archiwum nie oznacza ich niedopuszczalności. Nie kanonizowano wielkości liter ani slashów w grupach.

### status — 2 wartości

| Wartość surowa | Liczba rekordów |
| --- | ---: |
| `aktywne` | 4426 |
| `wolne` | 270 |

### faculty — 18 wartości

| Wartość surowa | Liczba rekordów |
| --- | ---: |
| `AwP4.0s1` | 146 |
| `AwP4.0s1_EEs1` | 171 |
| `AwP4.0s1_EEs1_Its1` | 16 |
| `AwP4.0s3` | 79 |
| `AwP4.0s3_EEs3` | 34 |
| `EEs1` | 134 |
| `EEs3` | 72 |
| `EIAs6A` | 68 |
| `EIAs6I` | 69 |
| `EiAs2` | 741 |
| `EiAs4` | 770 |
| `EiAs6I_EIAs6A` | 330 |
| `Erasmus` | 191 |
| `Its1` | 214 |
| `Its3` | 119 |
| `IwIKs2` | 518 |
| `IwIKs4` | 550 |
| `IwIKs6` | 474 |

### group — 67 wartości

| Wartość surowa | Liczba rekordów |
| --- | ---: |
| `C` | 30 |
| `C_dodatkowa` | 6 |
| `L` | 19 |
| `L / P` | 77 |
| `L1` | 282 |
| `L1 / L2` | 27 |
| `L1 / L2 / L3` | 6 |
| `L2` | 213 |
| `L3` | 187 |
| `L3 / L4` | 27 |
| `L4` | 161 |
| `L4 / L5 / L6` | 7 |
| `L5` | 114 |
| `L5 / L6` | 15 |
| `L6` | 100 |
| `L7` | 36 |
| `L7 / L8` | 15 |
| `L7 / L8 / L9` | 7 |
| `L7 / P5` | 15 |
| `L8` | 35 |
| `L8 / P6` | 14 |
| `L9` | 13 |
| `L_dodatkowa` | 12 |
| `Lab` | 13 |
| `Lec` | 65 |
| `Lek` | 69 |
| `Lek1` | 96 |
| `Lek2` | 59 |
| `Lek3` | 58 |
| `Lek4` | 30 |
| `Lek5` | 15 |
| `Lk` | 16 |
| `Lk1` | 261 |
| `Lk1 / P1` | 29 |
| `Lk1A` | 14 |
| `Lk1I` | 13 |
| `Lk2` | 200 |
| `Lk2 / P2` | 15 |
| `Lk2A` | 14 |
| `Lk2E` | 23 |
| `Lk2I` | 13 |
| `Lk3` | 175 |
| `Lk3 / P3` | 15 |
| `Lk3E` | 8 |
| `Lk4` | 174 |
| `Lk4 / P4` | 15 |
| `Lk5` | 51 |
| `Lk6` | 53 |
| `P` | 10 |
| `P1` | 134 |
| `P2` | 122 |
| `P2E` | 7 |
| `P3` | 98 |
| `P4` | 79 |
| `P5` | 19 |
| `P6` | 20 |
| `S1` | 53 |
| `S1 / S2` | 1 |
| `S2` | 15 |
| `W` | 641 |
| `W / C` | 10 |
| `W / C / K / P` | 12 |
| `W / C / S` | 13 |
| `Wszystkie grupy` | 270 |
| `Ć1` | 104 |
| `Ć2` | 105 |
| `Ć3` | 71 |

### type — 9 wartości

| Wartość surowa | Liczba rekordów |
| --- | ---: |
| `Lab. Komp.` | 195 |
| `Laboratoria` | 149 |
| `Lektorat` | 105 |
| `Projekt` | 91 |
| `Wykład` | 73 |
| `laboratoria` | 3097 |
| `wykład` | 603 |
| `Ćwiczenia` | 113 |
| `święto` | 270 |
