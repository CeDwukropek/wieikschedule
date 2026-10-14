"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { transformSnapshots, SOURCE_SYSTEM } = require("./transform.cjs");
const { createPlan } = require("./plan.cjs");

const ID = "00000000-0000-4000-8000-000000000001";
const ID2 = "00000000-0000-4000-8000-000000000002";
function series(patch = {}) {
  return { id: "series-a", eventType: "Synthetic subject", group: "L1", faculty: "TEST",
    instructor: "Synthetic teacher", room: "101", startDate: "2026-10-05", endDate: "2026-10-05",
    startTime: "09:00", durationMin: 90, intervalWeeks: 1, excludedDates: [], overrides: [], ...patch };
}
function sources(events = [series()], blocks = []) {
  return [{ ok: true, db: "stac", data: events, revision: "test-stac", mtime: 1 },
    { ok: true, db: "block", data: blocks, revision: "test-block", mtime: 1 }];
}
function normalized(events, blocks) { return transformSnapshots(...sources(events, blocks)); }
function row(source = normalized().rows[0], id = ID) { return { id, ...source }; }
function createAll(snapshot) { return { create: snapshot.rows.map((r) => r.source_key) }; }

test("single groups, all comma groups, NULL groups and days off survive expansion", () => {
  const snapshot = normalized([
    series(), series({ id: "b", group: "L2, L3, L2" }), series({ id: "c", group: null }),
  ], [{ scope: "all", date: "2026-10-06", label: "Synthetic day off" }]);
  assert.equal(snapshot.rows.length, 5);
  assert.deepEqual(snapshot.rows.filter((r) => r.status === "aktywne").map((r) => r.group).sort(),
    ["L1", "L2", "L3", null].sort());
  const free = snapshot.rows.find((r) => r.status === "wolne");
  assert.equal(free.duration_min, 900);
  assert.equal(free.faculty, "all");
  assert.equal(free.group, null);
  assert.equal(free.instructor, null);
  assert.equal(free.type, null);
  assert.equal(Object.hasOwn(free, "id"), false);
});

test("mixed lecture and lab groups retain separate display types", () => {
  const snapshot = normalized([series({ group: "W,L1" })]);
  assert.deepEqual(snapshot.rows.map((r) => r.type).sort(), ["Labolatorium", "Wykład"]);
});

test("inclusive biweekly recurrence and added dates do not depend on local timezone", () => {
  const snapshot = normalized([series({ endDate: "2026-10-19", intervalWeeks: 2,
    overrides: { "2026-10-12": { _add: true, startTime: "10:30" } } })]);
  assert.deepEqual(snapshot.rows.map((r) => r.date), ["2026-10-05", "2026-10-12", "2026-10-19"]);
  assert.equal(snapshot.rows[1].start_time, "10:30:00");
});

test("source cancellations, exclusions and days off retain inactive occurrences", () => {
  const snapshot = normalized([series({ endDate: "2026-10-19", excludedDates: ["2026-10-12"],
    overrides: { "2026-10-05": { cancelled: true } } })],
  [{ scope: "all", from: "2026-10-19", to: "2026-10-20", label: "Synthetic break" }]);
  assert.equal(snapshot.rows.filter((r) => r.status === "nieaktywne").length, 3);
  assert.equal(snapshot.rows.filter((r) => r.status === "wolne").length, 2);
});

test("removed additions outside recurrence are retained as inactive source records", () => {
  const snapshot = normalized([series({ overrides: {
    "2026-10-06": { _add: false, cancelled: true, startTime: "11:00" },
  } })]);
  assert.equal(snapshot.rows.length, 2);
  assert.equal(snapshot.rows.find((r) => r.date === "2026-10-06").status, "nieaktywne");
  const orphan = normalized([series({ overrides: {
    "2026-10-06": { _add: false, cancelled: false, room: "102" },
  } })]);
  assert.equal(orphan.rows.length, 1);
  assert.deepEqual(orphan.warnings, [{ kind: "orphan_override", series_id: "series-a", date: "2026-10-06" }]);
  const formerlyActive = row({ ...orphan.rows[0], date: "2026-10-06", source_key: '["old-added"]' }, ID2);
  assert.equal(createPlan(orphan, [row(orphan.rows[0]), formerlyActive]).ready, false);
});

test("explicit NULL clears nullable fields; missing keys preserve source values", () => {
  const snapshot = normalized([series({ overrides: { "2026-10-05": { room: null } } })]);
  assert.equal(snapshot.rows[0].room, null);
  assert.equal(snapshot.rows[0].instructor, "Synthetic teacher");
  assert.throws(() => normalized([series({ overrides: { "2026-10-05": { durationMin: null } } })]),
    /duration/);
});

test("failed, empty, partial or malformed snapshots produce no usable output", () => {
  const [stac, block] = sources();
  assert.throws(() => transformSnapshots({ ...stac, ok: false }, block), /unsuccessful/);
  assert.throws(() => transformSnapshots({ ...stac, data: [] }, block), /Empty schedule/);
  assert.throws(() => transformSnapshots(stac, { ...block, data: null }), /snapshot/);
  assert.throws(() => normalized([series({ startDate: "2026-02-30" })]), /calendar date/);
  assert.throws(() => normalized([series({ durationMin: -1 })]), /duration/);
  assert.throws(() => normalized([series({ intervalWeeks: 0 })]), /interval/);
  assert.throws(() => normalized([series({ overrides: [{ room: "102" }] })]), /overrides/);
  assert.throws(() => normalized([series(), series()]), /Duplicate source series/);
  assert.throws(() => normalized(undefined, [{ scope: "TEST", date: "2026-10-05" }]), /Scoped/);
  assert.throws(() => normalized(undefined, [
    { scope: "all", date: "2026-10-05", label: "a" },
    { scope: "all", date: "2026-10-05", label: "b" },
  ]), /Conflicting/);
});

test("unchanged import is a no-op and room/time changes retain UUID", () => {
  const before = normalized();
  const same = createPlan(before, [row()]);
  assert.equal(same.ready, true);
  assert.deepEqual(same.rpc.p_changes, []);
  const after = normalized([series({ room: null, startTime: "11:00", instructor: "New teacher" })]);
  const plan = createPlan(after, [row()]);
  assert.equal(plan.ready, true);
  assert.equal(plan.summary.inserted, 0);
  assert.equal(plan.rpc.p_changes[0].id, ID);
  assert.equal(plan.rpc.p_changes[0].room, null);
});

test("initial adoption preserves UUID and refuses silent matching or creation", () => {
  const snapshot = normalized();
  const legacy = { ...row(), source_system: null, source_key: null };
  const blocked = createPlan(snapshot, [legacy]);
  assert.equal(blocked.ready, false);
  assert.equal(blocked.rpc, null);
  assert.deepEqual(blocked.blockers.map((b) => b.kind), ["unmapped_occurrence", "unmanaged_existing_event"]);
  const plan = createPlan(snapshot, [legacy], { matches: [{ event_id: ID,
    source_key: snapshot.rows[0].source_key }] });
  assert.equal(plan.rpc.p_changes[0].id, ID);
  assert.equal(plan.summary.inserted, 0);
});

test("moved date needs explicit identity mapping and keeps the original UUID", () => {
  const moved = normalized([series({ startDate: "2026-10-06", endDate: "2026-10-06" })]);
  const blocked = createPlan(moved, [row()]);
  assert.equal(blocked.ready, false);
  assert.deepEqual(blocked.blockers.map((b) => b.kind), ["unmapped_occurrence", "missing_occurrence"]);
  const plan = createPlan(moved, [row()], { matches: [{ event_id: ID,
    source_key: moved.rows[0].source_key }] });
  assert.equal(plan.ready, true);
  assert.equal(plan.rpc.p_changes[0].id, ID);
  assert.equal(plan.rpc.p_changes[0].date, "2026-10-06");
});

test("cancelled original plus added moved date also needs explicit reconciliation", () => {
  const moved = normalized([series({ excludedDates: ["2026-10-05"],
    overrides: { "2026-10-06": { _add: true } } })]);
  assert.equal(createPlan(moved, [row()]).ready, false);
  // The old cancelled occurrence is a separate source row. Reviewing a move can
  // assign its retained tombstone a new UUID while moving the existing relation.
  const plan = createPlan(moved, [row()], {
    matches: [{ event_id: ID, source_key: moved.rows.find((r) => r.date === "2026-10-06").source_key }],
    create: [moved.rows.find((r) => r.date === "2026-10-05").source_key],
  }, () => ID2);
  // The replacement tombstone gets a different UUID only by explicit decision;
  // user relations remain attached to the existing, now moved event UUID.
  assert.equal(plan.ready, true);
});

test("group rename is reviewed; split membership cannot steal an existing UUID", () => {
  const changed = normalized([series({ group: "L2" })]);
  assert.equal(createPlan(changed, [row()]).ready, false);
  const mapped = createPlan(changed, [row()], { matches: [{ event_id: ID,
    source_key: changed.rows[0].source_key }] });
  assert.equal(mapped.rpc.p_changes[0].id, ID);
  const split = normalized([series({ group: "L1,L2" })]);
  assert.throws(() => createPlan(split, [row()], { matches: [{ event_id: ID,
    source_key: split.rows.find((r) => r.group === "L2").source_key }] }), /two incoming/);
});

test("missing source occurrences require retirement and reappearance revives their UUID", () => {
  const snapshot = normalized();
  const vanished = row(normalized([series({ id: "vanished" })]).rows[0], ID2);
  assert.equal(createPlan(snapshot, [row(), vanished]).ready, false);
  const plan = createPlan(snapshot, [row(), vanished], { retire: [ID2] });
  assert.equal(plan.ready, true);
  assert.equal(plan.rpc.p_changes[0].id, ID2);
  assert.equal(plan.rpc.p_changes[0].status, "nieaktywne");
  const later = normalized([series(), series({ id: "vanished" })]);
  const revived = createPlan(later, [row(), plan.rpc.p_changes[0]]);
  assert.equal(revived.rpc.p_changes[0].id, ID2);
  assert.equal(revived.rpc.p_changes[0].status, "aktywne");
});

test("legacy duplicates retire without deletion and unrelated sources remain untouched", () => {
  const snapshot = normalized();
  const duplicate = { ...row(undefined, ID2), source_system: null, source_key: null };
  const plan = createPlan(snapshot, [row(), duplicate], { retire: [ID2] });
  assert.equal(plan.ready, true);
  assert.equal(plan.rpc.p_changes[0].id, ID2);
  assert.equal(plan.rpc.p_changes[0].status, "nieaktywne");
  const unrelated = { ...duplicate, source_system: "other", source_key: "other-key" };
  assert.deepEqual(createPlan(snapshot, [row(), unrelated]).rpc.p_changes, []);
  assert.throws(() => createPlan(snapshot, [unrelated], { matches: [{ event_id: ID2,
    source_key: snapshot.rows[0].source_key }] }), /another source/);
});

test("explicit creation uses a new UUID once and subsequent imports do not recreate it", () => {
  const snapshot = normalized();
  const plan = createPlan(snapshot, [], createAll(snapshot), () => ID);
  assert.equal(plan.summary.inserted, 1);
  assert.equal(plan.rpc.p_changes[0].id, ID);
  const repeated = createPlan(snapshot, plan.rpc.p_changes);
  assert.equal(repeated.summary.inserted, 0);
  assert.deepEqual(repeated.rpc.p_changes, []);
});

test("invalid decisions and duplicate existing identities fail before generating writes", () => {
  const snapshot = normalized();
  assert.throws(() => createPlan(snapshot, [], { unknown: true }), /Unknown decision/);
  assert.throws(() => createPlan(snapshot, [], { create: ["not-a-key"] }), /Invalid create/);
  assert.throws(() => createPlan(snapshot, [row(), row(undefined, ID2)]), /Duplicate existing source/);
  assert.throws(() => createPlan({ ...snapshot, rows: [{ ...snapshot.rows[0], id: "text-id" }] }, []), /text IDs/);
  assert.throws(() => createPlan({ ...snapshot, rows: [{ ...snapshot.rows[0], status: "invalid" }] }, []), /imported status/);
  assert.equal(snapshot.source_system, SOURCE_SYSTEM);
});

test("generated n8n preview executes the same transformer and contains no writer", () => {
  const workflow = JSON.parse(fs.readFileSync(path.join(__dirname, "n8n-preview.json"), "utf8"));
  assert.equal(workflow.active, false);
  assert.equal(workflow.nodes.some((node) => node.credentials), false);
  assert.equal(workflow.nodes.filter((node) => node.type.includes("supabase")).length, 0);
  const code = workflow.nodes.find((node) => node.type === "n8n-nodes-base.code").parameters.jsCode;
  const payloads = sources();
  const output = vm.runInNewContext(`(function(){${code}})()`, {
    $input: { all: () => payloads.map((json) => ({ json })) },
  }, { timeout: 1000 });
  assert.deepEqual(JSON.parse(JSON.stringify(output[0].json)), transformSnapshots(...payloads));
});
