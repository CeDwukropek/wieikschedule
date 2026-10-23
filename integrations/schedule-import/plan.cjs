"use strict";

const { randomUUID } = require("node:crypto");
const { SOURCE_SYSTEM, FIELDS, assert, time, validateFields } = require("./transform.cjs");
const COLUMNS = ["id", ...FIELDS, "source_system", "source_key"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function canonicalRow(row, sourceRequired = false) {
  assert(row && typeof row === "object", "Invalid database row");
  assert(typeof row.id === "string" && UUID.test(row.id), "Invalid event UUID");
  const result = Object.fromEntries(COLUMNS.map((field) => [field, row[field]]));
  result.start_time = time(result.start_time);
  result.source_system ??= null;
  result.source_key ??= null;
  validateFields(result);
  assert((result.source_system === null && result.source_key === null) ||
    (typeof result.source_system === "string" && result.source_system.length > 0 &&
      typeof result.source_key === "string" && result.source_key.length > 0), "Incomplete source identity");
  if (sourceRequired) assert(result.source_system === SOURCE_SYSTEM, "Unexpected source system");
  return result;
}

function createPlan(snapshot, existingRows, decisions = {}, makeUUID = randomUUID) {
  assert(snapshot?.protocol === 1 && snapshot.source_system === SOURCE_SYSTEM &&
    Array.isArray(snapshot.rows) && snapshot.rows.length > 0, "Invalid normalized snapshot");
  assert(Array.isArray(existingRows), "Expected a complete events export array");
  for (const key of Object.keys(decisions))
    assert(["matches", "create", "retire", "retain_unmanaged"].includes(key), `Unknown decision: ${key}`);
  const matches = decisions.matches || [];
  const creations = decisions.create || [];
  const retirements = decisions.retire || [];
  const retained = decisions.retain_unmanaged || [];
  for (const list of [matches, creations, retirements, retained])
    assert(Array.isArray(list), "Decision lists must be arrays");
  const baseline = existingRows.map((row) => canonicalRow(row)).sort((a, b) => a.id < b.id ? -1 : 1);
  const byId = new Map();
  const byKey = new Map();
  for (const row of baseline) {
    assert(!byId.has(row.id), "Duplicate database UUID");
    byId.set(row.id, row);
    if (row.source_system === SOURCE_SYSTEM) {
      assert(!byKey.has(row.source_key), "Duplicate existing source key");
      byKey.set(row.source_key, row);
    }
  }
  const incoming = new Map();
  for (const row of snapshot.rows) {
    assert(row.source_system === SOURCE_SYSTEM && typeof row.source_key === "string" &&
      row.source_key.length > 0 && row.source_key.length <= 2048, "Invalid candidate source key");
    assert(!Object.hasOwn(row, "id"), "Source text IDs must not be used as UUIDs");
    validateFields(row);
    assert(["aktywne", "nieaktywne", "wolne"].includes(row.status), "Invalid imported status");
    assert(!incoming.has(row.source_key), "Duplicate incoming source key");
    incoming.set(row.source_key, row);
  }

  const mappings = new Map();
  const mappedIds = new Set();
  for (const match of matches) {
    assert(match && Object.keys(match).length === 2 &&
      Object.hasOwn(match, "source_key") && Object.hasOwn(match, "event_id"), "Invalid match decision");
    const old = byId.get(match.event_id);
    assert(old && incoming.has(match.source_key), "Match must reference an existing UUID and incoming key");
    assert(old.source_system === null || old.source_system === SOURCE_SYSTEM, "Cannot adopt another source");
    assert(!mappings.has(match.source_key) && !mappedIds.has(old.id), "Duplicate match decision");
    mappings.set(match.source_key, old);
    mappedIds.add(old.id);
  }
  const create = new Set(creations);
  const retire = new Set(retirements);
  const keep = new Set(retained);
  assert(create.size === creations.length && retire.size === retirements.length &&
    keep.size === retained.length, "Duplicate decision");
  for (const key of create)
    assert(incoming.has(key) && (!byKey.has(key) || mappedIds.has(byKey.get(key).id)) &&
      !mappings.has(key), "Invalid create decision");
  for (const id of retire) {
    const old = byId.get(id);
    assert(old && (old.source_system === null || old.source_system === SOURCE_SYSTEM) &&
      !mappedIds.has(id), "Invalid retire decision");
  }
  for (const id of keep)
    assert(byId.get(id)?.source_system === null && !retire.has(id) && !mappedIds.has(id),
      "Invalid retain_unmanaged decision");

  const blockers = [];
  const changes = [];
  const used = new Set();
  for (const [key, row] of incoming) {
    const old = mappings.get(key) || (create.has(key) ? null : byKey.get(key));
    if (old) {
      assert(!used.has(old.id), "One UUID cannot represent two incoming occurrences; map both explicitly");
      assert(!retire.has(old.id), "Cannot retire a matched occurrence");
      used.add(old.id);
      const next = canonicalRow({ ...row, id: old.id }, true);
      if (JSON.stringify(next) !== JSON.stringify(old)) changes.push(next);
    } else if (create.has(key)) {
      const next = canonicalRow({ ...row, id: makeUUID() }, true);
      assert(!byId.has(next.id) && !used.has(next.id), "Generated duplicate UUID");
      used.add(next.id);
      changes.push(next);
    } else blockers.push({ kind: "unmapped_occurrence", source_key: key });
  }
  for (const row of baseline) {
    if (used.has(row.id)) continue;
    if (retire.has(row.id)) {
      changes.push({ ...row, source_system: SOURCE_SYSTEM,
        source_key: row.source_key || JSON.stringify(["legacy", row.id]), status: "nieaktywne" });
    } else if (row.source_system === SOURCE_SYSTEM) {
      // An already retired row remains available for reappearance with the same UUID.
      if (row.status !== "nieaktywne") blockers.push({ kind: "missing_occurrence", event_id: row.id,
        source_key: row.source_key });
    } else if (row.source_system === null && !keep.has(row.id)) {
      blockers.push({ kind: "unmanaged_existing_event", event_id: row.id });
    }
  }
  const finalKeys = new Set();
  const finalRows = new Map(baseline.map((row) => [row.id, row]));
  for (const row of changes) finalRows.set(row.id, row);
  for (const row of finalRows.values()) if (row.source_system === SOURCE_SYSTEM) {
    assert(!finalKeys.has(row.source_key), "Two UUIDs would share a source key; review duplicate mappings");
    finalKeys.add(row.source_key);
  }
  return { ready: blockers.length === 0, blockers,
    summary: { incoming: incoming.size, existing: baseline.length,
      inserted: changes.filter((row) => !byId.has(row.id)).length,
      updated: changes.filter((row) => byId.has(row.id)).length },
    revisions: snapshot.revisions,
    warnings: snapshot.warnings || [],
    // Never emit an executable partial plan with unresolved identities.
    rpc: blockers.length ? null : { p_expected: baseline, p_changes: changes } };
}

module.exports = { COLUMNS, canonicalRow, createPlan };
