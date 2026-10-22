# Wydanie E5 — baza Supabase

Kolejność dla produkcyjnego projektu Supabase, który nie obsługuje jeszcze `main`.
Każdy krok zatrzymuje się na pierwszym błędzie. Adres bazy (session pooler, rola
`postgres`) trzymaj w pliku env poza repozytorium jako `DB_URL`.

```sh
docker run --rm --env-file <plik z DB_URL> -v "$PWD":/repo:ro -v <katalog planu>:/plan:ro \
  postgres:17-bookworm sh /repo/ops/release/apply.sh <krok>
```

1. **Kopia:** `pg_dump --schema=public -Fc` przed jakąkolwiek zmianą.
2. **Stary writer:** workflow „Firebase Insert” nie działa (jednorazowe ręczne uruchomienie
   ok. 3 miesiące temu). Nie uruchamiać go ponownie: kasuje i wstawia `events`.
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
9. Nocny import działa na osobnym, produkcyjnym n8n ([compose](../production/n8n/compose.yml),
   kontener `wieikschedule-production-n8n-n8n-1`, panel w tailnecie na porcie 8446).
   `ALERT_EMAIL=<adres> ops/release/n8n-import.sh <kontener n8n>` importuje import
   i workflow alertu (adres podstawiany w locie, nie trafia do repozytorium). W n8n wybrać
   credentiale „wieikschedule Supabase (session pooler)” i „wieikschedule alerts (SMTP)”, potem
   aktywować **oba** workflow — w n8n 2.x nieaktywny workflow alertu nie zostanie wywołany.
   Na koniec deploy aplikacji.

Próba 22.10.2026 na kopii schematu produkcji z 06.09 z ustawieniami Supabase (domyślne
uprawnienia, `rls_auto_enable`, CASCADE): wszystkie kroki w 2,5 s, 7027 wierszy z migawki
15.10, testy SQL `database-test`, `calendar-links-test`, `plan-versions-test` zaliczone.

Wycofanie przed deployem aplikacji: odtworzyć kopię z kroku 1. Po deployu nie usuwać
danych użytkowników; wyłączyć flagi `REACT_APP_PERSONAL_SCHEDULE` i `REACT_APP_CALENDAR_SYNC`.
