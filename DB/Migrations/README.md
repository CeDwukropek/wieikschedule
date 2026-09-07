# Optymalizacja odczytów — 2026-09-07

## Kolejność wdrożenia

1. Tabela `public.faculties` musi udostępniać `short_name` i `name` klientowi
   frontendowemu przez SELECT (odpowiednie granty i polityka RLS, jeśli RLS jest włączone).
   `short_name` musi dokładnie odpowiadać wartościom `events.faculty`.
   `id` tabeli nie jest identyfikatorem planu w aplikacji.
2. Uruchom `20260907_add_my_plan_event.sql` w Supabase SQL Editor przed wdrożeniem API.
   Skrypt tworzy funkcję RPC i przyznaje jej wykonanie wyłącznie `service_role`.
   Nie zmienia istniejących danych ani tabel. Obsługuje też starszą tabelę
   `user_added_events` zawierającą `schedule_name`.
3. Wdróż API i frontend. Endpoint dodawania wymaga funkcji RPC;
   bez migracji dodawanie zwróci błąd. Dotychczasowe API działa również po migracji,
   więc kolejność baza → aplikacja nie wymaga przerwy w działaniu.

## Zachowanie aplikacji

- Lista planów pochodzi wyłącznie z `faculties`; pomijane są puste `short_name` i `all`.
- Plan kierunku i wydarzenia `faculty = 'all'` są cache'owane osobno przez 15 minut.
  Ręczne odświeżenie odświeża wspólne wydarzenia raz, potem wybrane plany.
  Wspólne wydarzenia pojawiają się raz także przy dołączaniu grup z innych planów.
- „Mój plan” pobiera tylko tydzień widocznego widoku. Cache jest świeży przez minutę,
  a starsze dane mogą służyć jako awaryjny podgląd offline przez 7 dni.
  Udane dodanie/usunięcie aktualizuje świeży tydzień bez kolejnego GET.
  Niekompletny lub nieświeży tydzień wymaga ponownego odczytu po mutacji.
- Ustawienia trafiają od razu do localStorage, a do Firestore po 800 ms bez zmian.
  Ukrycie strony próbuje wysłać oczekujący zapis wcześniej. Zamknięcie przeglądarki
  nie gwarantuje ukończenia zapisu sieciowego; kopia lokalna pozostaje zachowana.

## Weryfikacja

`npm.cmd test -- --watchAll=false --runInBand`

`node --test tests/api/add-event.test.cjs`

Test SQL `DB/Tests/add_my_plan_event.sql` należy uruchamiać tylko na pustej,
tymczasowej bazie PostgreSQL, podając ścieżkę migracji przez
`psql -v ON_ERROR_STOP=1 -v migration_path=... -f DB/Tests/add_my_plan_event.sql`.
Tworzy własne tabele i role; nie jest skryptem do uruchamiania na produkcji.
