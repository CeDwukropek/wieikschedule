# Naprawa importera WIEiK — pierwszy etap wdrożenia

Kod przygotowany na `fix/schedule-import-identity`, z aktualnego
`alpha-online-account`. Nie zmienia frontendu, Firebase ani działającego
Odysseusa. Nie zastosowano migracji na produkcji i nie uruchomiono tam n8n.

## Co naprawia

Stary eksport `Firebase Insert.json` przekazuje do zapisu tylko wydarzenia
z przecinkiem w grupie, a następnie wykonuje INSERT bez ID. Ten pakiet:

- Zachowuje pojedyncze grupy, wszystkie części grup wielokrotnych oraz NULL.
- Zachowuje dni wolne `all`/`wolne`/07:00–22:00 i źródłowe NULL.
- Zachowuje odwołania jako `nieaktywne`, które obecne czytniki ukrywają.
- Oddziela tekstowy klucz źródła od UUID `events.id`.
- Aktualizuje istniejący rekord, zachowując UUID oraz dopiski/tagi.
- Przy zniknięciu źródła wymaga decyzji o oznaczeniu rekordu jako nieaktywnego;
  nie wykonuje DELETE. Ponowne pojawienie się przy tym samym kluczu przywraca UUID.
- Generuje najpierw raport i plan. Nierozstrzygnięta tożsamość blokuje cały plan.
- Zapisuje zatwierdzony plan atomowo. Zmiana bazy od czasu przygotowania planu
  unieważnia go; kolizja źródłowego klucza wycofuje wszystkie zapisy.

Pozostaje obecny model jednego rekordu na grupę, aby zachować istniejące
UUID i sposób filtrowania. Nie scala grup ani duplikatów automatycznie.
Zachowuje także dotychczasowe etykiety typów, w tym pisownię „Labolatorium”.
Słownik `faculties` nie jest zapisywany przez ten importer — obecny frontend
pobiera dostępne plany z `events`. Naprawa osobnego słownika pozostaje poza tym PR.

## Granica stabilnej tożsamości

Publiczne API zwraca ID **serii**, daty powtórzeń, `excludedDates` i mapę
`overrides`. Nie zwraca trwałego ID pojedynczego wystąpienia. Klucz kandydujący
ma postać JSON `["stac", series_id, nominal_date, group]`, a dzień wolny
`["block", date]`. Data, grupa i ID serii mogą się zmienić. To nie jest
uniwersalnie stabilny identyfikator wystąpienia.

Przy niezmienionym kluczu import sali, prowadzącego, godziny lub NULL jest
automatycznie rozpoznawany jako aktualizacja tego samego UUID. Zmiana daty,
grupy lub źródłowego ID wymaga jawnego przypisania do starego UUID. Nie stosujemy
fuzzy matching ani hasha treści jako dowodu tożsamości.

Jeżeli źródło reprezentuje przeniesienie jako odwołanie starej daty i `_add`
na nowej, oba rekordy nadal są obecne w snapshotcie. Aby przenieść prywatne
powiązania wraz z wydarzeniem, trzeba przypisać nowe wystąpienie do starego UUID
oraz jawnie utworzyć osobny nieaktywny rekord dla odwołanej daty. Jeśli nie ma
pewności, czy to przeniesienie, raport pozostaje zablokowany.

Walidacja `ok`, obu odpowiedzi i metadanych wykrywa błędy odpowiedzi, ale nie
stanowi dowodu kompletności danych po stronie upstream. Dlatego zniknięcia
nigdy nie powodują automatycznej dezaktywacji. Pusty `stac` jest odrzucany.
Patche poza siatką dat z `_add=false` i bez odwołania są raportowane jako
`orphan_override`, zamiast tworzyć nieistniejący termin. Odwołania poza siatką
pozostają nieaktywne. Jeśli dawny aktywny rekord zniknie przy skróceniu serii,
planner nadal wymaga jawnej decyzji o jego dezaktywacji.
Obsługiwane są globalne bloki `scope=all`; inne zakresy i sprzeczne etykiety
tego samego dnia blokują parser. Zakres serii/bloku jest ograniczony do dwóch lat,
a wynik do 50 000 rekordów. Limity te chronią importer, nie ograniczają czasu
prywatnych zmian użytkownika do 07:00–22:00.

**Bramka G0 pozostaje niezaliczona dla produkcji**, dopóki nie zostaną sprawdzone
mapowania rzeczywistych UUID, bieżące triggery/FK i działanie na odtworzonej kopii
bazy. Przykłady i testy syntetyczne nie zastępują tej weryfikacji. Ten PR nie
wdraża tabeli overrides zależnej od niezweryfikowanej tożsamości.

## Przygotowanie offline

Wymagany Node 22. Brak nowych zależności npm. Pliki robocze i eksporty bazy
trzymaj poza repozytorium. Wszystkie polecenia poniżej tylko czytają wejście i
wypisują wynik; CLI nie ma dostępu do sieci ani przełącznika zapisu do bazy.

```sh
node integrations/schedule-import/cli.cjs transform /tmp/stac.json /tmp/block.json > /tmp/normalized.json
node integrations/schedule-import/cli.cjs plan /tmp/normalized.json /tmp/events.json /tmp/decisions.json > /tmp/plan.json
```

`events.json` to **kompletny**, paginowany eksport tablicy `events`, z polami
`id`, `faculty`, `date`, `start_time`, `duration_min`, `subject`, `instructor`,
`room`, `group`, `type`, `status`, `source_system`, `source_key`. Przed migracją
dwa ostatnie pola mogą być nieobecne — planner normalizuje je do NULL. Nie
eksportuj `users`, Firebase UID ani prywatnych tagów do tych plików.

`decisions.json` zawiera tylko sprawdzone decyzje:

```json
{
  "matches": [
    {
      "source_key": "[\"stac\",\"synthetic-series\",\"2026-10-05\",\"L1\"]",
      "event_id": "00000000-0000-4000-8000-000000000001"
    }
  ],
  "create": [],
  "retire": [],
  "retain_unmanaged": []
}
```

- `matches`: dokładne przypisania klucza do istniejącego UUID; służą też do
  backfill i przeniesień. Jeden UUID nie może reprezentować dwóch terminów.
- `create`: klucze jawnie uznane za nowe wydarzenia. UUID powstaje raz w planie.
- `retire`: istniejące UUID jawnie uznane za nieaktualne/duplikaty; ich rekordy i
  FK zostają. Niepowiązany stary rekord dostaje klucz `['legacy', UUID]`.
- `retain_unmanaged`: stare UUID, które świadomie pozostają poza tym importerem.
  Każdy stary rekord bez źródłowego klucza wymaga rozstrzygnięcia. Taka decyzja
  nie deduplikuje planu i nie powinna ukrywać nierozwiązanych duplikatów.

Plan z blokadami ma `ready=false`, `rpc=null` i kod wyjścia 2. Błędne dane dają
kod 1. Gotowy plan daje kod 0 i zawiera `rpc.p_expected` oraz `rpc.p_changes`.
Nie usuwaj ręcznie blokad z raportu. Zapis na kopii bazy używa dokładnie
zweryfikowanego `rpc`, nie ponownie wygenerowanego planu z nowymi UUID.

## Workflow n8n i migracja

### Raport backfill dla eksportu CSV

```sh
node integrations/schedule-import/cli.cjs report /tmp/normalized.json /tmp/events.csv > /tmp/backfill-report.json
```

Polecenie wykonuje wyłącznie porównanie. Powodzenie raportu daje kod wyjścia 0,
ale wynik **zawsze** ma `write_ready=false` i `rpc=null`. Nie jest plikiem decyzji
do `plan` i nie akceptuje ani nie wykonuje zmian w bazie.

`exact_proposals` zawiera wyłącznie pary z identyczną treścią wszystkich dziesięciu
pól harmonogramu, gdy po obu stronach jest dokładnie jeden rekord. Każda para
wymaga review przed przyjęciem tożsamości. Identyczne kopie albo wiele źródłowych
serii o tych samych danych trafiają do `exact_ambiguities`, bez dowolnego parowania.

Pozostałe rekordy trafiają do `review`: ten sam dzień wolny ze zmienioną etykietą,
ten sam slot, te same szczegóły w danym dniu lub podobne szczegóły w innych datach.
Raport wskazuje zmienione pola, kandydatów zajętych przez ścisłą propozycję oraz
konkurujące UUID. Nie interpretuje podobieństwa jako dowodu przeniesienia.
`no_candidate` oznacza brak kandydata w tych konserwatywnych indeksach, a nie
potwierdzone usunięcie wydarzenia. Nowe rekordy źródła także nie są automatycznie
uznawane za polecenia INSERT.

Raport rozróżnia puste komórki w cudzysłowie od niecytowanych pustych komórek.
Dla nullable pól drugi wariant jest interpretowany jako NULL i odnotowany
w `evidence.inferred_nulls`. Sam CSV może nie wystarczać do potwierdzenia różnicy
między NULL i pustym tekstem — przed zapisem sprawdzić ją na bazie. Fingerprint
służy do porównania treści podczas backfill; nie jest trwałym źródłowym ID.

Listy kandydatów i listy konkurujących UUID są ograniczone do 25 pozycji,
z jawną licznością i flagą obcięcia. Pliki wejściowe i pełny raport przechowuj
lokalnie poza Git; testy w repozytorium używają danych syntetycznych.

Zbiorczy wynik dostarczonego eksportu: [BACKFILL_AUDIT.md](BACKFILL_AUDIT.md).

### Podgląd n8n

`n8n-preview.json` to nieaktywny, przenośny workflow do pobrania dwóch publicznych
snapshotów i wykonania tego samego walidatora. Nie zawiera credentiali, zapisu
do Supabase, chatu ani narzędzi agenta. To podgląd, nie automatyczny scheduler.
Wersje node’ów pochodzą z dostarczonego eksportu; import i wykonanie w docelowym
n8n wymagają testu, którego jeszcze nie wykonano. Generowanie i kontrola:

```sh
node integrations/schedule-import/build-preview.cjs
node integrations/schedule-import/build-preview.cjs --check
```

Migracja [20261014_wieik_import.sql](../../DB/migrations/20261014_wieik_import.sql)
jest addytywna: dwa nullable pola, sprawdzenie kompletności pary, unikalność
źródłowego klucza i funkcja `apply_wieik_import`. Nie jest uruchamiana przez build.
Nie zakładaj, że instalacja pliku SQL rozwiązuje mapowanie starych rekordów.

Na kopii Supabase, po migracji i review planu, zaufany importer może wysłać
obiekt `rpc` jako body `POST /rest/v1/rpc/apply_wieik_import`. Uprawnienie EXECUTE
ma tylko `service_role`; funkcja działa jako wywołujący. Privileged credential
pozostaje wyłącznie w zaufanym importerze, oddzielnie od obu agentów i frontendu.
Nie udostępniaj funkcji jako narzędzia AI. Funkcja blokuje zapisy do `events` na
czas krótkiej transakcji i porównuje kompletny snapshot bazy przed aktualizacją.
Wiele zmian i kolizje kluczy są transakcyjne; UUID istniejących rekordów nie są
zmieniane. Przy błędzie CAS pobierz pełny eksport i ponownie przejrzyj plan.

Nie łącz podglądu ze starym node’em Supabase Create. Docelowa konfiguracja
schedulera/writera w n8n jest kolejnym krokiem po testach mapowania i zatwierdzeniu
wdrożenia. Sama publikacja tego PR nie zmienia sposobu synchronizacji produkcji.

## Testy i wycofanie

```sh
node --test integrations/schedule-import/*.test.cjs
psql -v ON_ERROR_STOP=1 -f integrations/schedule-import/database-test.sql
```

Drugie polecenie wymaga **pustej, jednorazowej bazy PostgreSQL 17** — tworzy role,
tabele i syntetyczne dane. Nigdy nie uruchamiaj tego pliku na Supabase/produkcji.
GitHub Actions tworzy osobną bazę do tych testów. Scenariusze obejmują kompletny
strumień, NULL, przeniesienia, powtórne importy, dezaktywację/reaktywację,
zachowanie FK, blokadę zapisu użytkownika, konflikt źródłowego klucza i stary plan.

Po merge ten kod nadal pozostaje nieaktywny aż do wdrożenia na kopii.
Po przyszłym uruchomieniu writera: zatrzymaj go w razie problemu, zachowaj
UUID/klucze źródła i dane użytkowników. Nie wracaj do starego Create/INSERT,
bo odtworzy duplikaty. Nie usuwaj danych ani kolumn jako automatycznego rollbacku.

Opis uprawnień i wywoływania funkcji:
[Supabase database functions](https://supabase.com/docs/guides/database/functions).
Semantyka transakcji i blokad:
[PostgreSQL explicit locking](https://www.postgresql.org/docs/17/explicit-locking.html).
