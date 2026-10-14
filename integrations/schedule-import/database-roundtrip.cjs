"use strict";

// Synthetic integration test ONLY. Run after database-test.sql in its disposable
// database. stdin is fixture_snapshot(); stdout is SQL for that same database.
const fs = require("node:fs");
const assert = require("node:assert/strict");
const { transformSnapshots } = require("./transform.cjs");
const { createPlan } = require("./plan.cjs");
const baseline = JSON.parse(fs.readFileSync(0, "utf8"));
assert.equal(baseline.length, 2, "Expected the disposable SQL test fixture");
const snapshot = transformSnapshots({ ok: true, db: "stac", revision: "roundtrip", mtime: 1,
  data: [{ id: "roundtrip-series", eventType: "Synthetic roundtrip", group: "L1", faculty: "TEST",
    instructor: null, room: null, startDate: "2026-10-08", endDate: "2026-10-08", startTime: "12:00",
    durationMin: 45, intervalWeeks: 1, excludedDates: [], overrides: [] }],
}, { ok: true, db: "block", revision: "roundtrip", mtime: 1, data: [] });
const plan = createPlan(snapshot, baseline, {
  matches: [{ source_key: snapshot.rows[0].source_key, event_id: baseline[0].id }],
  retire: [baseline[1].id],
});
assert.equal(plan.ready, true);
const changed = new Map(plan.rpc.p_changes.map((row) => [row.id, row]));
const after = plan.rpc.p_expected.map((row) => changed.get(row.id) || row);
const again = createPlan(snapshot, after);
assert.equal(again.ready, true);
assert.deepEqual(again.rpc.p_changes, []);
const literal = (value) => `'${JSON.stringify(value).replaceAll("'", "''")}'::jsonb`;
process.stdout.write(`
\\set ON_ERROR_STOP on
SET standard_conforming_strings = on;
SET ROLE service_role;
SELECT public.apply_wieik_import(${literal(plan.rpc.p_expected)}, ${literal(plan.rpc.p_changes)});
SELECT public.fixture_snapshot() = ${literal(after)} AS snapshot_matches \\gset
\\if :snapshot_matches
\\else
\\quit 1
\\endif
SELECT public.apply_wieik_import(${literal(again.rpc.p_expected)}, ${literal(again.rpc.p_changes)});
RESET ROLE;
SELECT count(*) = 2 AS links_preserved FROM public.fixture_private_links \\gset
\\if :links_preserved
\\else
\\quit 1
\\endif
SELECT 'JavaScript plan -> PostgreSQL roundtrip passed' AS result;
`);
