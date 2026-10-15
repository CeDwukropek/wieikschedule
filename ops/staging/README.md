# Trwałe lokalne środowisko testowe

Osobny projekt Compose `wieikschedule-staging`: aplikacja React z adapterem dla
istniejących endpointów Vercel, PostgreSQL 17, PostgREST 14.18 i n8n 2.43.5.
PostgreSQL i n8n mają własne trwałe wolumeny. Nie jest to pełny Supabase Stack:
odwzorowuje używaną przez aplikację warstwę Postgres/REST. Logowanie pozostaje
w Firebase; Storage/Realtime/Supabase Auth nie są uruchamiane.

## Konfiguracja

W katalogu repozytorium zapisz eksport Vercela jako `.env.local`. Plik pozostaje
poza Git. Manager wybiera wyłącznie publiczne `REACT_APP_FIREBASE_*` oraz serwerowe
`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
Adresy i klucze Supabase, URL webhooka oraz pozostałe sekrety z eksportu są pomijane.
Generowane lokalne sekrety i plany trafiają do ignorowanego katalogu `.staging/`.

```sh
python3 ops/staging/setup.py prepare --n8n-url http://localhost:5678
docker compose --env-file .staging/compose.env -f ops/staging/compose.yml up -d --wait postgres postgrest
python3 ops/staging/setup.py seed --events-csv /path/to/events.csv
docker compose --env-file .staging/compose.env -f ops/staging/compose.yml build app
docker compose --env-file .staging/compose.env -f ops/staging/compose.yml up -d --wait app n8n
python3 ops/staging/setup.py n8n
```

Wymagane Docker/Compose i Python 3; Node działa wewnątrz kontenerów. `seed`
sprawdza marker bazy `schedule_staging`, stosuje dwie migracje importera,
ładuje dostarczony CSV i pobiera publiczne źródło. Jednorazowy bootstrap odmawia
przy prywatnych powiązaniach. Przy istniejących kluczach źródłowych `seed`
pomija import; nie resetuje danych ani wolumenów. Kolejne synchronizacje wymagają
zwykłego planu/review zgodnie z instrukcją importera.

Frontend działa bez `.env` w trybie gościa. Prawdziwe logowanie i prywatne API
wymagają konfiguracji Firebase. Serwer używa dotychczasowej weryfikacji Firebase
ID token; nie ma obejścia logowania ani testowego tokenu akceptowanego w runtime.
Staging nie tworzy kopii produkcyjnych użytkowników.

W buildzie ustawiany jest `REACT_APP_LOCAL_STAGING=true`. Tylko wtedy frontend
korzysta z REST i czatu pod własnym originem, a Firestore jest wyłączony — ustawienia
są lokalne w przeglądarce. Bez tej flagi dotychczasowe zachowanie pozostaje bez zmian.
Publiczna konfiguracja klienta jest przekazywana jako build secret, a serwerowe
sekrety są podawane wyłącznie kontenerowi API. Nie trafiają do bundle’a Reacta.

Po dodaniu lub zmianie `.env.local` powtórz `prepare` z tym samym `--n8n-url`,
`build app` i `up -d app`. Zmiana publicznej konfiguracji wymusza nowy build;
istniejące klucze lokalne, baza i konto n8n pozostają zachowane.

## Dostęp

- Aplikacja: `http://localhost:3100`.
- n8n: `http://localhost:5678`.
- Login lokalnego edytora n8n zapisany jest w `.staging/n8n-owner.txt`.
- PostgreSQL i PostgREST nie mają portów wystawionych na hoście.

Porty aplikacji i n8n nasłuchują wyłącznie na loopback. Zdalny dostęp może korzystać
z przekierowania SSH albo osobnych portów Tailscale Serve. Na serwerze, w terminalu
z uprawnieniami administratora:

```sh
sudo tailscale serve --bg --https=8444 http://127.0.0.1:3100
sudo tailscale serve --bg --https=8445 http://127.0.0.1:5678
```

Wtedy ustaw `--n8n-url` na prywatny adres HTTPS edytora z portem 8445. Nie używaj
`tailscale serve reset` ani Funnel; istniejące trasy pozostają zachowane.
Przykład alternatywnego dostępu SSH (polecenie na swoim komputerze):

```sh
ssh -N -L 3100:127.0.0.1:3100 -L 5678:127.0.0.1:5678 user@server
```

## Co faktycznie działa

Guest frontend pobiera plan z oddzielnej bazy. `/api/my-plan/*` uruchamia te same
handlery co Vercel i wymaga prawidłowego Firebase ID token. Naprawiono pomijane
`schedule_name` przy dodawaniu wydarzenia, zgodnie z dostarczonym schematem.
Anonimowy klient ma SELECT wyłącznie do publicznego planu i słownika wydziałów;
prywatne tabele są niedostępne. Service role istnieje wyłącznie lokalnie w API,
a n8n nie otrzymuje tego klucza.

n8n zawiera manualny parser źródła oraz aktywny test połączenia
`aplikacja → n8n → PostgREST`. Ten test odczytuje pojedynczy rekord i wprost
informuje, że agent AI nie jest skonfigurowany. Nie jest agentem ani writerem
synchronizacji. Nie używa modeli, prywatnych notatek ani dawnych workflow
zarządzających projektami. Prywatne overrides i wspólne narzędzia opisuje
[schedule-tools](../../integrations/schedule-tools/README.md). Tryb zewnętrznego
API jest oddzielnie aktywowany; sam zapis klucza nie uruchamia modelu.

Lokalny wariant korzysta już z natywnego Odysseusa w osobnej instancji oraz
rzeczywistego lokalnego modelu. Konfiguracja, token i zakres testów:
[natywna integracja](../../integrations/schedule-tools/NATIVE_ODYSSEUS.md).

## Weryfikacja i zatrzymanie

```sh
curl -f http://localhost:3100/staging/health
docker compose --env-file .staging/compose.env -f ops/staging/compose.yml ps
docker compose --env-file .staging/compose.env -f ops/staging/compose.yml stop
```

`stop` zachowuje dane. Ponowne `up -d` wznawia usługi. Nie używaj `down -v`
do rutynowego zatrzymywania; usuwa testową bazę i workflow. Ta konfiguracja nie
odtwarza produkcyjnych triggerów ani kompletu polityk produkcji; odzwierciedla
dostarczony kontrakt tabel i izolację lokalnego API.

Kontrakty komponentów: [PostgREST configuration](https://docs.postgrest.org/en/v14/references/configuration.html),
[n8n Docker](https://docs.n8n.io/hosting/installation/docker/),
[n8n CLI](https://docs.n8n.io/hosting/cli-commands/).
