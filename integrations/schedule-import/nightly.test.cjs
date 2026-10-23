"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createNightlyPlan } = require("./nightly.cjs");
const ID = "00000000-0000-4000-8000-000000000001";
const ID2 = "00000000-0000-4000-8000-000000000002";
const NEW = "00000000-0000-4000-8000-0000000000aa";
const source = { source_system: "wieik-v1", source_key: "series-a", faculty: "TEST",
  date: "2026-10-05", start_time: "09:00:00", duration_min: 90, subject: "Synthetic subject",
  instructor: null, room: "A1", group: "L1", type: "Labolatorium", status: "aktywne" };
const stored = (row, id) => ({ ...row, id });
const snapshot = (rows) => ({ protocol: 1, source_system: "wieik-v1", rows });
const applied = (rows, plan) => {
  const after = new Map(rows.map((row) => [row.id, row]));
  for (const row of plan.rpc.p_changes) after.set(row.id, row);
  return [...after.values()];
};

test("a changed room under the same key and a new class apply without review", () => {
  const added = { ...source, source_key: "series-b", group: "L2" };
  const plan = createNightlyPlan(snapshot([{ ...source, room: "B2" }, added]), [stored(source, ID)]);
  assert.equal(plan.ready, true);
  assert.deepEqual(plan.nightly, { created: 1, retired: 0, updated: 1, active_before: 1 });
  assert.equal(plan.rpc.p_changes.find((row) => row.id === ID).room, "B2");
  assert.equal(plan.rpc.p_changes.find((row) => row.id !== ID).source_key, "series-b");
});

test("an unreferenced vanished class becomes inactive and a later repeat changes nothing", () => {
  const rows = [stored(source, ID), stored({ ...source, source_key: "series-b" }, ID2)];
  const plan = createNightlyPlan(snapshot([source]), rows);
  assert.equal(plan.ready, true);
  assert.deepEqual(plan.rpc.p_changes.map((row) => [row.id, row.status]), [[ID2, "nieaktywne"]]);
  const repeated = createNightlyPlan(snapshot([source]), applied(rows, plan));
  assert.equal(repeated.ready, true);
  assert.deepEqual(repeated.rpc.p_changes, []);
});

test("a reappearing class keeps its UUID", () => {
  const plan = createNightlyPlan(snapshot([source]), [stored({ ...source, status: "nieaktywne" }, ID)]);
  assert.deepEqual(plan.rpc.p_changes.map((row) => [row.id, row.status]), [[ID, "aktywne"]]);
});

test("a vanished class with private rows blocks the whole import", () => {
  const rows = [stored(source, ID), stored({ ...source, source_key: "series-b" }, ID2)];
  const plan = createNightlyPlan(snapshot([source]), rows, [ID2]);
  assert.equal(plan.ready, false);
  assert.equal(plan.rpc, null);
  assert.deepEqual(plan.blockers, [{ kind: "missing_referenced_occurrence", event_id: ID2, source_key: "series-b" }]);
});

test("many classes vanishing at once is treated as an incomplete source", () => {
  const rows = Array.from({ length: 60 }, (_, index) =>
    stored({ ...source, source_key: `series-${index}` }, `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`));
  const plan = createNightlyPlan(snapshot([source]), [...rows, stored(source, NEW)]);
  assert.equal(plan.ready, false);
  assert.equal(plan.rpc, null);
  assert.deepEqual(plan.blockers.at(-1), { kind: "mass_disappearance", retired: 60, limit: 50 });
});

test("rows outside the importer still require a decision", () => {
  const plan = createNightlyPlan(snapshot([source]), [stored(source, ID),
    stored({ ...source, source_system: null, source_key: null }, ID2)]);
  assert.equal(plan.ready, false);
  assert.deepEqual(plan.blockers, [{ kind: "unmanaged_existing_event", event_id: ID2 }]);
});
