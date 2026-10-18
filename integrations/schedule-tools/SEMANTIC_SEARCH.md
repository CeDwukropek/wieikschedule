# Semantyczne narzędzia planu — staging, 16.10.2026

Wspólny backend dla n8n i natywnego Odysseusa rozpoznaje przedmiot osobno od
rodzaju zajęć. Obsługuje polskie znaki, konserwatywne odmiany i skróty (np. MUD).
Podobne nazwy i literówki wymagają doprecyzowania; nie są automatycznie wybierane.

- `schedule.find_subjects`: katalog przedmiotów wybranego planu i niejednoznaczności.
- `schedule.get_next_occurrence`: najbliższy termin, domyślnie w całych dostępnych
  przyszłych danych, np. `{"query":"Modelowania układów dynamicznych","kind":"laboratory"}`.
- `schedule.get_my_schedule`: efektywny plan, zakres do 31 dni, filtrowanie przed paginacją.
- `schedule.find_makeup_options`: rzeczywiste terminy innych grup i kolizje;
  wymaga intencji makeup i nie zapisuje zmian.

Przeglądarka przekazuje wybór planu i grup do `/api/schedule/context`.
Backend podpisuje je razem z właścicielem, dostawcą, sesją i intencją. Model
nie wybiera konta ani grup w argumentach narzędzi. Wybór obejmuje dodatkowe grupy
z opcjonalnym filtrem przedmiotu (maksymalnie 8, cała selekcja do 800 bajtów).
Zmiana grup w UI resetuje rozmowę. Katalog przedmiotów dotyczy głównego planu;
dodatkowe grupy są uwzględniane w planie i sprawdzaniu kolizji.

Odczyt stosuje prywatne dopiski, przeniesienia i odwołania. Nie zapisuje oficjalnych
events. Brak grup, niejednoznaczna nazwa, brak danych w zakresie i błąd odczytu
mają osobne statusy. `available_range` opisuje granice dostępnych danych.
Odysseus używa wiadomości backendu jako odpowiedzi dla odczytów; wynik zawiera
`evidence`. Próba odpowiedzi bez odczytu wymusza ponowne wywołanie narzędzia,
a powtórzenie kończy się informacją o braku weryfikacji.

## Filtry i prezentacja planu — 18.10.2026

`schedule.get_my_schedule` przyjmuje `kind` oraz `exclude_kinds`, np.:

```json
{"date_from":"2026-10-19","date_to":"2026-10-23","kind":"exercise","exclude_kinds":["lecture","laboratory"]}
```

Filtr działa przed sprawdzaniem wymaganych grup i paginacją, również dla dopisków
i dodatkowych grup. Błędne rodzaje są odrzucane. Pusty wynik z filtrem nie oznacza
braku danych planu. Backend zwraca Markdown jako tekst zastępczy i uporządkowane
wydarzenia, a Odysseus przekazuje `ui.type=schedule_plan` oraz `data.plan`.
Przeglądarka renderuje karty z podziałem na dni, godziną, przedmiotem i salą;
treści wydarzeń są zwykłym tekstem, nie kodem HTML ani Markdown.

Ostatnie sprawdzone daty i filtry są zapisywane w metadanych wiadomości natywnej
sesji, przypisane do wybranych grup. Doprecyzowanie „same ćwiczenia” zachowuje
ten zakres. Jednoznaczne „tylko/same …” i „bez …” są kontrolowane przed wywołaniem
narzędzia, także gdy model pominie filtr. Bardziej złożone prośby nadal wymagają
poprawnego rozpoznania przez model; nie są zgadywane przez parser.

Test rozmowy: `filtered-plan-staging-test.cjs` — pełny tydzień, potem dokładna
prośba „bez wykładów, bez Labów, same ćwiczenia”, z porównaniem wyniku do backendu.
Wymaga jawnej flagi testu, stagingu i tokenu Odysseusa. Korzysta z zatwierdzonych
API i syntetycznego konta, bez pamięci i notatek. Może naliczać opłaty API.

Zweryfikowano na stagingu OpenAI `gpt-4.1-mini` i Google `gemini-3.1-flash-lite`:
17 pozycji tygodnia → 6 ćwiczeń, ten sam zakres 19–23.10.2026. Zwrócone UUID
odpowiadały dokładnie filtrowanemu wynikowi backendu. Syntetyczne konta i rozmowy
usunięto. Przeszło 65 testów React, 27 testów kontraktów Node i 61 testów adaptera.

## Weryfikacja wcześniejszej integracji

Testy jednostkowe obejmują odmiany nazw, grupy L/Lk i języki, niejednoznaczność,
termin poza 14 dniami, nadpisania, dopiski, dodatkowe grupy, kolizje, paginację,
awarie i czas Europe/Warsaw. Test REST/RPC na stagingu tworzy tymczasowe konta,
sprawdza izolację A/B, anulowanie/przywrócenie, przeniesienie, dopisek oraz relay
n8n i usuwa dane w finally. Skrypt: `semantic-staging-test.cjs`; wymaga jawnych
flag stagingu. `SKIP_NATIVE_MODEL=1` pomija inferencję.

Nowa rozmowa z Gemmą pozostaje do sprawdzenia: lokalny serwer modeli jest
niedostępny, a użytkownik polecił przygotować integrację bez tego testu.
Testy mostu Odysseusa używają kontrolowanych odpowiedzi modelu. Relay n8n jest
przetestowany; uruchomienie hostowanego agenta n8n, codzienny importer i RAG
pozostają osobnymi zadaniami.

Źródło stagingu: worktree `wieikschedule-agent-search`, gałąź
`feat/semantic-schedule-tools`. Współdzieli ignorowany stan `.staging` z poprzednim
worktree. Lokalna zmiana SettingsPanel w `wieikschedule-staging` pozostaje nietknięta.
