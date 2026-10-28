# Lista starostów — szkic (nie wdrożone)

Feedback z 2026-10-28: lista starostów (imię i nazwisko, grupa), a podanie danych wymagane przy objęciu roli.
Status: **szkic do przemyślenia**, decyzja o widoczności danych otwarta. Kod nie jest zmieniony.

## Stan obecny

- `plan_roles` (migracja `20261025_plan_items_and_roles.sql`) trzyma tylko `user_id`, rolę, kierunek i grupę.
  Tabela `users` nie ma imion, a konto to sam `firebase_uid`.
- `listRoles` w `api/_lib/planItems.js` celowo nie ujawnia, kto pełni rolę („holders are never identified”):
  staroście zwraca tylko `mine: true/false`.
- Role nadaje się kodem zaproszenia (`RedeemInvite` → `redeem_plan_role_invite`). To jedyne miejsce, w którym
  można wymagać danych.

## Proponowany kształt

1. Migracja: w `plan_roles` kolumna `display_name text CHECK (length BETWEEN 3 AND 80)`, NULL dla obecnych
   ról. `redeem_plan_role_invite` przyjmuje `p_display_name` (wymagane) i zapisuje je przy roli.
2. API:
   - `redeem` wymaga `display_name`,
   - nowa akcja `profile` pozwala posiadaczowi poprawić swoje dane,
   - nowa akcja `starosty` zwraca listę dla kierunku: rola, grupa, imię i nazwisko.
3. UI:
   - pole „Imię i nazwisko” w `RedeemInvite`,
   - prośba o uzupełnienie dla ról z `display_name IS NULL`,
   - lista w panelu (np. obok „Nadchodzące”).
4. Przeniesienie roli na nowy semestr (`carried_from`) zachowuje `display_name`.

## Do rozstrzygnięcia (bezpieczeństwo / RODO)

- Kto widzi listę: zalogowani, wszyscy (także goście, aplikacja i repozytorium są publiczne) czy tylko staroście i admin.
  Goście = dane osobowe dostępne dla botów.
- Podstawa i informacja: czy dopisać do FAQ, kto i po co przetwarza imię i nazwisko. Trzeba też dać możliwość
  usunięcia danych (np. przez zrzeczenie się roli).
- Czy imię brać z pola wpisywanego ręcznie (zalecane), czy z konta Google (bywa pseudonimem).
- Czy lista ma pokazywać tylko staroście kierunku i grup, czy też admina.
- Ograniczenie zapytań (rate limit) dla akcji listy, jeśli ma być publiczna.
