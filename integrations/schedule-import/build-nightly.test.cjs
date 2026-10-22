"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

test("the committed nightly workflow matches the importer modules", () => {
  execFileSync(process.execPath, [path.join(__dirname, "build-nightly.cjs"), "--check"]);
});

test("the Code node is self-contained and the workflow writes only through the guarded RPC", () => {
  const workflow = require("./n8n-nightly.json");
  const code = workflow.nodes.find((node) => node.name === "Plan nightly import").parameters.jsCode;
  assert.doesNotMatch(code, /require\(/);
  assert.doesNotThrow(() => new Function("$input", "crypto", code));
  const queries = workflow.nodes.filter((node) => node.type === "n8n-nodes-base.postgres").map((node) => node.parameters.query);
  assert.equal(queries.length, 2);
  assert.doesNotMatch(queries.join("\n"), /\b(INSERT|UPDATE|DELETE|TRUNCATE)\b/i);
  assert.match(queries[1], /public\.apply_wieik_import\(\$2::jsonb, \$3::jsonb\)/);
  assert.equal(workflow.active, false);
  assert.equal(workflow.settings.timezone, "Europe/Warsaw");
});
