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

## Weryfikacja i ograniczenia

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
