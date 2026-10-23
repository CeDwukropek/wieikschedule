# Kolokwia, sprawozdania i inne terminy — projekt E6

Status: decyzje użytkownika z 23.10.2026. E6.1 na produkcji; E6.2–E6.4 w `main` (#117, #119), na produkcji za flagą; E6.5 (panel starosty) na stagingu.
E6.1 (baza i role):
[migracja](../../DB/migrations/20261025_plan_items_and_roles.sql), [test](plan-items-test.sql),
[wydanie](../../ops/release/README.md#e61--wpisy-w-planie-i-role).
Powiązane: [plan notatek](STUDY_NOTES_PLAN.md), [audyt i roadmapa](ROADMAP_2026-10-18.md),
[kalendarz w Odysseusie](ODYSSEUS_CALENDAR_SYNC_PLAN.md).

## Cel

Student widzi w planie kolokwia, wejściówki, terminy sprawozdań i podobne wpisy swojej grupy,
a także własne, prywatne terminy. Wpis można dodać z okna zajęć, przez zaznaczenie wolnego
miejsca w siatce albo przez agenta AI, także jako serię kilku terminów naraz.

## Decyzje

- Są dwa zakresy wpisów: **grupowy** (widzi go cała grupa) i **prywatny** (tylko autor).
  Prywatny wpis może dodać każdy student; grupowy — tylko osoba z odpowiednią rolą.
- Odbiorcą wpisu grupowego jest **przedmiot i grupa** (np. „MUD, Lk4”). Wpis dla wszystkich
  grup przedmiotu (np. kolokwium z wykładu) dodaje starosta albo admin.
- **Terminy żyją w Supabase**, notatki i materiały w Obsidianie. Strukturę powiązania z notatkami
  użytkownik ustali osobno; do tego czasu wpis ma tylko tekstowy zakres materiału.
- Terminy całodniowe i „do oddania” pokazujemy w **pasku pod datami**, jak w Kalendarzu Google.
- Siatka obejmuje **weekend**.
- Operacje na serii („tylko ten / ten i następne / wszystkie”) obejmują wpisy **i wszystkie
  prywatne zmiany zajęć** (przeniesienie, odwołanie, sala).
- Wpisy grupowe widzi każdy, kto ogląda plan danej grupy, **także bez logowania**, tak jak sam
  plan. Bez danych autora i bez historii zmian.
- Odrzucone: udostępnianie wpisu grupie linkiem.

## Role

| Rola | Zakres | Uprawnienia |
| --- | --- | --- |
| admin | cała aplikacja | to samo co starosta, na każdym kierunku; nadaje i odbiera role starosty |
| starosta | jeden kierunek-semestr (np. `EiAs3`), jedna osoba | pełna edycja wpisów grupowych kierunku, w tym dla wszystkich grup przedmiotu; nadaje i odbiera role starosty grupy |
| starosta grupy | kierunek i grupa (np. `EiAs3` / `Lk4`); jedna osoba może mieć kilka grup | dodaje, zmienia i usuwa wpisy grupowe tej grupy, na każdym przedmiocie, na którym grupa ma zajęcia |
| student | własne konto | wpisy prywatne |

Zasady:

- Grupy w ustawieniach wybiera sam student, więc **nie dają żadnych uprawnień**. Prawo zapisu
  wynika wyłącznie z roli zapisanej na serwerze i jest sprawdzane w bazie, nie tylko w API.
- Rolę nadaje się **kodem zaproszenia**: jednorazowym, z terminem ważności, przypisanym do roli
  i zakresu (podobnie jak kod parowania kalendarza). Nie pokazujemy list użytkowników ani adresów
  e-mail. Pierwszego admina ustawia skrypt w `ops/`, bez interfejsu.
- Kierunek w danych jest osobny dla każdego semestru (`EiAs3` → `EiAs4`). Przy nowym semestrze
  starosta przechodzi **automatycznie** na następny semestr swojego kierunku (ten sam rdzeń
  nazwy, numer semestru o jeden większy; przy podziale na specjalności, np. `EiAs7A` i `EiAs7I`,
  na każdą z nich). Starostowie grup **są resetowani** i nadaje się ich od nowa. Admin działa
  globalnie, więc niczego nie trzeba przenosić. Kierunek bez numeru semestru w nazwie
  (np. `Erasmus`) nie ma automatycznego przeniesienia; starostę nadaje wtedy admin.
- Autor wpisu grupowego jest zapisany i widoczny dla starosty i admina. Pozostali widzą tylko
  rolę („starosta grupy”), bez nazwiska i adresu.
- Każda zmiana wpisu grupowego trafia do historii (kto, co, kiedy) i można ją cofnąć.
  Odebranie roli nie usuwa wpisów tej osoby.
- Kolumna `users.role` (`student/admin/staff/starosta`) nie wystarcza, bo nie ma zakresu.
  Role przechowujemy w osobnej tabeli; `users.role` nie służy do uprawnień.

## Rodzaje i tryby czasu

Rodzaje: kolokwium, wejściówka, sprawozdanie, egzamin, poprawa, projekt, inne. Kolory pochodzą
z `tag_definitions` (kolokwium, sprawozdanie i wejściówka już tam są).

| Tryb | Przykład | Czas | Widok |
| --- | --- | --- | --- |
| na zajęciach | kolokwium na labach 12.11 | przypięty do wystąpienia zajęć, godziny jak zajęcia | znacznik w kolorze rodzaju na kafelku zajęć |
| własny termin | poprawa uzgodniona z prowadzącym | data, początek, czas trwania | osobny blok w siatce |
| do oddania | sprawozdanie 3 do 27.10 | dzień, opcjonalnie godzina | pasek pod datami |

Wpis grupowy i prywatny mają różne oznaczenie. Wpisy z przeszłości są wyszarzone.

## Model danych (szkic)

```text
plan_items           zakres (group | personal), właściciel (dla prywatnych), kierunek, przedmiot,
                     rodzaj zajęć, grupa (pusta = wszystkie grupy przedmiotu), rodzaj wpisu, tryb,
                     wystąpienie zajęć (FK do events, RESTRICT) + zapamiętany stan tych zajęć,
                     data / początek / czas trwania / godzina oddania, tytuł, zakres materiału,
                     seria (id, numer), stan (aktywny | do sprawdzenia | odwołany) i jego powód,
                     autor (SET NULL), wersja, utworzenie / zmiana / usunięcie
plan_item_history    wpis, wersja, kto, zmiana, kiedy
plan_item_state      dla każdego użytkownika: ukryty, postęp (do zrobienia | gotowe | zrobione),
                     prywatna notatka, przypomnienia
plan_roles           użytkownik, rola, kierunek, grupa, kto nadał, kiedy
                     (jeden starosta na kierunek; admin bez kierunku)
plan_role_invites    skrót kodu, rola, zakres, kto utworzył, ważność, kto i kiedy użył
plan_item_proposals  podgląd agenta z wieloma pozycjami, oczekiwany stan, wygasa, zużyty (E6.7)
```

Dostęp jak w pozostałych tabelach prywatnych: bez uprawnień `anon` i `authenticated`, zapis
tylko przez backend po weryfikacji Firebase. Funkcje w bazie sprawdzają rolę, zakres, długości
pól, limit pozycji w serii (20) i zakres dat. Ten sam model obsłuży później dowolne własne
wydarzenia z etapu 6 roadmapy (konsultacje, nauka).

## Zmiany planu a wpisy

- **Uczelnia przenosi zajęcia.** Tożsamość wystąpienia (`source_key`) zostaje, więc wpis
  „na zajęciach” przenosi się razem z nimi. Wpis grupowy dostaje stan „do sprawdzenia”: starosta
  grupy widzi go do potwierdzenia, a studenci informację, że termin zmienił się razem z zajęciami
  i trzeba go potwierdzić u prowadzącego.
- **Zajęcia znikają z planu.** Wpis zostaje w ostatnim znanym terminie ze stanem
  „do sprawdzenia”. Nocny import liczy takie wpisy w raporcie, ale się nie zatrzymuje
  (ta sama zasada co dla prywatnych zmian). Pełny ponowny import planu uwzględnia nową tabelę.
- **Student przenosi albo odwołuje u siebie zajęcia z kolokwium.** Kolokwium zostaje w terminie
  grupy, bo prywatna zmiana nie zmienia terminu prowadzącego. Okno zajęć pokazuje:
  „Na tych zajęciach Twoja grupa ma kolokwium. Przeniesienie zmienia tylko Twój plan — termin
  napisania ustal z prowadzącym.” Do tego lista wpisów tego samego rodzaju i przedmiotu w innych
  grupach w ciągu 14 dni od pierwotnego terminu. „Wpisz mi jako odrobienie” tworzy prywatny wpis
  przypięty do zajęć tamtej grupy, oznaczony „odrobienie — wymaga zgody prowadzącego”, i dopisuje
  te zajęcia do planu istniejącym mechanizmem dopisków. Wpis u innej grupy ani brak kolizji nie
  oznacza zgody prowadzącego.
- **Duplikaty.** Przy zapisie sprawdzamy przedmiot, grupę, rodzaj i datę. Gdy starosta doda
  wpis pokrywający się z czyimś prywatnym, właściciel prywatnego dostaje propozycję jego usunięcia.

## Serie

- Wpisy z jednej serii mają wspólne id i numer („Kolokwium 2 z 3”). Edycja, przesunięcie
  i usunięcie pytają: tylko ten, ten i następne, wszystkie. Przesunięcie serii przesuwa każdy
  termin o tę samą różnicę, np. „wszystkie o tydzień później”.
- Prywatne zmiany zajęć działają tak samo. Serię zajęć wyznacza identyfikator serii uczelni
  zapisany w `source_key`. Zmiana serii zapisuje osobną zmianę dla każdego wystąpienia w jednej
  transakcji, ze wspólnym id grupy zmian, więc można ją cofnąć razem. Kolizje liczymy dla każdego
  wystąpienia osobno. Wystąpienia dodane później przez import nie dziedziczą zmiany same z siebie.

## Dodawanie

Wszystkie drogi korzystają z tego samego API i tych samych reguł.

1. **Z okna zajęć.** „Dodaj termin” w pierwszym widoku; „Zmień salę” przechodzi do „Więcej”.
   Wybór rodzaju i zakresu (prywatny; grupowy tylko przy pasującej roli). Podpowiedzi to najbliższe
   wystąpienia tych zajęć dla tej grupy oraz własna data. „+” dodaje kolejny termin serii.
2. **Z wolnego miejsca w siatce.** Przeciąganie z krokiem 15 minut, pojedyncze kliknięcie tworzy
   90 minut (typowa długość zajęć). Na telefonie przeciąganie zaczyna długie przytrzymanie, żeby nie
   kolidowało z przewijaniem. Przycisk „+ Dodaj” daje to samo bez myszy. Wybór przedmiotu z planu,
   a starosta wybiera też grupę spośród tych, do których ma prawo. Podpowiedzi: dokładnie tydzień
   i dwa tygodnie później oraz własna data; „+” dodaje kolejny termin.
3. **Przez agenta.** Osobny tryb rozmowy „Dodać kolokwium lub termin”. Narzędzia: wyszukanie
   wystąpień zajęć grupy i przygotowanie podglądu serii. Można wkleić wiadomość od prowadzącego,
   a agent rozbije ją na terminy. Data, w którą grupa nie ma zajęć, jest oznaczona i wymaga
   godziny od użytkownika; agent jej nie zgaduje. Zapis następuje dopiero po zatwierdzeniu
   wszystkich albo wybranych pozycji. Agent nie ma szerszych uprawnień niż użytkownik, a treści
   wpisane przez innych traktuje jako dane, nie polecenia. Po stronie Odysseusa trzeba dodać nowy
   tryb do listy w `src/schedule_bridge.py`, instrukcje agenta i obsługę podglądu z wieloma
   pozycjami.

## Widok

- Pasek pod datami na terminy całodniowe i „do oddania”; przy wielu wpisach zwija się do „+2”.
- Weekend: kolumny sobota i niedziela pojawiają się w tygodniu, w którym jest w nich jakiekolwiek
  wydarzenie. Ustawienie „Zawsze pokazuj weekend” (domyślnie wyłączone) pokazuje je w każdym
  tygodniu. Rozszerzamy też walidację prywatnych zmian, która dziś
  odrzuca weekend. Na produkcji jest już 7 zajęć weekendowych, których obecna siatka nie pokazuje.
- Lista „Nadchodzące” w panelu Mój plan: najbliższe 14 dni z odliczaniem, osobno zaległe
  i bez ustalonej daty.
- Kolory rodzajów i filtr „Pokaż terminy” (wszystkie, grupowe, prywatne, wybrane rodzaje).
- Czat: przycisk „Powiększ” (komputer około 70% wysokości ekranu, telefon pełny ekran),
  samoczynne powiększenie przy podglądzie z kilkoma pozycjami, zmiana wysokości przeciąganiem,
  zapamiętana w przeglądarce. Karta podglądu ma krótkie wiersze, ostrzeżenia i stały przycisk
  „Zatwierdź zaznaczone”; te same pozycje widać jako szkice w siatce.

## Przypomnienia i synchronizacja

- Wpisy trafiają do kalendarza „Plan zajęć” w Odysseusie ze stałym identyfikatorem. Wersja
  danych, po której Odysseus wykrywa zmiany, uwzględnia wpisy. W Odysseusie są tylko do odczytu.
- Przypomnienia przez kalendarz Odysseusa i w eksporcie ICS, np. dzień wcześniej o 18:00.
  Domyślne ustawienia zależą od rodzaju; student może je zmienić u siebie.
- Starosta grupy dostaje informację o wpisach „do sprawdzenia” swojej grupy.

## Notatki

Supabase trzyma, kiedy i kogo dotyczy termin oraz osobisty postęp. Obsidian trzyma materiały,
wymagania i notatki. Na start wpis ma tekstowy „zakres materiału”. Odnośnik do notatki dodamy,
gdy użytkownik ustali strukturę notatek; wtedy też poprawimy [plan notatek](STUDY_NOTES_PLAN.md),
który zakłada dziś zapis terminów w `Zadania.md`.

## Etapy

Każdy etap to osobny PR: staging, podgląd Vercela, scalenie do `main`. Migracje tylko dodają
obiekty, a nowe funkcje są za przełącznikiem w konfiguracji. Migrację produkcji uruchamia
użytkownik po próbie na kopii, jak przy E5.

| Etap | Zakres |
| --- | --- |
| E6.1 Baza i role | Tabele z modelu, funkcje z kontrolą ról, testy SQL w CI, skrypt pierwszego admina. Wpisy przenoszą się i czekają na sprawdzenie przy zmianie zajęć (wyzwalacz), nocny mail wymienia zniknięte zajęcia z wpisami (potem ponowny import workflow do n8n). |
| E6.2 API | `api/plan-items/*`: `list` (także bez logowania: wpisy grupowe), `save`, `remove` (z cofnięciem), `state`, `roles`, `invite`, `redeem`, `revoke` — jedna funkcja Vercela (4 z 12). Feed kalendarza Odysseusa zawiera `entries`; ich wyświetlanie w Odysseusie razem z przypomnieniami (E6.8). Podpowiedzi terminów liczy przeglądarka z wczytanego planu (E6.4), agent dostaje własne narzędzie (E6.7). ICS razem z widokiem (E6.3). |
| E6.3 Widok | Pasek pod datami, weekend (siatka, widok dnia, ustawienie „Zawsze pokazuj weekend”, walidacja prywatnych zmian), znaczniki na zajęciach i bloki, okno wpisu z postępem i ukrywaniem, panel „Nadchodzące terminy”, kolory rodzajów, ICS. Flaga `REACT_APP_PLAN_ITEMS`. Filtr rodzajów przechodzi do E6.4, razem z dodawaniem. |
| E6.4 Dodawanie ręczne | „Dodaj kolokwium lub termin” w oknie zajęć (najbliższe zajęcia grupy do zaznaczenia, „Kolejny termin” z własną datą), „Zmień salę” w „Więcej”. Kliknięcie lub przeciągnięcie po wolnym miejscu siatki (na telefonie po długim przytrzymaniu) i przycisk „Dodaj termin”: przedmiot, grupa spośród tych z prawem zapisu, tydzień i dwa tygodnie później. Edycja i usuwanie „tylko ten / ten i następne / wszystkie” (przesunięcie serii o tyle samo dni; zajęcia szukane w tym samym dniu), cofanie z powiadomienia. Filtr „Kolokwia i terminy” w ustawieniach (wszystkie, grupowe, moje, rodzaje). Serie obejmują wpisy z wczytanego okna dat (około 9 tygodni wstecz, 19 naprzód). Serie prywatnych zmian zajęć przechodzą do E6.6. |
| E6.5 Role w interfejsie | „Panel starosty” dla osób z rolą (z licznikiem wpisów do sprawdzenia): wpisy do sprawdzenia po zmianie planu (potwierdzenie albo zmiana), kod zaproszenia (admin: starosta kierunku lub grupy na dowolnym planie; starosta: starosta grupy swojego planu; podpowiedź grup bez starosty; kod widoczny raz, z kopiowaniem instrukcji), role z rezygnacją i odbieraniem, historia zmian wpisów grupowych z cofnięciem ostatniej zmiany wpisu. Autorzy w historii tylko jako rola („starosta grupy Lk4”, „Ty”). Akcja API `history` (starosta grupy widzi swoje grupy). „Mam kod zaproszenia” w ustawieniach dla każdego zalogowanego. |
| E6.6 Zmiany planu | Komunikaty przy przeniesieniu zajęć z kolokwium, odrobienie u innej grupy, serie prywatnych zmian zajęć. |
| E6.7 Agent | Tryb rozmowy, narzędzia, karta podglądu, powiększany czat, PR w Odysseusie; wdrożenie na główny Odysseus po zgodzie użytkownika. |
| E6.8 Przypomnienia | Domyślne przypomnienia według rodzaju, ustawienia osobiste, ICS. |
| E6.9 Notatki | Odnośnik do notatek po ustaleniu ich struktury. |
