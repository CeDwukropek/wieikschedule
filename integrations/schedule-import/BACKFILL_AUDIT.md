# Porównanie dostarczonego eksportu — 14.10.2026

Porównano CSV użytkownika z publicznym źródłem `stac` i `block` poprzez parser
z PR #97. Ponowne pobranie metadanych potwierdziło niezmienione rewizje podczas
analizy. Pełny eksport i mapowania pozostają w lokalnym raporcie poza Git.

## Wynik

| Kategoria | Liczba |
| --- | ---: |
| Rekordy eksportu i unikalne UUID | 5608 |
| Aktywne rekordy / dni wolne w eksporcie | 5588 / 20 |
| Rekordy źródłowe po rozwinięciu | 7027 |
| Ścisłe propozycje 1:1, zgodne wszystkie pola | 4110 |
| Identyczne duplikaty treści eksportu | 0 |
| Niejednoznaczne ścisłe dopasowania | 0 |
| Pojedyncze niezastrzeżone, niekonkurujące wskazówki | 908 |
| Pozostałe rekordy wymagające rozstrzygnięcia | 590 |

1498 rekordów nie ma identycznej treści w aktualnym źródle:

| Najwęższy dostępny indeks kandydata | Liczba rekordów |
| --- | ---: |
| Ten sam dzień wolny, inna etykieta | 4 |
| Ten sam slot i szczegóły zajęć | 406 |
| Te same szczegóły zajęć w danym dniu | 569 |
| Podobne szczegóły w innych datach | 286 |
| Brak kandydata w konserwatywnych indeksach | 233 |

908 pojedynczych wskazówek obejmuje m.in. 408 zmian samej godziny, 189 zmian
samej sali, 147 zmian samego prowadzącego i 29 zmian samego statusu. Nadal są
to propozycje do review. Pozostałe 590 przypadków obejmuje wiele kandydatów,
konkurujące/zastrzeżone kandydatury i brak kandydatów. Nie są automatycznie
usuwane, scalane ani uznawane za nowe wydarzenia.

80 pustych nullable komórek w 20 dniach wolnych zinterpretowano jako NULL,
z jawnym oznaczeniem tego założenia. Przed rzeczywistym zapisem trzeba potwierdzić
semantykę pustych komórek w źródłowym eksporcie lub porównać plan z bazą.
Źródło zawiera także jeden zgłoszony patch poza aktualną siatką dat.

## Testy

Przechodzi 30 testów Node, obejmujących wcześniejszy importer oraz CSV/backfill.
Na jednorazowej bazie PostgreSQL 17 załadowano wszystkie 5608 UUID z CSV.
Zasymulowano przypisanie 4110 ścisłych propozycji, zachowując wszystkie UUID
i 11216 syntetycznych referencji reprezentujących dopiski i tagi. Nie utworzono
nowych wydarzeń ani nie zmieniono pól harmonogramu. Ponowne wywołanie z pustą
listą zmian wykonało zero zapisów.

Test ten nie weryfikuje rzeczywistych prywatnych danych, bieżących triggerów
ani pełnej konfiguracji produkcyjnych FK/RLS. Używa eksportowanych publicznych
rekordów i syntetycznych referencji; nie stanowi dowodu odtworzenia pełnej bazy.

Po symulacji planner nadal blokuje pełną synchronizację: 2917 rekordów źródła
bez przypisanego klucza oraz 1498 starych rekordów bez źródłowej tożsamości.
Raport ma `write_ready=false`, a plan z blokadami `rpc=null`.
Propozycje nie zostały zaakceptowane jako mapowania produkcyjne.

## Bramka G0 i kolejne działania

G0 pozostaje otwarta. Trzeba przejrzeć ścisłe propozycje, ocenić pojedyncze
wskazówki oraz rozstrzygnąć pozostałe 590 rekordów. Następnie przygotować
kompletny plan na aktualnej kopii, sprawdzić triggery/FK, przesunięcia i retry.
Nie uruchomiono writera w produkcji ani nie wdrożono zależnych overrides.

Do ustalenia, które nierozstrzygnięte UUID mają rzeczywiste dopiski/tagi,
przygotowano [inspect-event-references.sql](inspect-event-references.sql).
Zapytanie tylko odczytuje liczności i nie ujawnia identyfikatorów użytkowników
ani treści prywatnych wpisów. Nie zostało wykonane na produkcji.

Reprodukcja raportu: `cli.cjs report normalized.json events.csv`, zgodnie
z [README](README.md). Fingerprint jest porównaniem treści, nie trwałym ID.

Ślad wejść:

- CSV SHA256: `a80eea3277bfc00efd985a5bc8237e1d9d8728794596d8bcacae4a48dc67224a`.
- Odpowiedź stac SHA256: `0575d47d138591d7a7fa9731e50c6938e6b5fa29585506e79348cad188548b69`.
- Odpowiedź block SHA256: `22de2ea0e4f9098c34224a02240556f89b98866b744e9d9ae20e02248bd5801c`.
