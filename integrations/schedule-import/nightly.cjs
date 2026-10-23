"use strict";

// This module also runs in an n8n Code node. Keep it free of Node dependencies.
const { SOURCE_SYSTEM } = require("./transform.cjs");
const { createPlan } = require("./plan.cjs");

// Unattended policy for the nightly import. Identities that are certain apply without review: the
// same source key (room, time, instructor or status changes), new keys, and vanished classes that no
// private row references (they become inactive, never deleted). A vanished class with private rows,
// a row outside the importer or a mass disappearance keeps the last good state for a decision.
function createNightlyPlan(snapshot, existingRows, referencedIds = [], limits = {}) {
  const { minRetireAlarm = 50, maxRetireShare = 0.1 } = limits;
  const referenced = new Set(referencedIds);
  const incomingKeys = new Set(snapshot.rows.map((row) => row.source_key));
  const known = new Set();
  const retire = [];
  let active = 0;
  for (const row of existingRows) {
    if (row.source_system !== SOURCE_SYSTEM) continue;
    known.add(row.source_key);
    if (row.status === "nieaktywne") continue;
    active += 1;
    if (!incomingKeys.has(row.source_key) && !referenced.has(row.id)) retire.push(row.id);
  }
  const create = [...incomingKeys].filter((key) => !known.has(key));
  const plan = createPlan(snapshot, existingRows, { create, retire });
  const blockers = plan.blockers.map((blocker) => blocker.kind === "missing_occurrence"
    ? { ...blocker, kind: "missing_referenced_occurrence" } : blocker);
  // A partial upstream answer looks like many classes vanishing at once.
  const limit = Math.max(minRetireAlarm, Math.floor(active * maxRetireShare));
  if (retire.length > limit) blockers.push({ kind: "mass_disappearance", retired: retire.length, limit });
  return { ...plan, ready: blockers.length === 0, blockers, rpc: blockers.length ? null : plan.rpc,
    nightly: { created: create.length, retired: retire.length,
      updated: plan.summary.updated - retire.length, active_before: active } };
}

module.exports = { createNightlyPlan };
