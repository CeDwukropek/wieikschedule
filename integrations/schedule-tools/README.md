# Prywatny plan i narzędzia v1

Uzgodniony priorytet agenta, wybór modeli, różnica między odrobieniem a
przełożeniem i wymagany codzienny importer: [plan wdrożenia](IMPLEMENTATION_PLAN.md).

Migracja `DB/migrations/20261015_personal_overrides.sql` wymaga wcześniejszej
migracji importera i stabilnych source_system/source_key. Wdrożona wyłącznie na
lokalnym stagingu po pg_dump. Produkcja pozostaje bez zmian.

## Przepływ i tożsamość

Pozostaje Firebase Auth i istniejący zaufany backend, który jako jedyny posiada
service_role. W porównaniu z pierwotną rekomendacją dokumentacji nie wprowadzamy
Firebase Third-party Auth w Supabase. Nowe tabele mają RLS i odebrane wszystkie
uprawnienia anon/authenticated; dostęp przechodzi przez weryfikację Firebase i
mapowanie UID w API. RLS nie zastępuje filtrowania właściciela w tym backendzie.
Nie wolno udostępniać service_role agentowi, modelowi, adapterowi ani przeglądarce.

`GET /api/schedule/overrides` zwraca wyłącznie własne zmiany. POST `propose` tworzy
10-minutowy podgląd: modify/cancel lub delete oznaczający przywrócenie źródła.
POST `confirm` wymaga Firebase ID token i identyfikatorów podglądu/provider/sesji.
W jednej transakcji porównuje pełny rekord źródła i poprzedni override, zapisuje
zmianę i oznacza podgląd jako zużyty. Ponowienie zwraca ten sam wynik, również po
restarcie API. Inny właściciel/provider/sesja nie może wykorzystać podglądu.
Konflikt/wygaśnięcie daje 409. Żaden z tych endpointów nie modyfikuje events.

Brak klucza patch zachowuje źródło, room/instructor:null usuwa wartość. Dozwolone
date/start_time/duration_min/room/instructor. Przesuwanie dat na pon.–pt. wynika
z obsługi widoków aplikacji; godziny 07–22, limit długości tekstu 256, powodu 1000.
Globalne zmiany pozostają niedostępne. Źródłowy importer musi nadal zachowywać UUID.

## Wspólny kontrakt

Po zweryfikowaniu Firebase POST `/api/schedule/context` otrzymuje
`{provider:"n8n"|"odysseus",session_id:"..."}`. Wynik to kontekst ważny 5 minut,
podpisany SCHEDULE_TOOL_SECRET, przypisany do właściciela, providera i rozmowy.
Tylko transport przekazuje go w Authorization do `/api/schedule/tools`.
Token nie trafia do promptu ani argumentów narzędzi. GET tego endpointu weryfikuje
kontekst i zwraca handshake. POST ma kształt `{tool,arguments}`:

- schedule.get_events: faculty, date_from, date_to, opcjonalnie limit/offset.
- schedule.find_event: to samo oraz query dopasowane do nazwy przedmiotu.
- schedule.create_override: event_id, action, patch, opcjonalnie reason.
- schedule.delete_override: event_id.

Zakres odczytu maks. 31 dni, strona maks. 100; wszystkie strony pozostają dostępne.
Przesunięcia do/z zakresu uwzględniane są po zastosowaniu prywatnej nakładki.
Tworzenie/usuwanie zwraca **podgląd**, nigdy zatwierdzenie. Delegowany token nie
jest Firebase ID token i nie działa w confirm. Wylogowanie czyści formularze,
rozmowę i podglądy w przeglądarce; już wydany kontekst narzędzi wygasa po 5 minutach.
Bez natychmiastowego mechanizmu revocation nie obiecujemy jego wcześniejszego
unieważnienia; nie daje on możliwości potwierdzenia ani odczytu kluczy API.

Definicje JSON Schema w `api/_lib/scheduleToolSchemas.js` są wspólne dla adapterów.
Na stagingu aktywny workflow n8n `Schedule — four scoped tools (preview only)`
przekazuje POST `/webhook/schedule-tools-v1` do tego samego gateway. Nie zapisuje
execution data z tokenami. Nie jest jeszcze rozmownym agentem AI.
`scheduleAgent.js` obsługuje maks. 6 kroków rozmowy i tylko te cztery narzędzia.
Testy modelu używają odpowiedzi syntetycznych, bez sieci i kosztów.

## Klucz API w Firebase

Menu → Model AI udostępnia wybór API/lokalny, dropdown modeli pobierany z OpenAI
po zapisaniu klucza (z możliwością ręcznego wpisania nazwy), pole hasła na klucz i
adres adaptera. GET ai-settings zwraca tylko has_api_key; nie ma endpointu
odszyfrowującego klucz dla przeglądarki/modelu/n8n. Backend zapisuje AES-256-GCM
z losowym IV i UID jako AAD w `scheduleAiStagingCredentials/{uid}` na stagingu,
a `scheduleAiCredentials/{uid}` przy produkcyjnej konfiguracji. Klucz szyfrujący
jest pochodną SCHEDULE_TOOL_SECRET (HKDF z oddzielną domeną). Sekret master musi
pozostać trwały i mieć backup poza Git. Jego utrata wymaga ponownego wpisania
kluczy. W Firestore nie zapisujemy historii czatu ani promptów.

Reguły w firestore.rules jawnie odmawiają dostępu klientom do obu kolekcji.
Nie zmieniono zdalnych reguł Firebase. Zapis wymaga uprawnień IAM obecnego konta
serwisowego; błędy są widoczne w UI, bez lokalnego zapisu zastępczego.

## Lokalny adapter i MCP

`local-agent.cjs` to osobny sidecar używający tego samego kontraktu. Nie zmienia
działającego checkoutu Odysseusa. Uruchom w środowisku Node 22 z zależnościami
projektu, ustawiając:

```sh
SCHEDULE_API_URL=http://127.0.0.1:3100 \
SCHEDULE_ALLOWED_ORIGINS=http://localhost:3100 \
SCHEDULE_LOCAL_MODEL_URL=http://127.0.0.1:11434/v1/chat/completions \
SCHEDULE_LOCAL_MODEL=nazwa-twojego-modelu \
node integrations/schedule-tools/local-agent.cjs
```

Adres modelu musi wskazywać loopback lub Docker host gateway. Może być to ten sam
lokalny backend co w Odysseusie, pod warunkiem obsługi function/tool calling w
formacie OpenAI-compatible. Nie jest to natywne `/api/v1/chat` Odysseusa: tamten
endpoint nie uruchamia jego narzędzi/RAG. Natywna pamięć/RAG Odysseusa nie jest
jeszcze zintegrowana z sidecarem; nie obiecujemy automatycznego zbierania wiedzy.

Nasłuch wyłącznie 127.0.0.1:3101. Przy zdalnym użyciu przygotuj osobny port HTTPS
Serve i wpisz dokładny origin strony w SCHEDULE_ALLOWED_ORIGINS. Nie resetuj
istniejących tras. Przeglądarka wysyła rozmowę bezpośrednio do tego endpointu;
publiczny backend nie wykonuje fetch na adres podany przez użytkownika.

`mcp.cjs` udostępnia te same cztery tools po stdio. Odysseus może zarejestrować
go jako osobny MCP server z env SCHEDULE_API_URL i **krótkotrwałym**
SCHEDULE_CONTEXT_TOKEN dla aktualnej rozmowy. Nie używaj jednego stałego tokenu
ani konta do rozmów wielu użytkowników. Automatyczne wiązanie takiego kontekstu
z natywną sesją Odysseusa wymaga jeszcze integracji po stronie jego osobnej
gałęzi; konfiguracja globalnego MCP z tokenem właściciela tego nie zastępuje.

## Weryfikacja

`node --test api/schedule/*.test.cjs` sprawdza kontrakt, podpisy, wygaśnięcie,
brak confirm u modelu i szyfrowanie. SQL database-test.sql działa wewnątrz
BEGIN/ROLLBACK, sprawdzając A/B, CAS, retry, null, usunięcie, expiry i granty.
React sprawdza przesunięcia, cancel, niezanieczyszczanie źródła oraz pełny ICS
ze stabilnym UID po event_id. CI tworzy niezależną bazę i syntetyczne wydarzenie.

Wycofanie stagingu: wyłącz REACT_APP_PERSONAL_SCHEDULE, zachowaj obie tabele i
sekret szyfrowania. Nie usuwaj tabel nad nowymi danymi użytkownika ani wolumenów.
