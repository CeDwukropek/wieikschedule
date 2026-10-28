# Katalog sal i budynków

Status: **format v1 wdrożony w aplikacji** z wbudowanym katalogiem (`src/features/rooms/defaultRoomCatalog.json`).
CMS jeszcze nie istnieje. Podział na budynki jest **wstępny**: wszystkie budynki mają `confirmed: false`,
a widok „Wolne sale” mówi o tym użytkownikowi.

## Po co
Nazwy sal z planów (`events.room`) nie mówią, w którym budynku jest sala. Część ma prefiksy (`F101`, `WA203`,
`139SJO`, `A3`), część to same numery (`9`, `208B`), część to nie sale (`BHP`, „Szkolenie biblioteczne”).
Jedna sala bywa zapisana różnie („H / C” i „H/C”, „19_” i „19”). Katalog przypisuje sale do budynków,
łączy warianty nazw i ukrywa to, co nie jest salą. Korzystają z niego „Wolne sale” (lista i siatka, filtr budynku).

## Format (wersja 1)
```json
{
  "version": 1,
  "source": "cms",
  "buildings": [
    { "id": "f", "name": "Budynek F", "short": "F", "order": 30, "confirmed": true }
  ],
  "rules": [
    { "match": "^F\\d", "building": "f" }
  ],
  "rooms": {
    "H/C": { "building": "f", "label": "Hala C", "aliases": ["H C"], "seats": 40, "notes": "wejście od dziedzińca" },
    "BHP": { "hidden": true }
  },
  "hidden": ["SZKOLENIE BIBLIOTECZNE"]
}
```
- **Klucz sali:** nazwa po ujednoliceniu (`cleanRoom`: przycięte spacje wokół „/”, bez końcowego „_”), wielkimi literami.
- **Budynek sali:** wpis w `rooms[KLUCZ].building`, inaczej pierwsza pasująca reguła z `rules` (wyrażenie regularne,
  bez rozróżniania wielkości liter), inaczej budynek `inne` (albo zastępczy „Inne”).
- **`aliases`:** inne zapisy tej samej sali. Zajęcia z każdego zapisu trafiają do jednej sali.
- **`hidden`** (lista albo `rooms[KLUCZ].hidden`): nie pokazuj jako sali.
- **`seats`, `notes`:** na przyszłość (pojemność, wskazówki dojścia). Aplikacja jeszcze ich nie pokazuje.
- **Odrzucanie danych:** niepoprawny katalog (inna `version`, brak `buildings`) zastępuje wbudowany. Pojedyncze reguły
  z błędnym wyrażeniem albo nieznanym budynkiem są pomijane.

## Skąd aplikacja bierze katalog
`loadRoomCatalog()` (`src/features/rooms/roomCatalog.js`):
- **Z CMS-em:** gdy ustawiono `REACT_APP_ROOM_CATALOG_URL`, pobiera JSON spod tego adresu (GET, `Accept: application/json`,
  bez logowania) i trzyma go w localStorage przez 24 h. Przy błędzie sieci albo formatu używa katalogu wbudowanego.
- **Bez CMS-a:** używa katalogu wbudowanego.

## Kontrakt dla przyszłego CMS-a (osobne repo, do ustalenia)
- **Endpoint:** publiczny `GET /rooms/catalog.json` z powyższym formatem i nagłówkami CORS dla domen aplikacji,
  cache po stronie CDN (np. `Cache-Control: public, max-age=3600`).
- **Edycja:** budynki (nazwa, skrót, kolejność, potwierdzenie), reguły, sale (budynek, aliasy, ukrycie, pojemność, uwagi).
- **Lista sal do przypisania:** te, które występują w `events.room`, a nie mają wpisu ani pasującej reguły. CMS może je
  czytać z Supabase (tylko odczyt) albo z eksportu.
- **Zmiana formatu:** nowa `version`, przy czym aplikacja odrzuca wersje, których nie zna, więc stare wydania dalej działają
  na katalogu wbudowanym.
- **Inne treści:** CMS może później obsłużyć też np. FAQ, opisy budynków i mapy. To osobne kolekcje, nie część tego formatu.
