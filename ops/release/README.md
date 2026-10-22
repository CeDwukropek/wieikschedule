# Wydanie E5 — baza Supabase

Kolejność dla produkcyjnego projektu Supabase, który nie obsługuje jeszcze `main`.
Każdy krok zatrzymuje się na pierwszym błędzie. Adres bazy (session pooler, rola
`postgres`) trzymaj w pliku env poza repozytorium jako `DB_URL`.

```sh
docker run --rm --env-file <plik z DB_URL> -v "$PWD":/repo:ro -v <katalog planu>:/plan:ro \
  postgres:17-bookworm sh /repo/ops/release/apply.sh <krok>
```

1. **Kopia:** `pg_dump --schema=public -Fc` przed jakąkolwiek zmianą.
2. **Stary writer:** wyłączyć workflow „Firebase Insert” w n8n (kasuje i wstawia `events`).
3. `check` — liczba wydarzeń, brak kolumn źródła, 0 dopisków i tagów, rola `service_role`.
4. `identity` — `20261014_wieik_import`, `20261015_unlinked_bootstrap`.
5. Plan czystego przeładowania z aktualnego źródła:
   `node integrations/schedule-import/cli.cjs transform stac.json block.json > normalized.json`,
   `node integrations/schedule-import/cli.cjs fresh normalized.json > fresh-plan.json`,
   zapisać `rpc.p_changes` jako `<katalog planu>/changes.json`.
6. `reload` — [fresh-load.sql](fresh-load.sql): w jednej transakcji sprawdza brak danych
   prywatnych, usuwa wszystkie `events` i wstawia plan z nowymi UUID.
7. `private` — `20261015_personal_overrides`, `20261021_calendar_links`,
   `20261022_calendar_writes`, `20261023_plan_versions_and_hygiene`, `20261024_release_hardening`.
8. `verify` — liczności, brak wierszy bez źródła, największy plan (limit 1000 wierszy API),
   `anon` czyta tylko `events`/`faculties`/`timetable_versions`, FK do `events` = RESTRICT.
9. Import nocnego workflow ([n8n-nightly.json](../../integrations/schedule-import/n8n-nightly.json)),
   credential, aktywacja; potem deploy aplikacji.

Próba 22.10.2026 na kopii schematu produkcji z 06.09 z ustawieniami Supabase (domyślne
uprawnienia, `rls_auto_enable`, CASCADE): wszystkie kroki w 2,5 s, 7027 wierszy z migawki
15.10, testy SQL `database-test`, `calendar-links-test`, `plan-versions-test` zaliczone.

Wycofanie przed deployem aplikacji: odtworzyć kopię z kroku 1. Po deployu nie usuwać
danych użytkowników; wyłączyć flagi `REACT_APP_PERSONAL_SCHEDULE` i `REACT_APP_CALENDAR_SYNC`.
