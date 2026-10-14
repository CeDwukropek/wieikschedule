# Decyzje użytkownika i brakujące materiały — aktualizacja

Audyt bazowy: 11.10.2026; aktualizacja: 14.10.2026. Źródło U1: wiadomość użytkownika z H1–H5 i D-01–D-10. Źródło U2: użytkownik potwierdził, że n8n synchronizuje events i obsługuje chat. **POTWIERDZONE** przy U1/U2 oznacza treść przekazaną przez użytkownika, nie niezależny pomiar panelu. **REKOMENDACJA** opisuje przyszłą zmianę; **WYMAGA WERYFIKACJI** — konkretny brak. Zakres pozostaje dokumentacyjny, z zatwierdzonymi gałęziami i kopią kodu; nie wdrażamy jeszcze migracji ani zmian usług.

## U3/N1–N4 — otrzymane materiały i stan prac

**POTWIERDZONE:** dostarczono create_project (1).json, Firebase Insert.json, get_projects (2).json i Auto To Do Agent (1).json; pliki statycznie przeanalizowano i pozostawiono bez zmian. Użytkownik potwierdził, że n8n nie jest jeszcze na serwerze, oraz RLS events: enabled, Public read SELECT/PUBLIC/true, Service role write ALL/service_role. Źródło U3 to ta wiadomość, dowody N1–N4 to konkretne node’y opisane w ARCHITECTURE_AS_IS.

**POTWIERDZONE:** Firebase Insert to dostarczony importer planu; trzy pozostałe workflow są do projektów/notatek. Nie trzeba dosyłać ośmiu brakujących subworkflow agenta notatek na potrzeby harmonogramu. Nie ma gotowego schedule AI Agent; zaproponowano nowy workflow jednego agenta z tymi samymi narzędziami co przyszły adapter Odyseusza.

**Stan G0:** dostarczony importer nie przechodzi bramki. Pomija single-group i free-day, nie wysyła source id do DB, tworzy nowe UUID zamiast aktualizować stare i nie ma reconciliation. To wniosek z eksportu/defaultów node’a, nie deklaracja wykonanych zapisów produkcyjnych. Kolejny krok audytora: konkretny projekt naprawy na kopii z MIGRATION_PROPOSAL. Nie wdrażać teraz overrides, nie importować ani uruchamiać tego workflow na produkcji.

**Na ten etap nie potrzebujemy kolejnych sekretów ani eksportów notatek.** Przed przyszłą migracją/testem end-to-end nadal będą potrzebne rzeczywiste FK/triggery (zwłaszcza schedule_name) i RLS prywatnych tabel, kopia bazy/staging oraz adres strony do CORS. To dane odbioru wdrożenia, a nie warunek analizowania otrzymanych plików.

## Co jest już ustalone

| Decyzja | Wynik po odpowiedzi użytkownika |
| --- | --- |
| D-01 | POTWIERDZONE U1: Firebase Auth zostaje. Nie migrujemy kont do Supabase Auth. FK override do public.users(id). Firebase Third-party Auth w Supabase pozostaje rekomendacją techniczną dla RLS bez service_role w agentach, a nie zatwierdzoną zmianą panelu. |
| D-02 | REKOMENDACJA: samo wydarzenie zachowuje swój numer UUID po zmianie daty/sali. To zadanie audytora/importera, nie pytanie o preferencję użytkownika. Do sprawdzenia workflow n8n. |
| D-03 | REKOMENDACJA: po zniknięciu ze źródła nie gubimy prywatnych powiązań; wydarzenie znika z planu, a jego referencja jest zachowana. Konkretny mechanizm ustalimy po odczycie synchronizacji i rzeczywistych FK. Nie dodajemy teraz tombstone/registry na zapas. |
| D-04 | POTWIERDZONE U1: 07:00–22:00. REKOMENDACJA: sala/instruktor do 256 znaków, reason do 1000; czas trwania dodatni i mieszczący się w tym oknie. Limity chronią przed błędnymi i ogromnymi żądaniami; nie ograniczają liczby zajęć użytkownika. Pozostałe limity są domyślnymi propozycjami, nie nowymi decyzjami użytkownika. |
| D-05 | POTWIERDZONE U1: historia nie jest wymagana. Jeden prywatny override user/event; fizyczne delete przywraca źródło. Revision służy ochronie równoległych zapisów, nie historii. |
| D-06 | POTWIERDZONE U1: odwołane pozycje ukrywamy, dopiski eksportujemy do ICS. Wszystkie eksportowane źródła uwzględniają effective events; cancel nie usuwa events. |
| D-07 | REKOMENDACJA: wspólny kontrakt narzędzi i walidacja, dwa transporty: publiczny n8n oraz opcjonalny lokalny adapter Odyseusza przez Serve. Każdy zapis z potwierdzeniem. Szczegóły w OVERRIDES_DESIGN. |
| D-08 | POTWIERDZONE U1: n8n to agent domyślny dla użytkowników; Odyseusz jest wybieranym zamiennikiem, z tymi samymi narzędziami. Jeden provider na rozmowę; brak równoległego zespołu agentów. Nie ograniczamy produktu do konta jednego pilota — mała grupa testowa to etap wdrożenia. |
| D-09 | POTWIERDZONE U1: globalne overrides i dodatkowy agent poza PoC. REKOMENDACJA: korzystać z istniejącego RAG Odyseusza po konfiguracji; nie budować drugiego indeksu. Indeksowanie plików i automatyczna pamięć rozmów to osobne mechanizmy. |
| D-10 | POTWIERDZONE U1: praca w GitHubie, wyłącznie osobne branche; kopia lokalnych źródeł. Bez push/merge do alpha-online-account/dev i bez przełączenia produkcyjnego kontenera na roboczy build. |

## H1–H5 w prostych słowach

**H1 — schema dostarczony.** W podanym kontekście nadal jest schedule_name NOT NULL, events.faculty jest nullable i istnieje faculties. Uzupełniłem DATABASE_AUDIT. Ten opis nie zawiera RLS, triggerów ani indeksów, więc nie zamyka całego H1. Szczególnie ważne: obecny INSERT add-event nie wysyła schedule_name. Trzeba sprawdzić, czy trigger go uzupełnia; bez tego schemat i kod nie pasują.

**H2 — nie potrzebuję kluczy ani ponownej konfiguracji Google login.** Firebase zostaje, a istniejący sposób logowania mamy w kodzie. Gdy przygotujemy RLS dla nowych overrides, sprawdzimy identyfikację użytkownika i ewentualną konfigurację Firebase→Supabase na koncie testowym. To przyszłe zadanie wdrożeniowe, nie lista materiałów do zebrania już teraz.

**H3 — branch deployu wystarczy na ten etap.** U1 potwierdza alpha-online-account jako główny deploy. Przed testem przeglądarki potrzebny będzie publiczny adres strony, aby ustawić dokładny CORS. Wartości .env nie są potrzebne; kluczy service_role/Firebase private key/tokenów nie wysyłamy do czatu ani repo.

**H4 — materiały odebrane.** Importer N1 przeanalizowany; N4 jest szablonem agenta notatek, więc schedule workflow przygotujemy osobno. U3 wyjaśnia, że wdrożenie n8n na tym serwerze jest przyszłym zadaniem. Nie prosić ponownie o te same pliki ani o eksporty narzędzi notatek poza zakresem harmonogramu.

**H5 — pytanie o działanie lokalnego trybu, nie nową architekturę.** Potrzebujemy sprawdzić, czy adapter uruchamia właściwą sesję agenta/RAG Odyseusza i tylko narzędzia schedule. Nie musisz teraz wybierać jednego modelu dla wszystkich; każdy użytkownik może używać własnego modelu. Audytor odczyta możliwości z kodu, a pierwszy użytkownik lokalnego trybu potwierdzi je testem.

## Pozostała praca człowieka — tylko gdy będzie potrzebna

| Kiedy | Co jest potrzebne i dlaczego |
| --- | --- |
| Teraz | Materiały wystarczają do statycznego projektu naprawy importera i nowego schedule agent. Otrzymanych eksportów nie trzeba dosyłać ponownie. |
| Przed migracją testową | Bezpieczne wyniki pg_policies, pg_get_constraintdef i definicji triggerów z DATABASE_AUDIT; przede wszystkim schedule_name i zachowanie FK po DELETE. Nie wykonywać CREATE TABLE z U1. |
| Przed zapisami testowymi | Oddzielna baza testowa lub zgodny klon, konta A/B; aktualna kopia DB i test odtworzenia. GitHub przechowuje kod, nie kopiuje automatycznie Supabase/Firebase/n8n runtime. |
| Przed aktywacją lokalnego trybu | Jednorazowo uruchomiony adapter Odyseusza z pakietem narzędzi, lokalne credentials Odyseusza wyłącznie w adapterze, Serve HTTPS/ACL. Użytkownik wybiera lokalny provider, wpisuje endpoint adaptera i robi test połączenia. Sam dowolny URL obecnego Odyseusza nie zapewnia jeszcze zgodności protokołu. |
| Przy odbiorze UI/API | Manualne A/B, wylogowanie, odwołanie/przywrócenie, przesunięcie do innego tygodnia, dopiski w ICS, mobile/desktop oraz brak dostępu do Tailscale. Potwierdzenie zapisów musi działać identycznie dla obu providerów. |
| Przy użyciu własnych notatek | Wskazanie folderów RAG w Odyseuszu, wykluczeń, lokalnego modelu i lokalnych embeddings; sprawdzenie aktualizacji/usunięcia notatki. Nie przekazywać treści RAG do domyślnego n8n ani robić automatycznego fallbacku chmurowego. |
| Po PoC | Osobne zasady globalnych overrides i potrzeba dodatkowego agenta. |

## GitHub, gałęzie i kopia

**POTWIERDZONE wykonaniem:** repo wieikschedule pracuje na docs/local-first-ai-review, utworzonej z alpha-online-account. Stan sprzed korekty dokumentów zapisano lokalnie w /home/cedwukropek/audit-backups/20261011-225542: dwa archiwa source-and-docs i manifest sum kontrolnych. Kopia obejmuje źródła i dokumenty, w tym lokalne zmiany oraz pliki źródłowe untracked Odyseusza; celowo nie obejmuje .env, baz, danych usług, vaultu, sekretów ani całego historycznego repo. Nie jest backupem produkcyjnej bazy.

**REKOMENDACJA dla Odyseusza:** zacząć od adaptera/MCP i konfiguracji, aby uniknąć forka core. Jeśli zmiana core okaże się konieczna: osobny fork użytkownika, gałąź feat/schedule-agent oraz osobny worktree/kontener testowy z kopią danych. Istniejący odysseus jest na dev, ma lokalne zmiany i origin odysseus-dev/odysseus; nie przenosić ani nie resetować ich, nie zakładać prawa push do upstream. Worktree pokazuje commit, nie kopiuje automatycznie niezacommitowanych zmian — potrzebna ich osobna kopia/selektywny commit przed przeniesieniem.

Publikujemy gałąź dokumentacyjną bez merge do głównego deployu. Zmiany kodu, workflow, DDL i usług przygotujemy później jako konkretne diffy na osobnych gałęziach, po sprawdzeniu UUID i uprawnień.

**POTWIERDZONE wynikiem publikacji:** przygotowano commit sześciu dokumentów na docs/local-first-ai-review. Push do origin nie został wykonany: lokalny Git nie ma uwierzytelnienia HTTPS (could not read Username). Repozytorium da się odczytać, ale sam publiczny odczyt nie daje prawa zapisu. Po autoryzacji Git lub zainstalowaniu i połączeniu GitHub należy opublikować tę gałąź; nie przekazywać PAT do czatu. Nie utworzono zdalnego branchu ani PR-a.

**WYMAGA WERYFIKACJI przed uruchomieniem n8n:** przypięta wersja zgodna z użytymi node’ami, osobny trwały stan/backup, secret encryption key poza repo, oddzielne credentials importera i agenta, HTTPS/publiczny chat oraz prywatny panel admin. Pole active w eksportach nie potwierdza żadnej z tych konfiguracji. Instalacja i import pozostają poza obecną zgodą „audyt i dokumentacja”.

**POTWIERDZONE 14.10.2026:** aktualizacja audytu N1–N4 została zacommitowana lokalnie. Automatyczna kontrola bezpieczeństwa odrzuciła push docs/local-first-ai-review do origin: dokumenty zawierają informacje o lokalnej infrastrukturze, a transcript nie potwierdza zaufanego/prywatnego celu ani konkretnej zgody na publikację tej zawartości. Nie obchodzono odmowy i nie ponawiano push. Odczyt widoczności repo przez narzędzie web nie powiódł się, więc nie deklarujemy jego publiczności/prywatności. Do publikacji pełnego audytu potrzebna jawna zgoda na tę zawartość i ten repozytoryjny cel; wcześniejszy brak uwierzytelnienia Git pozostaje osobną możliwą przeszkodą.
