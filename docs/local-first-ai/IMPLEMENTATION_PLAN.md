# Etapowy plan wdrożenia po decyzjach użytkownika

Data: 11.10.2026. **POTWIERDZONE U1/U2:** Firebase zostaje; alpha-online-account to główny deploy; n8n synchronizuje events i jest agentem domyślnym; Odyseusz jest opcjonalnym lokalnym zamiennikiem o tych samych narzędziach. Bez historii overrides; cancel ukrywa pozycję; dopiski w ICS; czas 07:00–22:00. **REKOMENDACJA:** poniższa kolejność, bez wdrożenia kodu/DDL/usług w obecnym audycie. Stan decyzji i kopii w [HUMAN_ACTIONS](HUMAN_ACTIONS.md).

## 1. Audyt

**Zadania LLM-a:** wykonany audyt aktywnego React/Firebase/Supabase, archiwalnego SQL i lokalnego Odyseusza. Włączyć H1 do porównania schematów; następnie sprawdzić dwa workflow n8n (synchronizacja i chat), stabilność UUID, aktualne FK/RLS/triggery oraz kontrakt native agenta/RAG. Rozstrzygnąć brak schedule_name w INSERT. U1/U2 są źródłem deklaracji użytkownika, nie testem produkcji.

**Zadania człowieka:** teraz tylko oczyszczone eksporty dwóch workflow i publiczny URL strony do CORS; przed migracją wyniki odczytu polityk/triggerów/FK i kopia DB. Klucze .env nie są potrzebne. Nie wymagać ponownej konfiguracji działającego Google login.

**Zależności:** repo oraz H1 dostępne; workflow i DB security metadata nadal brak.

**Ryzyka:** UUID odtwarzane przez synchronizację; opis schematu nie pokazuje triggerów/ON DELETE; komentarz o usunięciu schedule_name przeczy H1. Aktualny repo Odyseusza ma lokalne zmiany, a obraz latest jest ruchomy.

**Testy:** dwa identyczne importy, przeniesienie daty/godziny, usunięcie/reappearance i niepełne pobranie na klonie; porównać UUID oraz dopiski/tagi. Sprawdzić rzeczywiste pg_get_constraintdef/pg_policies. Testy odczytu nie mogą deklarować timeoutu jako skutecznej odmowy.

**Kryterium akceptacji:** G0 potwierdza tożsamość pojedynczego wystąpienia i sposób usuwania; G1 potwierdza zgodność Auth/DDL/RLS, w tym schedule_name. Dostarczone H1 częściowo zamyka G1, ale nie G0.

**Wycofanie:** wyłącznie dokumenty/gałąź; produkcja nie była zmieniona.

## 2. Projekt i migracja bazy

**Zadania LLM-a:** po G0 przygotować konkretną migrację schedule_overrides z FK do public.users, allowlistą/null/typami JSON, revision i immutable fields, jednym personal na user/event, global zamkniętym oraz wąskim RPC zapisu po revision/fingerprint. Jeśli UUID są niestabilne, najpierw wariant U z [MIGRATION_PROPOSAL](MIGRATION_PROPOSAL.md). Przygotować bezpieczny provisioning users przez zaufaną warstwę kont; nie przez agenta. Nie dopisywać nowych pól events bez wykazanej potrzeby.

**Zadania człowieka:** udostępnić staging/klon z kontami A/B, wykonać aktualny backup/restore test. Przyjąć gotowy diff migracji, a nie kontekst CREATE TABLE od U1. Dla rekomendowanego Firebase Third-party Auth zatwierdzić i skonfigurować zaufanie projektu/claims, pozostawiając Google login i obecne my-plan API.

**Zależności:** G0/G1, odtworzona kopia testowa, decyzja o technicznej ścieżce JWT/RLS. Provider Auth jest już wybrany — Firebase.

**Ryzyka:** inherited GRANT ALL; pomylenie Firebase sub z UUID; błędne FK/CASCADE lub RESTRICT blokujący import; możliwość podstawienia ownera; brak mapowania nowego użytkownika.

**Testy:** anon/A/B na rzeczywistym Data API i RPC, obcy issuer/audience, brak claims/mapowania, próba user_id B/global/dowolnego JSON, null w NOT NULL, równoległy create/update/delete. Test triggera uzupełniającego schedule_name lub minimalnej poprawki istniejącego add-event, jeśli rzeczywiście go brak.

**Kryterium akceptacji:** źródłowe UUID i istniejące funkcje zachowane; własność chroniona również bez UI; brak service_role w n8n/Odyseuszu/adapterach; nowych globalnych zapisów nie ma. Migracja na produkcji dopiero po zatwierdzeniu konkretnego wyniku testów i diffu.

**Wycofanie:** odciąć nowe zapisy/flagi, zachować/wyeksportować overrides i mapping; cofnąć wyłącznie nowe obiekty. Nie wracać do importera odtwarzającego UUID ani odtwarzać starej kopii nad nowymi zapisami bez planu.

## 3. Ręczne overrides i spójny eksport

**Zadania LLM-a:** mały hook/klient overrides, raw→effective przed normalizacją i filtrem dat/grup, zapis po event_id (nie UI id). Formularz modify/cancel/przywróć z podglądem; odwołane ukryte. Nakładka dla bazy, zewnętrznych grup i dopisków. Jeden selector effective events dla dzień/tydzień/konflikty/PNG/ICS. ICS obejmuje dopiski z całego wybranego zakresu, nie tylko załadowanego tygodnia; deduplikacja UUID i stabilny UID ICS. Bez nowego routingu/frameworka/historii.

**Zadania człowieka:** odebrać formularz i eksport na używanym kalendarzu; potwierdzić wygodę zakresu 07–22. Limity tekstu 256/1000 znaków są proponowanymi zabezpieczeniami wejścia; nie wymagają osobnych kont/abonamentów ani ograniczenia liczby zajęć.

**Zależności:** etap 2; żaden agent/model/Tailscale nie jest potrzebny do ręcznego zapisu przez user-scoped Supabase client.

**Ryzyka:** UI id zamiast event_id; prywatny wynik we wspólnym cache; NULL zgubiony przez ??/COALESCE; cancel odtworzony przez merge dopisków; zakres eksportu pomija dopiski/inny tydzień; przeniesiona data wypada poza stare filtry.

**Testy:** room:null vs brak klucza; modify {} odrzucony; cancel nie zmienia events; delete przywraca źródło. All/wolne/NULL/900 min oraz nullable faculty zgodnie z ustaloną semantyką. Zmiana daty do innego tygodnia, A/B, wylogowanie w trakcie request, brak storage/sieci. Dopisek niewidoczny w aktualnym tygodniu nadal trafia do pełnego ICS; cancelled nie trafia; ten sam UUID nie daje duplikatu.

**Kryterium akceptacji:** zachowane logowanie/my-plan/filtry; oba widoki i eksport pokazują ten sam zatwierdzony plan użytkownika. B widzi źródło zamiast zmian A. Nieukończony odczyt overrides daje jawny stan nieaktualny, a nie fałszywy „brak odwołań”.

**Wycofanie:** flaga UI/effective off, zachować DB i ręcznie poinformować testujących o powrocie do źródła. Osobno odwracalna zmiana selektora ICS.

## 4. Wspólne narzędzia, hosted API i lokalny transport

**Zadania LLM-a:** jeden niewielki pakiet narzędzi i kontrakt HTTP/JSON, z cienkimi wrapperami n8n/MCP; żadnej osobnej walidacji domeny dla każdego agenta. JWT/własność poza modelem, cztery operacje schedule z [OVERRIDES_DESIGN](OVERRIDES_DESIGN.md), bound execution context, podgląd i jednorazowe approvals. Hosted adapter przy n8n; ta sama implementacja lokalnie przy Odyseuszu. Lokalnie loopback + Serve, dokładny CORS, capabilities handshake, limity/timeouty i redakcja logów.

**Zadania człowieka:** wskazać host istniejącego n8n oraz exact URL strony; przed uruchomieniem przyjąć konkretny route/port/ACL. Zalogować Tailscale na urządzeniu używającym własnego endpointu. Jednorazowo skonfigurować lokalny adapter; nie wystawiać go przez Funnel i nie resetować istniejącego Serve.

**Zależności:** etap 3 i uzgodnione JWT/RLS; do publikacji API backup/config i osobny branch. Hosted endpoint musi być osiągalny dla użytkowników bez Tailscale; Tailscale dotyczy tylko opcjonalnego lokalnego trybu.

**Ryzyka:** raw JWT w promptach/execution logs n8n; cross-user sessionId; arbitrary endpoint/SSRF; callback/replay approval; port LAN omijający tailnet; wymagania LNA/CSP/CORS; stateless workers bez spójnego store approvals.

**Testy:** identyczny kontrakt i walidacja dla hosted/local, expired/wrong JWT, Origin, preflight, tailnet on/off i urządzenie spoza tailnetu. Approval A nie działa dla B/innego providera/sesji; zmiana źródła/revision → 409; TTL/restart/replay/podmiana patch/timeout po commit. Model nie może wywołać confirm ani SQL/URL. Publiczny backend nie łączy się do endpointu użytkownika.

**Kryterium akceptacji:** wszystkie zapisy przez adapter wymagają konkretnego potwierdzenia, serwisy bez service_role; manualny plan działa bez modelu i lokalnego hosta. Shared package ma tę samą wersję w obu trybach.

**Wycofanie:** wyłączyć nowy transport/API, zachować ręczne UI i DB; lokalnie usunąć tylko nowy route/serwis. Zachować wcześniejszy n8n chat za flagą bez automatycznego wynoszenia prywatnego kontekstu. Nie dotykać atlas/443 ani istniejącego Odyseusza/8443.

## 5. Domyślny n8n i opcjonalny Odyseusz

**Zadania LLM-a:** najpierw dopasować istniejący n8n AI Agent do czterech narzędzi/podglądów/confirm, owner-bound pamięci i loginu dla zapisów. Następnie lokalny adapter + MCP tools/skill Odyseusza z identycznym kontraktem i właściwą native sesją agentową/RAG. UI wybiera provider; domyślnie n8n, lokalnie endpoint/test połączenia. Zmiana providera zaczyna nową rozmowę, nie przenosi historii/notatek. Obecne slot_choices/add/remove pozostają kompatybilne; rozbudowa narzędzi dopisków musi używać tego samego protokołu, nie dowolnego INSERT events.

**Zadania człowieka:** dostarczyć eksport czatu n8n; operator lokalnego trybu instaluje adapter i przypina własną sesję/model. Token Odyseusza tylko po stronie jego adaptera. Odebrać te same scenariusze na n8n i lokalnie; potwierdzić lokalność modelu/embeddings i brak outbound hooks dla prywatnego chatu.

**Zależności:** etap 4; n8n workflow/wersja znane; native kontrakt Odyseusza sprawdzony na kopii. Konta A/B to etap testu, nie ograniczenie docelowej dostępności n8n do jednego pilota.

**Ryzyka:** native /api/v1/chat nie wykonuje standardowego RAG/agent tools; skill sam nie tworzy narzędzia; inny token owner w Odyseuszu; static credential n8n wspólny dla użytkowników; broad approvals; niejawny cloud fallback/transfer lokalnego RAG.

**Testy:** te same fixtures na obu providerach: znajdź, niejednoznaczność, modify/cancel/delete, JSON null, invalid patch, read-only guest, login wymagany dla mutate. W każdej kolejnej zmianie nowy podgląd i confirm. Injection w subject/reason/RAG nie uruchamia SQL/bash ani zatwierdzenia. Zmiana providera/konta w czasie request nie wznawia starej operacji. Lokalny model wyłączony → jawny błąd, żadnego automatycznego wysłania do n8n.

**Kryterium akceptacji:** n8n dostępny domyślnie użytkownikom, Odyseusz działa jako wymienny provider przez skonfigurowany endpoint. Identyczna autoryzacja/narzędzia/confirm, bez frameworka multiagentowego i bez zmian źródłowych events przez agenta.

**Wycofanie:** cofnąć wybrany provider/adapter za flagą; zachować działający n8n lub ręczne UI. Tokeny nowej integracji można unieważnić bez zmiany kont i prywatnych overrides. Nie uruchamiać fallbacku chmurowego dla wcześniej lokalnej rozmowy.

## 6. Istniejące notatki i RAG Odyseusza

**Zadania LLM-a:** wykorzystać istniejący RAG i pamięć, bez budowy indeksu w React/n8n. Wskazać właściwą ścieżkę native chatu; dostosować adapter do owner/use_rag i narzędzi schedule. Zweryfikować registered directories, aktualizację/usuwanie/symlinki, lokale embeddings, wykluczenia i limity kontekstu. Aktualny harmonogram pobierać narzędziem, nie z dawnej pamięci.

**Zadania człowieka:** raz wskazać foldery w Odyseuszu i lokalny model/embeddings. Odebrać update/delete notatki po Syncthing, backup/retencję lokalnego indeksu i brak transmisji treści do n8n. Nie zbierać teraz notatek do centralnej chmury.

**Zależności:** opcjonalny tryb lokalny etapu 5; dostęp do zatwierdzonych folderów. Podstawowe zarządzanie planem nie zależy od notatek.

**Ryzyka:** auto_memory rozmowy mylone z automatycznym watcherem vaultu; obecny RW mount; niezarejestrowany folder; stale embeddings po zmianie pliku; zwykły sync_chat omija RAG; prompt injection w dokumencie.

**Testy:** native rozmowa znajduje znany fragment; upload/dodanie folderu skutkuje indeksem; zmiana/usunięcie pliku aktualizuje wyniki według potwierdzonego mechanizmu. Brak wyniku dla wykluczonego/symlinkowanego pliku, brak wynoszenia RAG przy zmianie providera. Notatka nie może zatwierdzić zapisu.

**Kryterium akceptacji:** istniejąca infrastruktura Odyseusza działa ze schedule adapterem; odpowiedzi mają źródła, aktualny plan jest z tools, RAG i generacja lokalne dla lokalnego profilu. Nie obiecujemy indeksowania całego vaultu bez konfiguracji.

**Wycofanie:** odłączyć RAG od integracji planu, pozostawić istniejącą pamięć/vault/Syncthing. Usuwać jedynie nowo wygenerowany indeks na życzenie właściciela.

## 7. Późniejsze globalne overrides i dodatkowy agent

**Zadania LLM-a:** oddzielny projekt globalnych ról/precedence/audytu; ewentualny dodatkowy runtime przez ten sam kontrakt. Odyseusz jako zamiennik n8n już należy do etapu 5; tutaj chodzi o dodatkowego agenta/orkiestrację, np. Hermes. Nie używać etapu 7 jako pretekstu do odłożenia wymaganego lokalnego zamiennika.

**Zadania człowieka:** po PoC ustalić osoby uprawnione do globalnych zmian, odpowiedzialność za oficjalne odwołanie i konkretną potrzebę dodatkowego agenta.

**Zależności:** zaakceptowane etapy 1–6 oraz osobne uzasadnienie/zgoda. Na PoC global wyłącznie reprezentowalne w schemacie.

**Ryzyka:** globalny zapis przez studenta/model, personal „wskrzeszający” global cancel, niejawne uprawnienia drugiego runtime. Zalecenie przyszłe: global cancel blokuje osobiste wskrzeszenie, personal modify ma tylko zatwierdzone pola.

**Testy:** administrator/student/A/B zgodnie z rzeczywistymi rolami, konflikty global/personal i rollback; dodatkowy provider nie omija tych samych approvals/RLS.

**Kryterium akceptacji:** jawna polityka global i potwierdzona potrzeba rozszerzenia; zachowane personal overrides oraz dotychczasowe dwa wymienne tryby.

**Wycofanie:** wyłączyć global/dodatkowy runtime za flagą, zachować prywatne dane i n8n/Odyseusza jako dotychczasowe zamienniki.

## Minimalny PoC i praca w GitHubie

G0/G1 → ręczne overrides i ICS z dopiskami → wspólny pakiet narzędzi → domyślny n8n → opcjonalny lokalny Odyseusz z endpointem. Firebase i istniejące konto/dopiski zostają. Każdy zapis ma podgląd/potwierdzenie; globalne overrides i dodatkowy agent poza PoC. RAG korzysta z istniejącego Odyseusza po konfiguracji, bez nowej infrastruktury RAG w planie.

Dokumenty: branch docs/local-first-ai-review do alpha-online-account. Przyszłe kod/DDL/workflow na osobnych feature branches i PR-ach; przed merge testy na kopii, bez commitów do alpha-online-account. n8n workflow wersjonować jako oczyszczony JSON. Dla Odyseusza preferować adapter/MCP poza core; jeśli potrzebny fork, osobny branch/worktree i testowy kontener z kopią danych. Nie przełączać działającego kontenera na branch testowy. GitHub nie zapewnia backupu runtime/DB/vaultu — zakres wykonanej kopii opisano w HUMAN_ACTIONS.
