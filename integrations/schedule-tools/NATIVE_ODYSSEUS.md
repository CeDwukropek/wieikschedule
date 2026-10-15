# Natywny lokalny agent

Integracja korzysta z transportu modeli, konta, sesji i historii Odysseusa.
Wspólny gateway aplikacji udostępnia cztery narzędzia planu. Model lokalny nie
dostaje klucza Supabase ani Firebase ID token. n8n nie uczestniczy w tej ścieżce.

## Użycie na stagingu

W Menu → Model AI wybierz **Lokalny agent / Odysseus**. Wpisz adres integracji
`https://cedwukropekserver.tail18c1e.ts.net:8444/local-odysseus` oraz token z pliku
`.staging/odysseus-access-token.txt` na serwerze. Nie kopiuj tego pliku do GitHub.
Kliknij sprawdzenie połączenia, wybierz endpoint i model, zapisz ustawienia.
Pierwszy potwierdzony model: `google/gemma-4-26b-a4b-qat` na własnym serwerze użytkownika.

Token dostępu Odysseusa pozostaje w pamięci strony; po jej odświeżeniu trzeba
wprowadzić go ponownie. W Firebase zapisujemy adres, wybór modelu i opcję
pamięci. Zapisany wcześniej klucz OpenAI jest zachowany. Konto Firebase nadal
określa właściciela prywatnego planu, konto Odysseusa — właściciela sesji lokalnej.

W czacie wybierz operację: pytanie, odrobienie, przełożenie, odwołanie lub
przywrócenie. Token narzędzi jest podpisany dla tej operacji i rozmowy, ważny
5 minut. Pytanie i odrobienie nie mogą utworzyć override nawet przy błędnym
wywołaniu przez model. Dopiski wymagają kliknięcia karty istniejącego terminu;
zmiany wymagają osobnego zatwierdzenia podglądu w aplikacji.

## Osobna instancja

Gałąź aplikacji: `feat/native-odysseus-integration`.
Gałąź natywnego Odysseusa: `feat/schedule-native-bridge` w forku użytkownika.
Główny, zmodyfikowany checkout Odysseusa pozostaje nietknięty.

`ops/staging/local-ai.py` wykonuje spójny snapshot SQLite i niezbędnej
konfiguracji do ignorowanego `.staging/odysseus-data`, a następnie generuje
nowy token chat **w kopii**. Nie zmienia kont ani tokenów oryginalnej instancji.
Pliki mają ograniczone uprawnienia. Skrypt zachowuje kopię i token przy ponownym
uruchomieniu. Snapshot nie synchronizuje późniejszych zmian z oryginału.

Przykład przygotowania po pobraniu gałęzi z natywną integracją:

```sh
python3 ops/staging/local-ai.py \
  --source /path/to/current/odysseus \
  --worktree /path/to/separate/odysseus-schedule-integration \
  --origin https://your-staging-host:8444 \
  --endpoint-id ID_Z_KONFIGURACJI_ODYSSEUSA \
  --model google/gemma-4-26b-a4b-qat
docker compose --env-file .staging/compose.env --env-file .staging/local-ai.env \
  -f ops/staging/compose.yml -f ops/staging/compose.local-ai.yml up -d odysseus-local
```

Wymagany jest lokalny obraz `odysseus-custom:local` zgodny z checkoutem.
Kopia ma własne dane, logi, cookie i port loopback 7001. Automatyczne zadania i
pollery są wyłączone. Stały proxy stagingu udostępnia tylko dwa endpointy tej
kopii przez istniejący HTTPS aplikacji. Nie powstaje publiczny proxy dowolnych URL.

## Konfiguracja własnego Odysseusa

Po zastosowaniu natywnej gałęzi ustaw po stronie Odysseusa:

- `SCHEDULE_GATEWAY_URL`: zaufany, stały adres backendu aplikacji;
- `SCHEDULE_MODEL_ENDPOINT_IDS`: lista dopuszczonych lokalnych endpointów;
- `SCHEDULE_DEFAULT_MODEL`: opcjonalny model domyślny;
- `ALLOWED_ORIGINS`: dokładny origin strony, łącznie z portem.

Przeglądarka używa `GET /api/schedule/capabilities` i `POST /api/schedule/chat`.
`Authorization` uwierzytelnia konto Odysseusa, `X-Schedule-Context` deleguje
krótkotrwały dostęp do planu. Obie tożsamości i ID rozmowy wyznaczają UUID sesji.
Brak uprawnień chat/agenta, obcy origin, obcy model lub inna intencja kończą
się błędem. Lista modeli pochodzi z dopuszczonych endpointów natywnego konta.
Nie ma automatycznego przełączenia na chmurę.

Natywny runtime używa wyłącznie schematów narzędzi z gateway i umiejętności
`integrations/schedule-agent/SKILL.md`. Nie podłącza globalnych MCP, powłoki ani
potwierdzenia zmian. Maksymalnie 6 rund modelu, 4 wywołania naraz i 180 sekund.
Historia w lokalnej sesji zawiera tekst rozmowy i model, bez tokenów delegacji.

Opcja pamięci jest domyślnie wyłączona. Jej włączenie pozwala odczytać istniejącą
pamięć i indeks dokumentów właściciela w danej instancji Odysseusa. Nie tworzy
automatycznie RAG z wydarzeń, nie kopiuje plików Obsidiana i nie indeksuje rozmów.
W testowej kopii dostępność dokumentów zależy od osobnego podłączenia indeksu;
nie jest to warunek działania narzędzi planu.

## Sprawdzone

Testy Python obejmują natywną autoryzację, izolację sesji, dobór grup, kolizje,
zabronione narzędzia i transport SSE. Testy aplikacji sprawdzają oddzielenie
tokenów, wybór modelu, zmianę konta i brak zapisu tokenu Odysseusa w Firebase.

Test akceptacyjny `native-staging-test.cjs` wymaga jawnego
`RUN_LOCAL_MODEL_TEST=1`, lokalnego stagingu i tokenu kopii. Tworzy tymczasowego
użytkownika bazy, korzysta z publicznych zajęć, a po teście usuwa jego podglądy
i dane. Sprawdzono rzeczywistą Gemmę: odczyt, dwa istniejące terminy odrobienia
i jeden niezatwierdzony podgląd sali. Oficjalny rekord pozostał identyczny.
Nie jest to jeszcze test kliknięć w przeglądarce zalogowanego użytkownika.

Starszy `local-agent.cjs` pozostaje testowym adapterem zgodnego API; nie jest
natywnym Odysseusem i nie obsługuje nowego handshake aplikacji.
