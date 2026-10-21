# „Mój plan” — przebudowa prywatnych zmian i edycji zajęć (21.10.2026)

## Problem

- Dwa niezależne przepływy: dopiski (odrabianie) usuwane od razu, prywatne zmiany
  przez „Podgląd → Zatwierdź” ważny 10 minut. Dla użytkownika to jedno: zmiany w planie.
- Podgląd z zatwierdzeniem powstał dla agenta; przy ręcznej edycji jest zbędnym krokiem.
- Propozycje agenta żyją tylko w pamięci strony i znikają po odświeżeniu.
- Odwołane zajęcia znikają z tygodnia bez śladu; przeniesione nie pokazują oryginału.
- „Moje zmiany” to rozwijana lista nad kalendarzem bez „przed → po” i bez dopisków.
- Okno edycji wymaga zaznaczania checkboxów pól (`patch`), ma surowe pola i
  pokazuje „Przed/Po” jako dwie pełne listy; kolizje nie są sprawdzane.
- Plan efektywny składany jest w kilku miejscach (tydzień, dopiski, ICS, backend).

## Decyzje (zatwierdzone 21.10.2026)

1. Ręczna zmiana zapisuje się od razu, z powiadomieniem „Cofnij”. Podgląd i
   zatwierdzenie zostają wyłącznie dla propozycji agenta. Kontrola konfliktów (CAS) bez zmian.
2. „Mój plan” jako wysuwany panel boczny z licznikiem, sekcje: Do zatwierdzenia,
   Przeniesione/zmienione, Odwołane, Odrabiania.
3. Odwołane zajęcia widoczne w tygodniu jako wyblakły, przekreślony kafelek z „Przywróć”.
4. Najpierw ta przebudowa, potem E3 integracji z Odysseusem.

Bez zmian w schemacie bazy: `schedule_overrides` i `user_added_events` zostają.

## Kroki

### A. Model i zapis od razu

- Backend `POST /api/schedule/apply` (Firebase): propose + confirm w jednym żądaniu
  (provider `manual`, idempotentne po `request_id`), zwraca wynik i dane do cofnięcia
  (poprzedni stan override). Cofnięcie to kolejne `apply` przywracające poprzedni stan.
- Backend `GET /api/my-plan/changes`: jedna lista pozycji czterech rodzajów
  z gotowym „oryginał → teraz” oraz otwartymi propozycjami agenta z bazy.
- Klient: jeden hook `usePersonalPlan` (zastępuje rozproszone `usePersonalOverrides`,
  `useMyPlanEvents` dla akcji i stan propozycji w `App.js`), jeden moduł API.

**Gotowe, gdy:** zmiana, odwołanie, przywrócenie i usunięcie dopisku działają jednym
kliknięciem z „Cofnij”; propozycja agenta przetrwa odświeżenie strony; ICS, tydzień
i odpowiedzi agenta pokazują ten sam plan; testy A/B, CAS i konfliktów przechodzą.

### B. Okno zajęć i panel „Mój plan”

- Okno zajęć jako jedyne miejsce akcji: Przenieś, Zmień salę, Odwołaj u mnie,
  Przywróć; linia „Oryginalnie: …” dla zmienionych.
- Formularz „Przenieś”: data tylko pon.–pt., godziny z siatki zajęć, długość
  domyślnie oryginalna z widoczną godziną końca, kolizje na bieżąco;
  prowadzący i powód pod „Więcej”.
- Panel boczny „Mój plan” z sekcjami i akcjami; przeszłe pozycje zwinięte.

### C. Wygląd kalendarza

- Odwołane: wyblakły, przekreślony kafelek z „Przywróć”.
- Przeniesione: znacznik i przerywany obrys w oryginalnym miejscu.
- Odrabianie: własny znacznik. Przeciąganie kafelków — ewentualnie później.

## Stan (21.10.2026)

- **Krok A gotowy i wdrożony na stagingu** (gałąź `feat/personal-plan-redesign`):
  `POST /api/schedule/apply`, `GET /api/my-plan/changes`, hook `usePersonalPlan`,
  `UndoToast`; okno zmiany zapisuje od razu, propozycje agenta przetrwają odświeżenie,
  usunięcie dopisku można cofnąć. Usunięto `usePersonalOverrides`.
  Testy: Node 43, React 71. Wycofanie: obraz `wieikschedule-staging-app:before-personal-plan-a`.
- Uwaga dla kolejnych zmian: build stagingu traktuje ostrzeżenia ESLint jako błędy;
  przed wdrożeniem uruchamiać lint w obrazie aplikacji.
- **Krok B gotowy i wdrożony na stagingu:** okno zajęć z akcjami (Przenieś, Zmień salę,
  Odwołaj u mnie / Usuń z mojego planu, Przywróć plan uczelni) i linią „Oryginalnie”,
  formularz „Przenieś” (pon.–pt., zakres planu, godziny z siatki, koniec liczony z długości,
  kolizje na bieżąco, prowadzący i powód pod „Więcej”), to samo okno w widoku dnia,
  panel boczny „Mój plan” z propozycjami agenta. Usunięto `PersonalChangeDialog`.
  Nowe edycje łączą się z wcześniejszym `patch`. Testy React: 80.
  Wycofanie: obraz `wieikschedule-staging-app:before-personal-plan-b`.
- **Następny: krok C** — odwołane jako wyblakłe kafelki, obrys oryginalnego miejsca przeniesionych.
