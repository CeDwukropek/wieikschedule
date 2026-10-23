"use strict";

const { assert } = require("./transform.cjs");
const { createPlan } = require("./plan.cjs");
const { backfillReport } = require("./backfill.cjs");

// Initial migration only. Confirmation describes the starting state; it is not
// permission to execute the plan. The database verifies that state again.
function createUnlinkedBootstrap(snapshot, existingRows, confirmed = false, makeUUID) {
  assert(confirmed === true, "Confirm absence of personal event data before preparing bootstrap");
  const report = backfillReport(snapshot, existingRows);
  const matches = report.exact_proposals.map(({ event_id, source_key }) => ({ event_id, source_key }));
  const matchedIds = new Set(matches.map((row) => row.event_id));
  const matchedKeys = new Set(matches.map((row) => row.source_key));
  const decisions = { matches,
    retire: existingRows.filter((row) => !matchedIds.has(row.id)).map((row) => row.id),
    create: snapshot.rows.filter((row) => !matchedKeys.has(row.source_key)).map((row) => row.source_key),
  };
  const plan = createPlan(snapshot, existingRows, decisions, makeUUID);
  assert(plan.ready && plan.rpc.p_changes.length <= 50000, "Bootstrap exceeds supported import size");
  return { ...plan, rpc_function: "bootstrap_wieik_import",
    bootstrap: { initial_import_only: true, requires_zero_personal_event_data_at_execution: true,
      execution_approved: false, preserved_exact_uuids: matches.length,
      archived_legacy_uuids: decisions.retire.length, new_source_uuids: decisions.create.length,
      physical_deletions: 0,
      note: "Unmatched legacy UUIDs remain inactive; no fuzzy identity assignments are made." } };
}

// Release reload of a database whose events nothing references: every source row gets a new UUID.
// The plan expects an empty table; ops/release/fresh-load.sql empties it in the same transaction
// after checking that no private row points at an event.
function createFreshLoad(snapshot, makeUUID) {
  const plan = createPlan(snapshot, [], { create: snapshot.rows.map((row) => row.source_key) }, makeUUID);
  assert(plan.ready && plan.rpc.p_changes.length <= 50000, "Fresh load exceeds supported import size");
  return { ...plan, rpc_function: "apply_wieik_import",
    fresh_load: { requires_empty_events_in_same_transaction: true, requires_zero_personal_event_data: true,
      execution_approved: false } };
}

module.exports = { createUnlinkedBootstrap, createFreshLoad };
