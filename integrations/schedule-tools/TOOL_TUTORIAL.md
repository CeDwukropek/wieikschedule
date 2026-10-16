# Pierwsze własne narzędzie agenta — krok po kroku

Tutorial na podstawie implementacji z 16.10.2026. To ćwiczenie do samodzielnego
wykonania: opisane narzędzie nie jest jeszcze zaimplementowane w aplikacji.
Wymagania: podstawy JavaScript, Node.js z zależnościami projektu i Git.

## Co zbudujesz

`schedule.get_day_summary` odpowie, ile masz zajęć wskazanego dnia i ile łącznie
trwają. Sumujemy czas zajęć, a nie czas od pierwszych do ostatnich zajęć.
Nakładające się wydarzenia liczą się osobno. Narzędzie niczego nie zapisuje.

Przepływ: pytanie → model wybiera narzędzie i argumenty → backend sprawdza
uprawnienia i dane → funkcja wykonuje obliczenia → wynik → odpowiedź agenta.
Opis narzędzia pomaga modelowi je wybrać. Skill opisuje, kiedy i jak go używać.
Ani opis, ani skill nie zastępują kodu funkcji i walidacji backendu.

## 1. Własna gałąź

W istniejącym worktree aplikacji:

```bash
cd /home/cedwukropek/wieikschedule-agent-search
git status --short
git switch -c feat/day-summary-tool
```

Jeśli status pokazuje cudze zmiany, zachowaj je i przygotuj oddzielny worktree.
Nie kopiuj plików .env do repozytorium. Przykładowe ścieżki dotyczą tego serwera.

## 2. Kontrakt wejścia i wyjścia

Wejście: `{"date":"2026-10-19"}`.
Przykładowe wyjście (liczby ilustracyjne):

```json
{
  "status": "found",
  "date": "2026-10-19",
  "count": 3,
  "total_minutes": 270,
  "message": "2026-10-19: liczba zajęć: 3, łączny czas: 270 minut."
}
```

Konto i grupy pochodzą z podpisanego kontekstu aplikacji. Nie dodawaj ich do
argumentów wybieranych przez model. Brak grup lub awaria odczytu nie oznacza zera zajęć.

## 3. Funkcja backendu

Utwórz `api/_lib/daySummary.js`:

```js
"use strict";
const schedule = require("./schedule");
const { queryPlan } = require("./scheduleQueries");

async function getDaySummary(ctx, selection, args, readPlan = queryPlan) {
  schedule.keys(args, ["date"]);
  schedule.text(args.date, 10, true);
  let offset = 0;
  let count = 0;
  let totalMinutes = 0;

  while (true) {
    const result = await readPlan(ctx, selection, "schedule.get_my_schedule", {
      date_from: args.date,
      date_to: args.date,
      limit: 100,
      offset
    });
    if (!["found", "no_events_in_available_data"].includes(result.status)) {
      return result;
    }
    for (const event of result.events) {
      count += 1;
      totalMinutes += event.duration_min;
    }
    if (result.next_offset == null) {
      return {
        status: result.status,
        date: args.date,
        count,
        total_minutes: totalMinutes,
        available_range: result.available_range,
        message: `${args.date}: liczba zajęć: ${count}, łączny czas: ${totalMinutes} minut.`
      };
    }
    offset = result.next_offset;
  }
}
module.exports = { getDaySummary };
```

`queryPlan` waliduje datę i stosuje grupy, dopiski, odwołania oraz przeniesienia.
Pętla pobiera wszystkie strony. Parametr `readPlan` pozwala testowi podstawić
kontrolowany odczyt bez prawdziwej bazy. Błędy odczytu propagują się do API.

## 4. Definicja dla modelu

W `api/_lib/scheduleToolSchemas.js` dodaj do tablicy `tools`, przed `.map(...)`:

```js
{
  name: "schedule.get_day_summary",
  description: "Count my classes and their total duration for a specific day. Uses my effective schedule including additions and private changes.",
  properties: {
    date: { type: "string", description: "Date in YYYY-MM-DD format." }
  },
  required: ["date"]
},
```

Istniejące `.map(...)` buduje `inputSchema` z `additionalProperties: false`.
Schemat jest instrukcją dla modelu; backend nadal musi sprawdzać argumenty.

## 5. Dispatcher: połączenie nazwy z funkcją

W `api/_lib/scheduleTools.js` dodaj import:

```js
const { getDaySummary } = require("./daySummary");
```

W `dispatch`, po deklaracji `context`, dodaj:

```js
if (name === "schedule.get_day_summary") {
  if (!claims.selection) {
    schedule.fail(422, "SELECTION_REQUIRED", "Wybierz plan i grupy w aplikacji.");
  }
  return getDaySummary(context(), claims.selection, args);
}
```

`context()` dostarcza klienta bazy i właściciela z wcześniej zweryfikowanego tokenu.
Nie odczytuj user_id z argumentów modelu i nie przekazuj modelowi klucza bazy.

## 6. Lista narzędzi dostępnych w sesji

W `availableTools` zmień callback `tools.filter` na blok z dodatkowym warunkiem:

```js
return tools.filter(tool => {
  if (tool.name === "schedule.get_day_summary") {
    return Boolean(claims.selection);
  }
  // Tutaj return z DOTYCHCZASOWYM wyrażeniem filtrującym.
});
```

To szablon miejsca edycji: zachowaj całe istniejące wyrażenie jako końcowy
`return`. Nie usuwaj dotychczasowych ograniczeń intencji dla pozostałych narzędzi.
Sam wpis w schemacie nie udostępnia funkcji: potrzebny jest też dispatcher i filtr.

## 7. Test bez modelu i bazy

Utwórz `api/schedule/daySummary.test.cjs`:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
const { getDaySummary } = require("../_lib/daySummary");

const selection = { faculty: "EiAs3", groups: { Lk: "Lk1" } };
const args = { date: "2026-10-19" };

test("sums all pages", async () => {
  const read = async (ctx, selected, name, params) => {
    assert.equal(name, "schedule.get_my_schedule");
    assert.equal(selected, selection);
    return {
      status: "found",
      events: [{ duration_min: params.offset === 0 ? 90 : 45 }],
      next_offset: params.offset === 0 ? 1 : null
    };
  };
  const result = await getDaySummary({}, selection, args, read);
  assert.equal(result.count, 2);
  assert.equal(result.total_minutes, 135);
});

test("empty schedule has zero classes", async () => {
  const read = async () => ({
    status: "no_events_in_available_data", events: [], next_offset: null
  });
  const result = await getDaySummary({}, selection, args, read);
  assert.equal(result.count, 0);
  assert.equal(result.total_minutes, 0);
});

test("missing groups are not an empty schedule", async () => {
  const expected = { status: "missing_groups", required_groups: ["Lk"] };
  const result = await getDaySummary({}, selection, args, async () => expected);
  assert.deepEqual(result, expected);
});

test("read failures propagate", async () => {
  await assert.rejects(
    getDaySummary({}, selection, args, async () => { throw new Error("offline"); }),
    /offline/
  );
});
```

Uruchom przy zainstalowanych zależnościach:

```bash
node --test api/schedule/daySummary.test.cjs
node --test api/my-plan/*.test.cjs api/schedule/*.test.cjs integrations/schedule-tools/*.test.cjs
```

Dodaj do testów kontraktowych sprawdzenie, że `availableTools` udostępnia nowe
narzędzie tylko z selekcją, a dispatcher odrzuca brak selekcji. Walidację złej daty
sprawdź z prawdziwym `queryPlan`, bo stub z tego przykładu jej nie wykonuje.

## 8. Odysseus: zweryfikowane wyniki i skill

Zmiany wykonuj na osobnej gałęzi izolowanego repozytorium integracji Odysseusa,
nie w roboczym katalogu oryginalnej instancji:

```bash
cd /home/cedwukropek/odysseus-schedule-integration
git status --short
git switch -c feat/day-summary-tool
```

W `src/schedule_bridge.py`, w zbiorze `semantic`, dodaj
`"schedule.get_day_summary"`. Most pobiera definicje z gatewaya dynamicznie;
ten zbiór dodatkowo oznacza wyniki jako dowody odczytu i zachowuje ich `message`.

W `integrations/schedule-agent/SKILL.md` dodaj:

```text
Gdy użytkownik pyta o liczbę zajęć lub ich łączny czas w danym dniu,
użyj schedule_get_day_summary z datą YYYY-MM-DD.
Zachowaj status i message backendu. Daty względne ustalaj w Europe/Warsaw.
```

Gateway używa kropki w nazwie (`schedule.get_day_summary`), most zamienia ją
na podkreślenie dla funkcji modelu (`schedule_get_day_summary`). Dodaj test mostu
sprawdzający, że zachowuje backendowe message także dla nowego narzędzia.

## 9. Wdrożenie i próba rozmowy

Zbuduj i uruchom zmienioną aplikację na stagingu zgodnie z instrukcją stagingu;
zrestartuj własną kopię Odysseusa po zmianie jego kodu. Sam commit nie aktualizuje
uruchomionych kontenerów. Rozpocznij nową rozmowę, żeby odświeżyć kontekst.

Zapytaj: „Ile mam zajęć 19 października i ile łącznie trwają?”. Sprawdź wywołaną
nazwę, datę, wynik i zgodność z widokiem planu. Bez dostępnego modelu możesz
wykonać testy funkcji i kontraktów; rozmowa pozostaje osobną weryfikacją.

## 10. Zapis zmian i kolejne narzędzia

Przejrzyj `git diff`, uruchom testy, zapisz commit i otwórz PR w obu repozytoriach.
Nie dodawaj .env ani tokenów. Tutorial nie wymaga zmian w bazie.

Powtarzalny zestaw to: kontrakt → funkcja → dispatcher → uprawnienia → testy →
instrukcja dla agenta. Dla narzędzia zapisującego zmiany zachowaj istniejący
mechanizm podglądu i zatwierdzenia przez użytkownika; nie kopiuj prostego
odczytu jako sposobu na bezpośrednie wykonywanie mutacji.
