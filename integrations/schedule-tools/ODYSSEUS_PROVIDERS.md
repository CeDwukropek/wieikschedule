# Modele OpenAI i Google przez Odysseusa

## Stan przygotowania

Wybór połączenia w ustawieniach planu obsługuje metadane dostawcy z katalogu
Odysseusa: `provider`, `execution` (`local` albo `cloud`) oraz `destination`.
Połączenie z chmurą jest wyraźnie opisane. Gdy katalog zawiera tylko modele
chmurowe, użytkownik sam wskazuje połączenie; aplikacja nie wybiera go domyślnie.

**Aktywacja chmury w backendzie pozostaje zablokowana.** Obecny backend dopuszcza
wyłącznie skonfigurowane lokalne endpointy. Testy interfejsu używają fikcyjnych
katalogów; nie potwierdzają wykonania zapytań do OpenAI ani Google.

## Klucze i narzędzia

Klucze OpenAI i Google Gemini mają być pobierane przez backend Odysseusa z jego
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

Przed aktywacją potrzebna jest wyraźna zgoda na wysyłanie tych danych do OpenAI
oraz Google. Automatyczna kontrola zgód odrzuciła pierwszą próbę aktywacji:
dotychczasowa zgoda na podłączenie dostawców nie określała wprost danych
i obu odbiorców. Nie zmieniono dozwolonych endpointów wdrożenia.

## Następny etap

Po uzyskaniu zgody: dopuścić istniejące połączenia OpenAI i Google w backendzie,
zweryfikować dokładny adres dostawcy, odczytywać dostępne modele z Odysseusa,
zachować kontrolę uprawnień i brak automatycznego przełączania dostawcy.
Testy rzeczywistych wywołań powinny używać krótkich danych syntetycznych.

Backend zachowuje metadane wywołania narzędzi `extra_content` w obrębie bieżącego
żądania. Jest to potrzebne m.in. do kontynuacji wywołań Gemini z podpisami
rozumowania. Nie zwraca tych metadanych jako wyniku dla przeglądarki.

Dokumentacja dostawców:

- [OpenAI: function calling](https://developers.openai.com/api/docs/guides/function-calling)
- [Google Gemini: OpenAI compatibility](https://ai.google.dev/gemini-api/docs/openai)
