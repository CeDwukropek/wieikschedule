# Decyzje użytkownika i brakujące materiały — aktualizacja

Data: 11.10.2026. Źródło U1: wiadomość użytkownika z H1–H5 i D-01–D-10. Źródło U2: użytkownik potwierdził, że n8n synchronizuje events i obsługuje chat. **POTWIERDZONE** przy U1/U2 oznacza treść przekazaną przez użytkownika, nie niezależny pomiar panelu. **REKOMENDACJA** opisuje przyszłą zmianę; **WYMAGA WERYFIKACJI** — konkretny brak. Zakres pozostaje dokumentacyjny, z zatwierdzonymi gałęziami i kopią kodu; nie wdrażamy jeszcze migracji ani zmian usług.

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

**H4 — tak, to istotne.** U2 potwierdza dwa zastosowania n8n. Potrzebny oczyszczony eksport workflow synchronizacji events i workflow czatu: z pierwszego sprawdzimy trwałość UUID, z drugiego zaplanujemy identyczne narzędzia i potwierdzenia dla n8n/Odyseusza. Nazwy credential i konfiguracja nodes wystarczą; bez wartości sekretów. Tego nie da się odczytać z Reactowego n8nClient.

**H5 — pytanie o działanie lokalnego trybu, nie nową architekturę.** Potrzebujemy sprawdzić, czy adapter uruchamia właściwą sesję agenta/RAG Odyseusza i tylko narzędzia schedule. Nie musisz teraz wybierać jednego modelu dla wszystkich; każdy użytkownik może używać własnego modelu. Audytor odczyta możliwości z kodu, a pierwszy użytkownik lokalnego trybu potwierdzi je testem.

## Pozostała praca człowieka — tylko gdy będzie potrzebna

| Kiedy | Co jest potrzebne i dlaczego |
| --- | --- |
| Teraz, do zamknięcia synchronizacji | Eksport dwóch workflow n8n bez sekretów. Publiczny adres głównego deployu można podać bez .env. |
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
