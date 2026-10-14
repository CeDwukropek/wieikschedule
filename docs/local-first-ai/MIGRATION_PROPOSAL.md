# Propozycja migracji — najpierw stabilna tożsamość

Audyt bazowy: 11.10.2026; aktualizacja: 14.10.2026. Wszystkie działania przyszłe to **REKOMENDACJA** i wymagają zatwierdzenia wdrożenia. Nie utworzono ani nie zastosowano migracji. Dowody: [architektura A/D](ARCHITECTURE_AS_IS.md), [audyt DB](DATABASE_AUDIT.md).

## Aktualizacja U1/U2

**POTWIERDZONE od użytkownika:** n8n synchronizuje events oraz obsługuje chat; dlatego do G0 potrzebny jest eksport workflow synchronizacji. Aktualny kontekst H1 nadal zawiera wymagane schedule_name, nullable events.faculty i faculties. Nie zawiera akcji FK/RLS/triggerów — archiwalne CASCADE niżej pozostaje faktem z backupu, a nie pomiarem produkcji. Firebase zostaje; nie ma zadania migracji dostawcy Auth. n8n jest providerem domyślnym, lokalny Odyseusz zamiennikiem; wdrożenie ma zapewniać wspólny kontrakt narzędzi dla obu.

## Co wiadomo po dostarczeniu Firebase Insert.json (N1)

| Pytanie | Status | Dowód / ograniczenie |
| --- | --- | --- |
| INSERT, UPSERT czy DELETE+INSERT? | POTWIERDZONE dla eksportu: Create/INSERT przy domyślnych parametrach Supabase v1 | add events nie ustawia operation; oficjalny default create wysyła POST, nie UPSERT. Brak ścieżki DELETE lub odczytu istniejących events. Przyszłą przypiętą wersję node’a przetestować na klonie. |
| Jak identyfikuje istniejący termin? | POTWIERDZONE: writer nie identyfikuje istniejącego wiersza | Parser liczy tekst source id, ale fieldsUi add events go nie wysyła. Nie ma conflict target ani source_key w schemacie H1. |
| Gdzie powstaje UUID? | POTWIERDZONE w H1 i mapowaniu N1 | Wskazany INSERT bez id korzysta z gen_random_uuid; to nie source id z JS. Nie wolno wpisywać tekstu source_id_date do kolumny UUID. |
| Czy UUID przetrwa ponowny import/przesunięcie? | G0 NIEZALICZONE | Pokazany mechanizm tworzy nowe wiersze/UUID. Nie ma dowodu aktualizacji starego rekordu; zmiana startDate serii zmienia też obliczany klucz datowy. |
| Co po usunięciu/odwołaniu upstream? | POTWIERDZONE: parser pomija, writer nie usuwa/oznacza starego wiersza | KEEP_CANCELLED_EVENTS=false i freeDays powodują continue. Brak cleanup/reconcile. Przyszły synchronizator musi odróżniać pełny snapshot od awarii pobrania. |
| Czy wszystkie dane trafiają do writer? | POTWIERDZONE: nie | Code in JavaScript2 filtruje tylko group zawierające przecinek; single-group/null group/free-day nie docierają do add events. |
| Czy ten workflow już działa w produkcji? | WYMAGA WERYFIKACJI wcześniejszych wykonań; n8n na tym serwerze nie jest wdrożone | N1 active=false/manualTrigger; U3 podaje brak n8n na serwerze. Nie wnioskować z pliku o wykonanych INSERT-ach/utracie istniejących danych. |

Dowody: N1 node’y/połączenia opisane w ARCHITECTURE_AS_IS. To konkretny importer, nie gotowy idempotentny synchronizator. Frontendowy n8nClient ani agent projektów N4 nie zapewniają stabilnych ID.

### Minimalny projekt naprawy na kopii — przed overrides

1. Naprawić kompletność strumienia: zachować wszystkie normalne wystąpienia i wszystkie dni wolne. Preferowany model to jeden rekord na źródłowe wystąpienie, a lista grup jest jego właściwością; ustalić format zgodny z normalizerem i testem filtrów. Jeśli pozostaje rozbijanie grup, stabilność tożsamości każdej części wymaga osobnej strategii — nazwa zmiennej grupy nie wystarczy.
2. Zachować upstream series/event id oraz identyfikator oryginalnego wystąpienia jako source_key, oddzielnie od events.id UUID. Parser ma dziś series id + wygenerowaną datę; to kandydat dla nieprzesuniętych wystąpień, nie dowód trwałego occurrence id. Upstream prywatne/źródłowe overrides nie są tym samym co nasza schedule_overrides.
3. Dodać minimalne source_system/source_key z unikalnym kluczem tylko po zdefiniowaniu rzeczywistej tożsamości; UPSERT po tym kluczu aktualizuje pola, nigdy istniejący UUID. Mapper zachowuje jawne NULL i rozróżnia event od dnia wolnego. Source id tekstowe nie jest wysyłane jako events.id.
4. Backfill istniejących wierszy: jednoznaczne dopasowania zachowują UUID, duplikaty/podobne terminy trafiają do raportu. Nie scalać automatycznie wierszy z dopiskami/tagami ani nie przepinać cudzych powiązań. Gdy source startDate lub para excludedDates/_add oznacza przesunięcie, potrzebny trwały identyfikator wystąpienia lub zatwierdzone mapowanie; nie zgadywać na podstawie nowej daty.
5. Źródłowe cancellations/deletions/freeDays wymagają reconciliation z DB po pełnym, poprawnym snapshotcie. Zachować referencje istniejących prywatnych powiązań, oznaczyć stan źródła oddzielnie i ukryć nieaktualny termin. Pusta/błędna odpowiedź API nie jest poleceniem usunięcia planu. Samo KEEP_CANCELLED_EVENTS=false nie załatwia tego w DB.
6. Importer zapisuje również faculties przez Create bez pokazanego conflict target; przetestować duplikację słownika i nie uruchamiać go wielokrotnie bez idempotencji. Nie migrować frontendu na faculties w ramach naprawy override’ów — obecny loader nadal korzysta z events.faculty.
7. Dopiero testy G0 na kopii: dwa identyczne importy, korekta sali/czasu/grup, przeniesienie, anulowanie i błąd źródła; zero niepotrzebnych nowych UUID, kompletne wydarzenia i zachowane relacje. Potem migracja prywatnych overrides.

Nie wykonano tej naprawy ani SQL. Eksporty pozostają bez zmian. Dalsze warianty S/U poniżej są projektem migracji po rozwiązaniu powyższych problemów; wariant S nie został potwierdzony dla N1.

## Bramka G0 — dowód przed migracją

N1 już dostarczono i odczytano; nie trzeba ponownie prosić o ten eksport. Przypiąć przyszłą wersję n8n/node’ów i przed migracją uzupełnić H1 o rzeczywiste FK/triggery oraz uprawnienia. Audyt obejmuje wszystkie aktywne gałęzie: harmonogram, źródło, pagination, Code nodes, HTTP/Postgres/Supabase nodes, SQL/RPC, cleanup, error/retry i credentials tylko jako nazwy/uprawnienia.

Na osobnej bazie testowej porównać snapshot `stable_source_identity → events.id` dla:

1. Dwóch identycznych importów: zero nowych UUID i zero duplikatów.
2. Zmiany sali/instruktora oraz przesunięcia daty/godziny tego samego terminu: to samo UUID.
3. Dwóch podobnych zajęć o różnych tożsamościach: różne UUID.
4. Błędu/niepełnego pobrania i retry: brak masowego usunięcia.
5. Zniknięcia upstream oraz ponownego pojawienia się: zachowane powiązania według uzgodnionej polityki.
6. Istniejących dopisków i tagów: brak utraty wierszy/FK podczas każdego scenariusza.

**Kryterium G0:** udokumentowany mechanizm źródłowej tożsamości, brak DELETE+INSERT dla aktualizacji oraz zaliczone scenariusze. Sam UPSERT nie wystarcza, jeśli conflict target jest zmiennym hashem daty/godziny lub payload zmienia PK. Bez G0 etap override pozostaje wyłączony.

## Wariant S — stabilne UUID są potwierdzone

Nie migrować id wydarzeń. Zachować obecne UUID. Uzgodnić usuwanie przed dodaniem RESTRICT. Jeżeli źródło nie wykonuje fizycznych DELETE ani zmian PK dla aktualizacji, nowa tabela nie wymaga zmiany events dla osobistego cancel.

Jeżeli poprawne twarde DELETE są częścią importera, trzeba uzgodnić retencję: zalecane zachowanie źródłowego wiersza/tombstone zamiast CASCADE. Nie wdrażać RESTRICT bez testu importera. Dopuszczalny alternatywny model archiwizacji wymaga jawnego przeniesienia powiązań, a nie przypadkowej utraty override’ów.

## Wariant U — UUID są odtwarzane lub brak trwałego klucza

Minimalny dodatek: `source_system` i `source_key` w events z unikalnością pary, tylko jeśli upstream ma trwałe ID pojedynczego wystąpienia. Klucz serii zajęć nie wystarcza dla wielu terminów. Dla źródła kalendarzowego sensowne jest UID + niezmienny identyfikator wystąpienia/RECURRENCE-ID, nie faktyczna nowa data. Wprowadzanie źródłowych pól to osobna migracja przed overrides, nie wymóg samego cancel.

Nowe UUID generować raz przy pierwszym INSERT. Na konflikt `(source_system,source_key)` aktualizować wyłącznie pola harmonogramu; nigdy id. UUIDv5 jest dopuszczalne wyłącznie z trwałej tożsamości źródłowej, ale nie należy przeliczać już istniejących UUID na UUIDv5. Hashe faculty/date/start_time/subject nie są stabilne przy przesunięciu ani zmianie nazwy.

Jeżeli upstream nie ma trwałej tożsamości, mała tabela registry przechowuje nadane ID i mapowanie do istniejących events. Dopasowania biznesowe służą do wykrywania kandydatów, nie są automatycznym dowodem tożsamości. Niejednoznaczne przesunięcie wymaga rozstrzygnięcia człowieka; bez wiarygodnego mapowania **nie wdrażać overrides**. Nie rozwiązywać problemu samym fuzzy matchingiem modelu.

### Bezpieczna kolejność wariantu U

1. Aktualna kopia DB z events/users/dopiskami/tagami oraz kopia konfiguracji workflow. Test odtworzenia na oddzielnej bazie. Snapshot liczności/FK i mapowania kluczy; sekrety poza repo.
2. Odtworzyć testowe środowisko, rozstrzygnąć drift schedule_name. Przygotować addytywną migrację i importer w wersji testowej; stare czytniki nadal działają.
3. Backfill kluczy do istniejących UUID z jednoznacznego źródła. Raport duplikatów/ambiguitetów, zero zgadywania. Unikalny indeks dopiero po oczyszczeniu mapowania.
4. Import „na sucho” porównuje planowane INSERT/UPDATE/zniknięcia bez zapisów. Człowiek zatwierdza mapowania i raport. Następnie testy G0 na klonie.
5. W uzgodnionym oknie wstrzymać scheduler, dokończyć bieżące wykonania, zastosować dodatki, przełączyć jeden writer na UPSERT, wykonać kontrolowany import i porównanie. Przełączanie writerów bez przerwy może odtworzyć stare UUID.
6. Zniknięcia oznaczać osobnym stanem po kompletnym udanym snapshotcie źródła, nie po pustej odpowiedzi lub błędzie. Jeśli potrzebne, dodać `source_present`/tombstone wraz z filtrem loadera; nie przeciążać status wolne ani prywatnego cancel. Reappearance odnawia ten sam UUID. Polityka retencji wymaga decyzji.
7. Dopiero po stabilnych kolejnych przebiegach i kontroli istniejących powiązań odblokować migrację overrides.

Jeżeli dawne DELETE+INSERT już usunęło dopiski/tagi, odtworzyć je z kopii przez zatwierdzone mapowanie stare→nowe ID. FK, które nie zostały zerwane, są chronione przez zachowanie istniejących UUID. Nie wykonywać masowej zmiany PK ani globalnego remapowania na produkcji w celu „uproszczenia” migracji.

PostgreSQL wymaga zdefiniowanego celu konfliktu dla ON CONFLICT; skutki FK RESTRICT/CASCADE różnią się ([INSERT](https://www.postgresql.org/docs/17/sql-insert.html), [constraints](https://www.postgresql.org/docs/17/ddl-constraints.html)). To uzasadnia dobór konkretnego klucza i test synchronizacji, a nie stanowi dowodu konfiguracji n8n.

## Bramka G1 — Auth i prywatna tabela

Decyzja U1: zachowanie Firebase. Rekomendowane Firebase Third-party Auth w Supabase obsługuje nowe narzędzia przez JWT/RLS i wymaga przyszłej konfiguracji/testu; nie zmienia istniejącego logowania ani kont. Przy Firebase FK `user_id → public.users.id`; przetestować token z poprawnego i obcego projektu, brak claimu, brak mapowania i role PostgreSQL. Nigdy nie przenosić istniejącego service_role do lokalnego API.

Przygotować migrację schedule_overrides z całym kontraktem [projektu](OVERRIDES_DESIGN.md): CHECK/allowlista i typy JSON/null, FK, unikalne indeksy, revision/timestamps, kontrola immutable fields, RLS na każdą operację, jawne granty oraz wąska funkcja mapująca użytkownika. Wszystko początkowo na testowej bazie. Nie uznawać fragmentu SQL w projekcie za kompletną migrację.

Testy PoC używają A/B z public.users; produkt ma obsługiwać wszystkich zalogowanych użytkowników, więc bezpieczny provisioning mapowania jest częścią rollout. Nowe agentowe adaptery nie mają uprawnień do tworzenia users. Stan mapowania zakładamy przez istniejącą zaufaną warstwę kont, nie przez model. Provisioning nowych użytkowników w przyszłości wymaga bezpiecznej ścieżki przez istniejącą zaufaną warstwę kont lub kontrolowaną administrację. Claims ustawione przez administratora Firebase muszą zachować pozostałe claims i nigdy nadać service_role.

Nowa tabela domyślnie pusta, globalne operacje zamknięte. Rollout odczytu/renderowania za flagą → ręczne zapisy → wspólne narzędzia/publiczny n8n → opcjonalny lokalny adapter Odyseusza. Każdy krok kończy się testami i osobnym zatwierdzeniem przejścia; obsługa AI nie jest potrzebna do migracji.

## Wycofanie

Najpierw wyłączyć nowe zapisy i flagi, następnie wrócić do poprzedniego frontendu; pozostawić tabelę overrides oraz kopię danych. Przy potrzebie cofnięcia migracji wyeksportować prywatne overrides i usunąć tylko nowo dodane polityki/funkcje/indeksy/tabelę po jawnej akceptacji. Nie kasować public.users ani events. Stare dopiski i ustawienia pozostają w dotychczasowych ścieżkach.

Dla zmienionej synchronizacji zachować nowy stabilny writer lub zatrzymać go do naprawy. Powrót do DELETE+INSERT po powstaniu prywatnych powiązań nie jest bezpiecznym rollbackiem. Dodane source keys/registry pozostawić; pełne odtwarzanie kopii wyłącznie w uzgodnionym oknie, z zabezpieczeniem wszystkich zapisów powstałych po backupie.

## Gałęzie i kopia przed przyszłymi zmianami

**POTWIERDZONE:** źródła i dotychczasowe dokumenty skopiowano do prywatnego lokalnego snapshotu podanego w HUMAN_ACTIONS; wieikschedule ma osobną gałąź docs/local-first-ai-review. Nie obejmuje to produkcyjnej bazy, vaultu ani konfiguracji/credentials workflow. **REKOMENDACJA:** każda przyszła migracja/kod/workflow na osobnej gałęzi feature do alpha-online-account; testy na klonie przed merge. Konfigurację n8n wersjonować jako oczyszczony JSON, sekrety utrzymywać w n8n credentials. Lokalne rozszerzenie Odyseusza preferuje oddzielny adapter/MCP w tym repo. Fork/core branch i osobny worktree dopiero jeśli test kontraktu wykaże taką konieczność; istniejących lokalnych zmian Odyseusza nie resetować.
