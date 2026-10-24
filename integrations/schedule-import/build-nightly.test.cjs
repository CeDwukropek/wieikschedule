"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");
const vm = require("node:vm");

test("the committed nightly workflow matches the importer modules", () => {
  execFileSync(process.execPath, [path.join(__dirname, "build-nightly.cjs"), "--check"]);
});

test("the Code node is self-contained and the workflow writes only through the guarded RPC", () => {
  const [workflow, alert] = require("./n8n-nightly.json");
  const code = workflow.nodes.find((node) => node.name === "Plan nightly import").parameters.jsCode;
  assert.doesNotMatch(code, /require\(/);
  assert.doesNotThrow(() => new Function("$input", code));
  const queries = workflow.nodes.filter((node) => node.type === "n8n-nodes-base.postgres").map((node) => node.parameters.query);
  assert.equal(queries.length, 2);
  assert.doesNotMatch(queries.join("\n"), /\b(INSERT|UPDATE|DELETE|TRUNCATE)\b/i);
  assert.match(queries[1], /public\.apply_wieik_import\(\$2::jsonb, \$3::jsonb\)/);
  assert.equal(workflow.active, false);
  assert.equal(workflow.settings.timezone, "Europe/Warsaw");
  assert.equal(workflow.settings.errorWorkflow, alert.id);
});

test("failures are mailed to an address substituted at import time, not committed", () => {
  const [, alert] = require("./n8n-nightly.json");
  assert.deepEqual(alert.nodes.map((node) => node.type), ["n8n-nodes-base.errorTrigger", "n8n-nodes-base.emailSend"]);
  const mail = alert.nodes[1].parameters;
  assert.equal(mail.toEmail, "alert-recipient@example.invalid");
  assert.equal(mail.fromEmail, "alert-sender@example.invalid");
  assert.doesNotMatch(JSON.stringify(require("./n8n-nightly.json")), /@(?!example\.invalid)[a-z0-9-]+\.[a-z]/i);
});

test("classes retired despite private rows are mailed after a successful write only", () => {
  const [workflow] = require("./n8n-nightly.json");
  const check = workflow.nodes.find((node) => node.name === "Private rows retired?").parameters.jsCode;
  const run = (plan) => new Function("$", check)(() => ({ first: () => ({ json: plan }) }));
  assert.deepEqual(run({ action: "none", nightly: { referenced_retired: 0 }, referenced_retired: [] }), []);
  assert.deepEqual(run({ action: "blocked", nightly: { referenced_retired: 1 }, referenced_retired: [] }), []);
  const [item] = run({ action: "apply", nightly: { referenced_retired: 1 }, referenced_retired: [
    { faculty: "TEST", date: "2026-11-05", start_time: "09:15:00", subject: "Synthetic", group: "L2" }] });
  assert.deepEqual(item.json, { count: 1, list: "- TEST, 2026-11-05 09:15, Synthetic (L2)" });
  const mail = workflow.nodes.find((node) => node.name === "Send notice");
  assert.equal(mail.parameters.toEmail, "alert-recipient@example.invalid");
  assert.deepEqual(workflow.connections["Private rows retired?"].main[0].map((link) => link.node), ["Send notice"]);
});

// The same variables n8n 2.x gives a Code node in its secure task runner (JsTaskRunner.getNativeVariables):
// no crypto, no require, no process. The nightly import failed in production on `crypto is not defined`.
test("the Code node runs in the n8n task-runner sandbox and makes valid unique UUIDs", () => {
  const [workflow] = require("./n8n-nightly.json");
  const code = workflow.nodes.find((node) => node.name === "Plan nightly import").parameters.jsCode;
  const series = (id, group) => ({ id, eventType: "Synthetic subject", group, faculty: "TEST", instructor: "Synthetic teacher",
    room: "101", startDate: "2026-10-05", endDate: "2026-10-19", startTime: "09:00", durationMin: 90, intervalWeeks: 1,
    excludedDates: [], overrides: [] });
  const payloads = [{ ok: true, db: "stac", data: [series("a", "L1"), series("b", "L2")], revision: "r1", mtime: 1 },
    { ok: true, db: "block", data: [], revision: "r2", mtime: 1 }, { events: [], referenced: [] }];
  const sandbox = { $input: { all: () => payloads.map((json) => ({ json })) }, Buffer, setTimeout, setInterval, setImmediate,
    clearTimeout, clearInterval, clearImmediate, btoa, atob, TextDecoder, TextEncoder, console };
  const [{ json }] = vm.runInNewContext(`(function(){${code}})()`, sandbox, { timeout: 5000 });
  assert.equal(vm.runInNewContext("typeof crypto", sandbox), "undefined");
  assert.equal(json.action, "apply");
  const ids = JSON.parse(json.p_changes).map((row) => row.id);
  assert.equal(ids.length, 6);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});
