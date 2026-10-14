"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { readEventsCSV, backfillReport } = require("./backfill.cjs");
const { SOURCE_SYSTEM, FIELDS } = require("./transform.cjs");
const ID = "00000000-0000-4000-8000-000000000001";
const ID2 = "00000000-0000-4000-8000-000000000002";
function source(patch = {}) {
  return { source_system: SOURCE_SYSTEM, source_key: '["synthetic","2026-10-05"]',
    faculty: "TEST", date: "2026-10-05", start_time: "09:00:00", duration_min: 90,
    subject: "Synthetic subject", instructor: "Teacher", room: "101", group: "L1",
    type: "Labolatorium", status: "aktywne", ...patch };
}
function old(patch = {}) { return { ...source(), source_system: null, source_key: null, id: ID, ...patch }; }
function snapshot(rows = [source()]) { return { protocol: 1, source_system: SOURCE_SYSTEM, rows,
  revisions: { stac: "synthetic", block: "synthetic" }, warnings: [] }; }
const header = ["id", ...FIELDS].join(",");

test("CSV preserves quotes, commas, CRLF, BOM, multiline text and final record without newline", () => {
  const csv = '\uFEFF' + header + '\r\n' +
    `${ID},TEST,2026-10-05,09:00:00,90,"Synthetic, \"\"quoted\"\"\r\nsubject",Teacher,101,L1,Labolatorium,aktywne`;
  const parsed = readEventsCSV(csv);
  assert.equal(parsed.rows.length, 1);
  assert.equal(parsed.rows[0].subject, 'Synthetic, "quoted"\r\nsubject');
  assert.equal(parsed.rows[0].duration_min, 90);
  assert.equal(parsed.rows[0].id, ID);
});

test("CSV distinguishes quoted empty text from inferred NULL and keeps its evidence", () => {
  const csv = header + '\n' + `${ID},all,2026-10-05,07:00:00,900,Day off,,"",,,wolne\n`;
  const parsed = readEventsCSV(csv);
  assert.equal(parsed.rows[0].instructor, null);
  assert.equal(parsed.rows[0].room, "");
  assert.deepEqual(parsed.inferred_nulls.map((cell) => cell.field), ["instructor", "group", "type"]);
  assert.match(parsed.null_convention, /inferred/);
});

test("malformed CSV, missing header fields and invalid types fail before matching", () => {
  assert.throws(() => readEventsCSV(header + '\n"unclosed'), /Unclosed/);
  assert.throws(() => readEventsCSV(header + '\n"closed"x'), /after CSV quote/);
  assert.throws(() => readEventsCSV('id,subject\nvalue,subject'), /header/);
  assert.throws(() => readEventsCSV(header + '\n' + `${ID},TEST`), /column count/);
  assert.throws(() => readEventsCSV(header + '\n' + `${ID},TEST,2026-10-05,09:00,90x,S,T,101,L1,L,aktywne`), /duration/);
});

test("unique exact content match remains a non-executable proposal", () => {
  const report = backfillReport(snapshot(), [old()]);
  assert.equal(report.summary.exact_one_to_one_proposals, 1);
  assert.equal(report.write_ready, false);
  assert.equal(report.rpc, null);
  assert.equal(report.exact_proposals[0].event_id, ID);
  assert.equal(report.exact_proposals[0].review_required, true);
});

test("duplicate database payloads or indistinguishable source series never get arbitrary pairings", () => {
  const repeatedOld = backfillReport(snapshot(), [old(), old({ id: ID2 })]);
  assert.equal(repeatedOld.exact_proposals.length, 0);
  assert.equal(repeatedOld.exact_ambiguities.length, 2);
  assert.equal(repeatedOld.summary.exported_payload_duplicate_sets, 1);
  const repeatedSource = backfillReport(snapshot([source(), source({ source_key: "second-source" })]), [old()]);
  assert.equal(repeatedSource.exact_proposals.length, 0);
  assert.equal(repeatedSource.exact_ambiguities[0].source_keys.length, 2);
});

test("absence of a candidate is counted separately from ambiguity without mutating indexes", () => {
  const report = backfillReport(snapshot(), [old({ subject: "Unrelated synthetic subject" })]);
  assert.equal(report.summary.unmatched_events, 1);
  assert.equal(report.summary.exact_ambiguous_events, 0);
  assert.equal(report.summary.review_tiers.no_candidate, 1);
});

test("room changes and source cancellation are hints with explicit changed fields", () => {
  const report = backfillReport(snapshot([source({ room: null, status: "nieaktywne" })]), [old()]);
  assert.equal(report.review[0].tier, "same_slot");
  assert.deepEqual(report.review[0].candidates[0].changed_fields, ["room", "status"]);
  assert.equal(report.exact_proposals.length, 0);
  assert.equal(report.summary.unique_unclaimed_uncontested_hints, 1);
});

test("time and date movement uses progressively broader hints without guessing an identity", () => {
  const time = backfillReport(snapshot([source({ start_time: "12:00:00" })]), [old()]);
  assert.equal(time.review[0].tier, "same_day_details");
  const date = backfillReport(snapshot([source({ date: "2026-10-06" })]), [old()]);
  assert.equal(date.review[0].tier, "same_details_other_dates");
  assert.equal(date.write_ready, false);
});

test("changed day-off label is reviewed against the same date", () => {
  const free = source({ faculty: "all", status: "wolne", group: null, type: null });
  const report = backfillReport(snapshot([{ ...free, subject: "New label" }]),
    [old({ ...free, id: ID, source_system: null, source_key: null, subject: "Old label" })]);
  assert.equal(report.review[0].tier, "day_off_date");
  assert.deepEqual(report.review[0].candidates[0].changed_fields, ["subject"]);
});

test("candidate already claimed by an exact proposal is visibly reserved", () => {
  const report = backfillReport(snapshot(), [old(), old({ id: ID2, room: "old room" })]);
  assert.equal(report.exact_proposals.length, 1);
  assert.equal(report.review[0].candidates[0].claimed_by_exact_proposal, ID);
  assert.equal(report.summary.unique_unclaimed_uncontested_hints, 0);
});

test("multiple old records competing for a candidate are reported even across hint tiers", () => {
  const report = backfillReport(snapshot(), [old({ room: "old" }), old({ id: ID2, start_time: "10:00:00" })]);
  assert.equal(report.review[0].tier, "same_slot");
  assert.equal(report.review[1].tier, "same_day_details");
  assert.deepEqual(report.review[0].candidates[0].competing_review_event_ids, [ID2]);
  assert.deepEqual(report.review[1].candidates[0].competing_review_event_ids, [ID]);
});

test("long recurring series produce explicitly truncated candidate lists", () => {
  const rows = Array.from({ length: 30 }, (_, index) => source({
    source_key: `synthetic-${index}`, date: `2026-11-${String(index + 1).padStart(2, "0")}`,
  }));
  const report = backfillReport(snapshot(rows), [old()]);
  assert.equal(report.review[0].candidate_count, 30);
  assert.equal(report.review[0].candidates.length, 25);
  assert.equal(report.review[0].candidates_truncated, true);
});

test("duplicate UUIDs, assigned identities and malformed source rows are rejected", () => {
  assert.throws(() => backfillReport(snapshot(), [old(), old()]), /Duplicate exported UUID/);
  assert.throws(() => backfillReport(snapshot(), [old({ source_system: SOURCE_SYSTEM, source_key: "assigned" })]), /unassigned/);
  assert.throws(() => backfillReport(snapshot([source({ status: "invalid" })]), [old()]), /source status/);
});
