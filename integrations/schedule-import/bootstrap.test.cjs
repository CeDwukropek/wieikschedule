"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { createUnlinkedBootstrap } = require("./bootstrap.cjs");
const { createPlan } = require("./plan.cjs");
const ID = "00000000-0000-4000-8000-000000000001";
const ID2 = "00000000-0000-4000-8000-000000000002";
const ID3 = "00000000-0000-4000-8000-000000000003";
const source = { source_system: "wieik-v1", source_key: "synthetic-source", faculty: "TEST",
  date: "2026-10-05", start_time: "09:00:00", duration_min: 90, subject: "Synthetic subject",
  instructor: null, room: null, group: "L1", type: "Labolatorium", status: "aktywne" };
const old = { ...source, id: ID, source_system: null, source_key: null };
const snapshot = (rows = [source]) => ({ protocol: 1, source_system: "wieik-v1", rows });

test("bootstrap requires explicit confirmation and only uninitialized events", () => {
  assert.throws(() => createUnlinkedBootstrap(snapshot(), [old]), /Confirm absence/);
  assert.throws(() => createUnlinkedBootstrap(snapshot(), [old], "true"), /Confirm absence/);
  assert.throws(() => createUnlinkedBootstrap(snapshot(), [{ ...old, source_system: "wieik-v1", source_key: "assigned" }], true), /unassigned/);
});

test("exact matches preserve UUID; unmatched legacy rows retire without fuzzy reassignment", () => {
  const other = { ...source, source_key: "second-source", room: "new room", group: "L2" };
  const unmatched = { ...old, id: ID2, room: "old room", group: "L2" };
  const plan = createUnlinkedBootstrap(snapshot([source, other]), [old, unmatched], true, () => ID3);
  assert.equal(plan.ready, true);
  assert.equal(plan.rpc_function, "bootstrap_wieik_import");
  assert.equal(plan.bootstrap.execution_approved, false);
  assert.equal(plan.bootstrap.preserved_exact_uuids, 1);
  assert.equal(plan.bootstrap.archived_legacy_uuids, 1);
  assert.equal(plan.bootstrap.new_source_uuids, 1);
  assert.equal(plan.rpc.p_changes.find((row) => row.id === ID).source_key, source.source_key);
  assert.equal(plan.rpc.p_changes.find((row) => row.id === ID2).status, "nieaktywne");
  assert.equal(plan.rpc.p_changes.find((row) => row.id === ID3).source_key, other.source_key);
  const after = new Map([old, unmatched].map((row) => [row.id, row]));
  for (const row of plan.rpc.p_changes) after.set(row.id, row);
  const repeated = createPlan(snapshot([source, other]), [...after.values()]);
  assert.equal(repeated.ready, true);
  assert.deepEqual(repeated.rpc.p_changes, []);
});

test("duplicate legacy payloads are archived instead of arbitrarily assigning an old UUID", () => {
  const plan = createUnlinkedBootstrap(snapshot(), [old, { ...old, id: ID2 }], true, () => ID3);
  assert.equal(plan.bootstrap.preserved_exact_uuids, 0);
  assert.equal(plan.bootstrap.archived_legacy_uuids, 2);
  assert.equal(plan.bootstrap.new_source_uuids, 1);
});
