# Agent planu — uzgodnienia i kolejne kroki

Aktualizacja: 15.10.2026, Europe/Warsaw. Uzgodnienia użytkownika uzupełniają
[kontrakt i stan implementacji](README.md). Priorytetem jest działający agent AI.
Przywracanie grup na stagingu pozostaje bez zmian, zgodnie z decyzją użytkownika.

## Modele i klucze

- Wariant API: OpenAI przez n8n; wariant lokalny: natywny Odysseus po wpięciu sesji.
- Użytkownik wprowadzi klucz przez Menu → Model AI. Backend zapisuje go
  zaszyfrowany w Firebase. Klucz nie trafia do Gita ani z powrotem do przeglądarki.
- Dropdown pobiera listę dla zapisanego klucza przez backend: GET /v1/models.
  Nie utrzymujemy ręcznie listy dostępności poszczególnych kont. Można odświeżyć
  listę i zachować zapisany model albo wpisać jego identyfikator ręcznie.
- Endpoint listujący zwraca podstawowe metadane, nie macierz zgodności z tool
  calling i konkretnym API. Obecność na liście nie oznacza, że model nadaje się
  do agenta. Przed uruchomieniem generowania potrzebna jest walidacja zgodności
  wybranego modelu/transportu; nie udawać pełnej walidacji filtrem nazwy.
- Samo pobranie katalogu nie przesyła rozmów, historii, grup ani prywatnych zmian.
  Nie uruchamia generowania i nie włącza wyłączonego transportu rozmowy.

Źródło: [OpenAI: List models](https://developers.openai.com/api/reference/resources/models/methods/list).

## Odrabianie i przełożenie zajęć to odrębne operacje

**Odrabianie** — np. „Nie było mnie na laboratorium, kiedy mogę odrobić?”:

1. Znaleźć rzeczywiste istniejące terminy odpowiednich zajęć, także innych grup,
   i sprawdzić kolizje z efektywnym planem użytkownika.
2. Pokazać terminy z datą, godziną, grupą, salą i prowadzącym oraz UUID ze źródła.
   Agent nie wymyśla terminu ani nie traktuje braku kolizji jako zgody prowadzącego.
3. Po wyborze i zatwierdzeniu dopisać istniejące wydarzenie do planu użytkownika
   z reason=makeup, wykorzystując mechanizm user_added_events.
4. Nie przesuwać pierwotnych zajęć, nie edytować terminu wybranej grupy ani nie
   odwoływać automatycznie oryginału. Nie tworzyć override z samej chęci odrobienia.

**Wyraźna prośba o przełożenie** — np. „Prowadzący przełożył te ćwiczenia na
czwartek o 12:00, popraw mój plan”:

1. Ustalić konkretne wystąpienie i docelową datę/godzinę.
2. Przygotować prywatny modify override z podglądem przed/po.
3. Zapisać dopiero po kliknięciu zatwierdzenia w aplikacji. Zmiana dotyczy
   wyłącznie użytkownika i nie ogłasza oficjalnej zmiany wszystkim studentom.

Jeżeli wypowiedź nie rozstrzyga, czy chodzi o odrobienie czy przełożenie, agent
dopytuje. Nie wybiera sam operacji przeniesienia. Walidacja intencji musi być
uwzględniona również przy wykonywaniu narzędzi, nie tylko w promptcie.

Obecne cztery tools obsługują odczyt i podglądy overrides. Natywny Odysseus
zwraca karty rzeczywistych terminów odrobienia. Kliknięcie korzysta z istniejącego
/api/my-plan/add-event. Podpisana intencja blokuje overrides w trybie odrobienia.

## Kolejność uruchomienia agenta

- [x] Izolowany staging, Firebase Auth, szyfrowany zapis klucza i ręczne podglądy.
- [x] Wspólny kontrakt czterech tools, scoped relay n8n, adapter lokalny i MCP.
- [x] Dynamiczny dropdown modeli dla zapisanego klucza; testy z katalogiem syntetycznym.
- [ ] Rzeczywisty transport modelu przez n8n z obsługą zgodności modelu/API i błędów.
- [x] Aktualnie wybrany plan, grupy i daty jako kontekst natywnej rozmowy przypisanej do konta.
- [x] Odczyt danych przez tools, wyszukiwanie i sprawdzanie kolizji terminów odrobienia.
- [x] Dwa odrębne przepływy lokalne: odrobienie istniejących zajęć i jawne przełożenie.
- [x] Rzeczywisty model lokalny Gemma: odczyt, odrobienie i niezatwierdzony podgląd sali na stagingu.
- [x] Natywna sesja Odysseusa z kontekstem tools na osobnej gałęzi i w osobnej kopii.
- [ ] Test użytkownika w zalogowanej przeglądarce: wybór lokalnego modelu, dodanie i potwierdzenie podglądu.
- [ ] Podłączenie dokumentów/RAG i automatyczne gromadzenie wiedzy; odczyt istniejącej pamięci jest opcjonalny.

Próby akceptacyjne obejmują pytanie o konkretną grupę i datę; odrobienie bez
zmiany pierwotnego terminu; przełożenie na wyraźną prośbę; doprecyzowanie
niejednoznaczności; potwierdzenie w UI; izolację kont A/B; wylogowanie; konflikt
źródła oraz spójność widoków i ICS. Model nie potwierdza zapisów przez tool.

## Wymagany osobny workflow automatycznego uaktualniania danych

- [ ] Zbudować i przetestować workflow n8n aktualizujący Supabase **codziennie**.
  Dokładna godzina pozostaje konfigurowalna; 06:00 Europe/Warsaw jest propozycją.
- [ ] Pobierać komplet planu i dni wolnych, rozwinąć serie wspólnym parserem,
  zweryfikować odpowiedzi i wykonać aktualizację przez kontrolowany importer.
- [ ] Zachować UUID istniejących wydarzeń i wszystkie prywatne powiązania.
  Bez codziennego czyszczenia events i ponownego generowania identyfikatorów.
- [ ] Błąd pobrania/niekompletny snapshot nie usuwa ostatniego poprawnego planu.
  Niejednoznaczne przeniesienia wymagają rozstrzygnięcia tożsamości.
- [ ] Pokazać czas ostatniej udanej synchronizacji; zapewnić ręczne uruchomienie
  przez administratora i czytelny wynik błędu. Odświeżenie widoku z Supabase
  nie oznacza uruchomienia importu z API uczelni.
- [ ] Po testach przygotować konkretne przełączenie produkcyjnego importera.

Synchronizacja nie korzysta z modelu AI ani klucza OpenAI. Jej uprawnienia
zapisu źródłowego planu są oddzielone od narzędzi agenta użytkownika.
