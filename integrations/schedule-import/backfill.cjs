"use strict";

const { FIELDS, SOURCE_SYSTEM, assert, time, validateFields } = require("./transform.cjs");
const { canonicalRow } = require("./plan.cjs");
const MAX_ROWS = 100000;
const MAX_CANDIDATES = 25;
const NULLABLE = new Set(["faculty", "instructor", "room", "group", "type", "status"]);

// RFC 4180-style CSV, including BOM, escaped quotes and quoted newlines.
// Empty unquoted nullable cells are only an inference; the report records it.
function readEventsCSV(text) {
  assert(typeof text === "string", "Expected CSV text");
  text = text.replace(/^\uFEFF/, "");
  const records = [];
  let record = [], value = "", quoted = false, inQuotes = false, closedQuote = false;
  const cell = () => {
    record.push({ value, quoted });
    value = ""; quoted = false; closedQuote = false;
  };
  const line = () => {
    cell(); records.push(record); record = [];
    assert(records.length <= MAX_ROWS + 1, "CSV row limit exceeded");
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') { value += '"'; i++; }
        else { inQuotes = false; closedQuote = true; }
      } else value += char;
    } else if (char === ",") cell();
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      line();
    } else if (char === '"') {
      assert(value === "" && !closedQuote, "Unexpected CSV quote");
      quoted = true; inQuotes = true;
    } else {
      assert(!closedQuote, "Unexpected text after CSV quote");
      value += char;
    }
  }
  assert(!inQuotes, "Unclosed CSV quote");
  if (record.length || value !== "" || quoted || closedQuote) line();
  assert(records.length >= 2, "CSV must contain a header and events");
  const header = records.shift().map((field) => field.value);
  const required = ["id", ...FIELDS];
  const allowed = new Set([...required, "source_system", "source_key"]);
  assert(new Set(header).size === header.length && required.every((field) => header.includes(field)) &&
    header.every((field) => allowed.has(field)), "Unexpected or incomplete events CSV header");
  const inferredNulls = [];
  const rows = records.map((cells, index) => {
    assert(cells.length === header.length, `CSV column count mismatch on record ${index + 2}`);
    const row = {};
    for (let i = 0; i < header.length; i++) {
      const field = header[i], cell = cells[i];
      if (field === "duration_min") {
        assert(/^\d+$/.test(cell.value), "Invalid CSV duration");
        row[field] = Number(cell.value);
      } else if (cell.value === "" && !cell.quoted &&
        (NULLABLE.has(field) || field === "source_system" || field === "source_key")) {
        row[field] = null;
        inferredNulls.push({ event_id: cells[header.indexOf("id")].value, field });
      } else row[field] = cell.value;
    }
    return canonicalRow(row);
  });
  return { rows, inferred_nulls: inferredNulls,
    null_convention: "unquoted empty nullable cell inferred as SQL NULL; verify before applying a plan" };
}

function fingerprint(row, fields) { return JSON.stringify(fields.map((field) => row[field])); }
function indexRows(rows, fields) {
  const index = new Map();
  for (const row of rows) {
    const key = fingerprint(row, fields);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(row);
  }
  return index;
}

function backfillReport(snapshot, existingRows, inputEvidence = {}) {
  assert(snapshot?.protocol === 1 && snapshot.source_system === SOURCE_SYSTEM &&
    Array.isArray(snapshot.rows) && snapshot.rows.length > 0 && snapshot.rows.length <= MAX_ROWS,
  "Invalid normalized snapshot");
  assert(Array.isArray(existingRows) && existingRows.length > 0 && existingRows.length <= MAX_ROWS,
    "Expected nonempty events export");
  const existing = existingRows.map((row) => canonicalRow(row));
  const ids = new Set();
  for (const row of existing) {
    assert(!ids.has(row.id), "Duplicate exported UUID");
    ids.add(row.id);
    assert(row.source_system === null, "Backfill report requires unassigned source identities");
  }
  const source = snapshot.rows.map((row) => {
    validateFields(row);
    assert(row.source_system === SOURCE_SYSTEM && typeof row.source_key === "string" &&
      row.source_key.length > 0 && row.source_key.length <= 2048 && !Object.hasOwn(row, "id"),
    "Invalid source row identity");
    assert(["aktywne", "nieaktywne", "wolne"].includes(row.status), "Invalid source status");
    return { ...row, start_time: time(row.start_time) };
  });
  assert(new Set(source.map((row) => row.source_key)).size === source.length, "Duplicate source key");
  const oldExact = indexRows(existing, FIELDS), newExact = indexRows(source, FIELDS);
  const proposals = [], ambiguous = [], unmatched = [];
  const claimed = new Map();
  for (const row of existing) {
    const key = fingerprint(row, FIELDS);
    const candidates = newExact.get(key) || [];
    const old = oldExact.get(key);
    if (old.length === 1 && candidates.length === 1) {
      const proposal = { event_id: row.id, source_key: candidates[0].source_key, review_required: true };
      proposals.push(proposal);
      claimed.set(proposal.source_key, proposal.event_id);
    } else if (candidates.length) ambiguous.push({ event: row,
      competing_event_ids: old.map((event) => event.id),
      source_keys: candidates.map((event) => event.source_key), review_required: true });
    else unmatched.push(row);
  }

  const tiers = [
    { name: "day_off_date", fields: ["faculty", "date"],
      index: indexRows(source.filter((row) => row.status === "wolne"), ["faculty", "date"]),
      applies: (row) => row.status === "wolne" },
    { name: "same_slot", fields: ["faculty", "date", "start_time", "duration_min", "subject", "group", "type"] },
    { name: "same_day_details", fields: ["faculty", "date", "subject", "group", "type"] },
    { name: "same_details_other_dates", fields: ["faculty", "subject", "group", "type"] },
  ];
  for (const tier of tiers) tier.index ||= indexRows(source, tier.fields);
  const review = unmatched.map((row) => {
    for (const tier of tiers) {
      if (tier.applies && !tier.applies(row)) continue;
      const candidates = tier.index.get(fingerprint(row, tier.fields)) || [];
      if (!candidates.length) continue;
      const ordered = [...candidates].sort((a, b) => a.date.localeCompare(b.date) ||
        a.start_time.localeCompare(b.start_time) || a.source_key.localeCompare(b.source_key));
      return { event: row, tier: tier.name, candidate_count: candidates.length,
        candidates_truncated: candidates.length > MAX_CANDIDATES,
        candidates: ordered.slice(0, MAX_CANDIDATES).map((candidate) => ({
          source: candidate, changed_fields: FIELDS.filter((field) => row[field] !== candidate[field]),
          claimed_by_exact_proposal: claimed.get(candidate.source_key) || null,
        })), review_required: true };
    }
    return { event: row, tier: "no_candidate", candidate_count: 0, candidates: [], review_required: true };
  });
  const requests = new Map(tiers.map((tier) => [tier.name, new Map()]));
  for (const item of review) if (item.tier !== "no_candidate") {
    const tier = tiers.find((tier) => tier.name === item.tier);
    const key = fingerprint(item.event, tier.fields), index = requests.get(tier.name);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push(item.event.id);
  }
  for (const item of review) for (const candidate of item.candidates) {
    const competitors = [];
    for (const tier of tiers) {
      if (tier.name === "day_off_date" && candidate.source.status !== "wolne") continue;
      for (const id of requests.get(tier.name).get(fingerprint(candidate.source, tier.fields)) || [])
        if (id !== item.event.id) competitors.push(id);
    }
    candidate.competing_review_event_count = competitors.length;
    candidate.competing_review_event_ids = competitors.slice(0, MAX_CANDIDATES);
    candidate.competing_events_truncated = competitors.length > MAX_CANDIDATES;
  }
  const counts = Object.fromEntries(tiers.map((tier) => [tier.name, 0]));
  counts.no_candidate = 0;
  for (const item of review) counts[item.tier]++;
  const duplicates = (index, field) => [...index.values()].filter((rows) => rows.length > 1)
    .map((rows) => ({ identifiers: rows.map((row) => row[field]), extra_rows: rows.length - 1 }));
  const oldDuplicates = duplicates(oldExact, "id"), sourceDuplicates = duplicates(newExact, "source_key");
  const uniqueHints = review.filter((item) => item.candidate_count === 1 &&
    !item.candidates[0].claimed_by_exact_proposal && item.candidates[0].competing_review_event_count === 0);
  return {
    report_protocol: 1, write_ready: false, rpc: null,
    explanation: "Initial content matches are review proposals, not proof of source identity or approved decisions.",
    evidence: inputEvidence, revisions: snapshot.revisions, source_warnings: snapshot.warnings || [],
    summary: { exported_events: existing.length, source_events: source.length,
      exact_one_to_one_proposals: proposals.length, exact_ambiguous_events: ambiguous.length,
      unmatched_events: review.length, review_tiers: counts,
      unique_unclaimed_uncontested_hints: uniqueHints.length,
      unresolved_beyond_unique_hints: existing.length - proposals.length - uniqueHints.length,
      source_events_without_exact_proposal: source.length - claimed.size,
      exported_payload_duplicate_sets: oldDuplicates.length,
      source_payload_duplicate_sets: sourceDuplicates.length,
      review_events_with_truncated_candidates: review.filter((item) => item.candidates_truncated).length },
    exact_proposals: proposals, exact_ambiguities: ambiguous, review,
    exported_duplicates: oldDuplicates, source_duplicates: sourceDuplicates,
    source_without_exact_proposal: source.filter((row) => !claimed.has(row.source_key)).map((row) => row.source_key),
  };
}

module.exports = { readEventsCSV, backfillReport };
