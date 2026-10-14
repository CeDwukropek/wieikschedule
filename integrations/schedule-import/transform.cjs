"use strict";

// This module also runs in an n8n Code node. Keep it free of Node dependencies.
const SOURCE_SYSTEM = "wieik-v1";
const FIELDS = ["faculty", "date", "start_time", "duration_min", "subject",
  "instructor", "room", "group", "type", "status"];
const TYPES = { W: "Wykład", L: "Labolatorium", Lab: "Labolatorium",
  Lk: "Labolatorium Komputerowe", P: "Projekt", Lek: "Lektorat",
  C: "Ćwiczenia", S: "Seminarium" };
const DAY_MS = 86400000;
const MAX_ROWS = 50000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isoDate(value) {
  assert(typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value), "Invalid ISO date");
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  assert(Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value,
    "Invalid calendar date");
  return value;
}

function time(value) {
  assert(typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d(?::00)?$/.test(value),
    "Invalid start time (whole minutes required)");
  return value.length === 5 ? `${value}:00` : value;
}

function nullableText(value, field) {
  assert(value === null || (typeof value === "string" && value.length <= 4096), `Invalid ${field}`);
  return value;
}

function validateFields(row) {
  isoDate(row.date);
  time(row.start_time);
  assert(Number.isInteger(row.duration_min) && row.duration_min > 0 && row.duration_min <= 1440,
    "Invalid duration");
  assert(typeof row.subject === "string" && row.subject.trim().length > 0 && row.subject.length <= 4096,
    "Invalid subject");
  for (const field of ["faculty", "instructor", "room", "group", "type", "status"])
    nullableText(row[field], field);
}

function envelope(payload, db) {
  assert(payload && payload.ok === true && payload.db === db && Array.isArray(payload.data),
    `Invalid or unsuccessful ${db} snapshot`);
  assert(typeof payload.revision === "string" && payload.revision.length > 0 &&
    Number.isFinite(payload.mtime), `Missing ${db} snapshot metadata`);
  assert(payload.data.length <= MAX_ROWS, `${db} snapshot too large`);
  return payload.data;
}

function datesBetween(from, to, stepDays = 1) {
  isoDate(from); isoDate(to);
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  assert(start <= end && end - start <= 732 * DAY_MS, "Invalid or excessive date range");
  const dates = [];
  for (let timestamp = start; timestamp <= end; timestamp += stepDays * DAY_MS)
    dates.push(new Date(timestamp).toISOString().slice(0, 10));
  return dates;
}

function candidateKey(parts) {
  // Candidate identity, NOT a guarantee across moved dates or renamed groups.
  return JSON.stringify(parts);
}

function transformSnapshots(schedule, blocks) {
  const series = envelope(schedule, "stac");
  const daysOff = envelope(blocks, "block");
  assert(series.length > 0, "Empty schedule requires investigation; no import generated");
  const freeDays = new Map();
  for (const block of daysOff) {
    assert(block && typeof block === "object", "Invalid block");
    // The supplied importer only supports global blocks. Fail instead of losing a scoped block.
    assert(block.scope === "all", "Scoped blocks require an explicit implementation");
    const label = block.label || "Dzień wolny";
    assert(typeof label === "string" && label.length <= 4096, "Invalid block label");
    const dates = block.date ? [isoDate(block.date)] : datesBetween(block.from, block.to);
    for (const date of dates) {
      assert(!freeDays.has(date) || freeDays.get(date) === label, "Conflicting day-off labels");
      freeDays.set(date, label);
      assert(freeDays.size <= MAX_ROWS, "Too many days off");
    }
  }

  const rows = [];
  const warnings = [];
  const seriesIds = new Set();
  const keys = new Set();
  const push = (row) => {
    validateFields(row);
    assert(!keys.has(row.source_key), "Duplicate source occurrence");
    keys.add(row.source_key);
    rows.push(row);
    assert(rows.length <= MAX_ROWS, "Expanded snapshot too large");
  };
  for (const event of series) {
    assert(event && typeof event.id === "string" && event.id.length > 0 && event.id.length <= 256,
      "Missing source series id");
    assert(!seriesIds.has(event.id), "Duplicate source series id");
    seriesIds.add(event.id);
    assert(Number.isInteger(event.intervalWeeks) && event.intervalWeeks > 0 && event.intervalWeeks <= 52,
      "Invalid recurrence interval");
    const dates = new Set(datesBetween(event.startDate, event.endDate, event.intervalWeeks * 7));
    // The API uses [] for an empty override map, and objects for nonempty maps.
    const overrides = Array.isArray(event.overrides) && event.overrides.length === 0 ? {} : event.overrides;
    assert(overrides && typeof overrides === "object" && !Array.isArray(overrides), "Invalid overrides");
    assert(Object.keys(overrides).length <= MAX_ROWS, "Too many source overrides");
    assert(Array.isArray(event.excludedDates) && event.excludedDates.length <= MAX_ROWS, "Invalid excludedDates");
    const excluded = new Set(event.excludedDates.map(isoDate));
    for (const [date, patch] of Object.entries(overrides)) {
      isoDate(date);
      assert(patch && typeof patch === "object" && !Array.isArray(patch), "Invalid source override");
      for (const flag of ["_add", "cancelled"])
        if (Object.hasOwn(patch, flag)) assert(typeof patch[flag] === "boolean", `Invalid ${flag}`);
      // Removed additions can remain in the API as _add:false,cancelled:true
      // outside the current recurrence. Keep a tombstone instead of discarding it.
      if (patch._add === true || patch.cancelled === true) dates.add(date);
      else if (!dates.has(date)) {
        // Editing a date then shortening a series can leave _add:false,
        // cancelled:false metadata. It is not a new active occurrence.
        // Any old active database row still requires explicit retirement.
        warnings.push({ kind: "orphan_override", series_id: event.id, date });
        assert(warnings.length <= MAX_ROWS, "Too many orphan overrides");
      }
    }
    for (const date of [...dates].sort()) {
      const patch = overrides[date] || {};
      const field = (name) => Object.hasOwn(patch, name) ? patch[name] : event[name];
      const groupValue = nullableText(field("group"), "group");
      // Preserve the existing per-group model, including single and NULL groups.
      // Changing group membership will be reviewed by the reconciliation planner.
      const groups = groupValue === null ? [null] :
        [...new Set(groupValue.split(/[,/]/).map((value) => value.trim()).filter(Boolean))];
      if (groups.length === 0) groups.push("");
      const cancelled = patch.cancelled === true ||
        (excluded.has(date) && patch._add !== true) || freeDays.has(date);
      for (const group of groups) {
        const prefix = group === null ? null : group.replace(/\d+$/, "").trim();
        push({
          source_system: SOURCE_SYSTEM,
          source_key: candidateKey(["stac", event.id, date, group]),
          faculty: field("faculty"), date, start_time: time(field("startTime")),
          duration_min: field("durationMin"), subject: field("eventType"),
          instructor: field("instructor"), room: field("room"), group,
          type: prefix === null || prefix === "" ? null : TYPES[prefix] || prefix,
          // Retain cancelled source records; existing readers already hide this status.
          status: cancelled ? "nieaktywne" : "aktywne",
        });
      }
    }
  }
  for (const [date, label] of freeDays) push({
    source_system: SOURCE_SYSTEM, source_key: candidateKey(["block", date]),
    faculty: "all", date, start_time: "07:00:00", duration_min: 900, subject: label,
    instructor: null, room: null, group: null, type: null, status: "wolne",
  });
  rows.sort((a, b) => a.source_key.localeCompare(b.source_key, "en"));
  return { protocol: 1, source_system: SOURCE_SYSTEM,
    revisions: { stac: schedule.revision, block: blocks.revision }, warnings, rows };
}

module.exports = { SOURCE_SYSTEM, FIELDS, assert, time, validateFields, transformSnapshots };
