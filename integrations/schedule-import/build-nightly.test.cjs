"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

test("the committed nightly workflow matches the importer modules", () => {
  execFileSync(process.execPath, [path.join(__dirname, "build-nightly.cjs"), "--check"]);
});

test("the Code node is self-contained and the workflow writes only through the guarded RPC", () => {
  const [workflow, alert] = require("./n8n-nightly.json");
  const code = workflow.nodes.find((node) => node.name === "Plan nightly import").parameters.jsCode;
  assert.doesNotMatch(code, /require\(/);
  assert.doesNotThrow(() => new Function("$input", "crypto", code));
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
