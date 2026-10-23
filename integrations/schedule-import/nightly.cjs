"use strict";

// This module also runs in an n8n Code node. Keep it free of Node dependencies.
const { SOURCE_SYSTEM } = require("./transform.cjs");
const { createPlan } = require("./plan.cjs");

// Unattended policy for the nightly import. Identities that are certain apply without review: the
// same source key (room, time, instructor or status changes), new keys, and vanished classes, which
// become inactive and are never deleted. A vanished class that private rows point at is retired too,
// so one user's data never stops the import for everyone; it is listed in `referenced_retired` for an
// informational e-mail and its private rows stay attached to the same UUID. Only a row outside the
// importer or a mass disappearance (a likely partial upstream answer) keeps the last good state.
function createNightlyPlan(snapshot, existingRows, referencedIds = [], limits = {}) {
  const { minRetireAlarm = 50, maxRetireShare = 0.1 } = limits;
  const referenced = new Set(referencedIds);
  const incomingKeys = new Set(snapshot.rows.map((row) => row.source_key));
  const known = new Set();
  const retire = [];
  const referencedRetired = [];
  let active = 0;
  for (const row of existingRows) {
    if (row.source_system !== SOURCE_SYSTEM) continue;
    known.add(row.source_key);
    if (row.status === "nieaktywne") continue;
    active += 1;
    if (incomingKeys.has(row.source_key)) continue;
    retire.push(row.id);
    if (referenced.has(row.id)) referencedRetired.push({ event_id: row.id, faculty: row.faculty, date: row.date,
      start_time: row.start_time, subject: row.subject, group: row.group });
  }
  const create = [...incomingKeys].filter((key) => !known.has(key));
  const plan = createPlan(snapshot, existingRows, { create, retire });
  const blockers = [...plan.blockers];
  const limit = Math.max(minRetireAlarm, Math.floor(active * maxRetireShare));
  if (retire.length > limit) blockers.push({ kind: "mass_disappearance", retired: retire.length, limit });
  return { ...plan, ready: blockers.length === 0, blockers, rpc: blockers.length ? null : plan.rpc,
    referenced_retired: referencedRetired,
    nightly: { created: create.length, retired: retire.length, referenced_retired: referencedRetired.length,
      updated: plan.summary.updated - retire.length, active_before: active } };
}

module.exports = { createNightlyPlan };
