# Modele OpenAI i Google przez Odysseusa

## Działanie

Wybór połączenia w ustawieniach planu obsługuje metadane dostawcy z katalogu
Odysseusa: `provider`, `execution` (`local` albo `cloud`) oraz `destination`.
Połączenie z chmurą jest wyraźnie opisane. Gdy katalog zawiera tylko modele
chmurowe, użytkownik sam wskazuje połączenie; aplikacja nie wybiera go domyślnie.

Backend dopuszcza lokalne serwery oraz oficjalne API OpenAI i Google Gemini,
wyłącznie z listy dopuszczonych połączeń operatora. Używa istniejącej listy modeli
Odysseusa i uprawnień konta. Odfiltrowuje znane modele obrazu, audio i embeddingów;
pozostała lista nie gwarantuje zgodności każdego modelu z narzędziami ani limitu API.

## Klucze i narzędzia

Klucze OpenAI i Google Gemini są pobierane przez backend Odysseusa z jego
istniejących połączeń. Użytkownik planu nie podaje ich ponownie, a przeglądarka
nie otrzymuje kluczy w odpowiedzi katalogu. Nadal potrzebne jest uwierzytelnienie
do Odysseusa, np. token z uprawnieniem `chat`.

Zmiana modelu nie uruchamia pełnego agenta Odysseusa. Plan używa własnej pętli
narzędzi i podpisanego kontekstu wybranego planu oraz grup. Zmiany wymagające
zatwierdzenia pozostają podglądami potwierdzanymi w aplikacji.

## Dane przekazywane modelowi po aktywacji

Do wskazanego dostawcy trafią wiadomość użytkownika, historia rozmowy, wybrany
plan i grupy oraz wyniki narzędzi, w tym dane planu i osobistych zmian potrzebne
do odpowiedzi. Po zaznaczeniu pamięci trafi tam także pobrany kontekst pamięci
i dokumentów konta Odysseusa. Klucze Firebase, Supabase i podpisany token
kontekstu nie są treścią promptu. Opłaty nalicza konto API dostawcy.

Zgoda na przesyłanie tych danych dotyczy wykonania zapytania i nie włącza
udostępniania danych do trenowania. Integracja nie zmienia ustawień kont dostawców.
Zasady treningu i retencji zależą od dostawcy i konfiguracji konta; brak treningu
nie jest równoznaczny z zerową retencją. Operator uzyskał zgodę użytkownika na
OpenAI i Google po wyjaśnieniu tej różnicy.

## Uruchomienie

W menu Model AI wybierz **Modele skonfigurowane w Odysseusie**, sprawdź połączenie,
wybierz dostawcę i model, a następnie zapisz ustawienia. Nadal potrzebujesz
uwierzytelnienia do Odysseusa. Pole bezpośredniego API OpenAI przez n8n jest osobną
ścieżką i nie aktywuje połączeń skonfigurowanych w Odysseusie.

Operator dopisuje istniejące ID połączeń do `SCHEDULE_MODEL_ENDPOINT_IDS`.
Dozwolone chmurowe adresy bazowe to `https://api.openai.com/v1` oraz
`https://generativelanguage.googleapis.com/v1beta/openai`. Wybrane połączenie
musi być jawnie przekazane; brak lub usunięcie modelu nie przełącza dostawcy.
Własny serwer lokalny pozostaje osobnym wyborem.

## Test rzeczywistych modeli

`provider-staging-test.cjs` wymaga `RUN_PROVIDER_MODEL_TEST=1`, lokalnego stagingu
oraz pliku tokenu Odysseusa. Używa tymczasowego użytkownika planu i dwóch osobnych
rozmów, bez pamięci i osobistych danych użytkownika. Sprawdza rzeczywiste OpenAI
`gpt-4.1-mini` i Google `gemini-3.1-flash-lite`: model wywołuje narzędzie planu i zwraca
wynik zgodny z backendem. Wywołania mogą być płatne. Skrypt usuwa użytkownika planu;
operator usuwa wskazane w raporcie syntetyczne sesje testowego Odysseusa.

Backend zachowuje metadane wywołania narzędzi `extra_content` w obrębie bieżącego
żądania. Jest to potrzebne m.in. do kontynuacji wywołań Gemini z podpisami
rozumowania. Nie zwraca tych metadanych jako wyniku dla przeglądarki.

Dokumentacja dostawców:

- [OpenAI: function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Google Gemini: OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)

- [OpenAI: wykorzystanie i retencja danych API](https://developers.openai.com/api/docs/guides/your-data)
- [Google Gemini: warunki wykorzystania danych](https://ai.google.dev/gemini-api/terms)

## Wynik wdrożenia na stagingu

2026-10-18: oba rzeczywiste testy model → narzędzie planu → odpowiedź zgodna
z backendem zakończyły się HTTP 200: OpenAI `gpt-4.1-mini` (5 s) i Google
`gemini-3.1-flash-lite` (4 s). Testy nie włączały pamięci. Syntetyczne konta planu
i teksty obu udanych rozmów usunięto po weryfikacji.

Google `gemini-2.5-flash` zwrócił HTTP 404 mimo obecności w katalogu. Nie usuwamy
modeli z konfiguracji właściciela na tej podstawie; aplikacja wyświetla czytelny
błąd i pozwala samodzielnie wskazać inny model. Nie przełącza dostawcy automatycznie.

Walidacja: 62 testy React, 49 testów adaptera Python, 24 testy kontraktów Node,
kompilacja obrazu aplikacji i wdrożenie na stagingu.
