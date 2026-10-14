"use strict";

const fs = require("node:fs");
const path = require("node:path");
const sourcePath = path.join(__dirname, "transform.cjs");
const moduleSource = fs.readFileSync(sourcePath, "utf8");
const code = `${moduleSource.replace(/module\.exports = [^\n]+;\s*$/, "")}
const payloads = $input.all().map(item => item.json);
const schedule = payloads.filter(p => p.db === 'stac');
const blocks = payloads.filter(p => p.db === 'block');
assert(schedule.length === 1 && blocks.length === 1, 'Exactly two source snapshots required');
return [{json: transformSnapshots(schedule[0], blocks[0])}];
`;
// Synthetic, portable preview. No copied credential IDs, pinData or user metadata.
const workflow = {
  name: "WIEiK schedule — validated preview (no writes)", active: false,
  settings: { executionOrder: "v1" },
  nodes: [
    { id: "manual", name: "Manual preview", type: "n8n-nodes-base.manualTrigger", typeVersion: 1, position: [0, 0], parameters: {} },
    ...["stac", "block"].map((db, index) => ({
      id: db, name: `Fetch ${db}`, type: "n8n-nodes-base.httpRequest", typeVersion: 4.2,
      position: [240, index * 200 - 100], parameters: {
        url: `https://plany.wieik.pk.edu.pl/lib/tpl/kiwiki/wk_plan_api.php?action=load&db=${db}`,
        options: { timeout: 30000 },
      },
    })),
    { id: "merge", name: "Combine snapshots", type: "n8n-nodes-base.merge", typeVersion: 3.2,
      position: [480, 0], parameters: { mode: "append" } },
    { id: "preview", name: "Validate and expand", type: "n8n-nodes-base.code", typeVersion: 2,
      position: [720, 0], parameters: { mode: "runOnceForAllItems", jsCode: code } },
  ],
  connections: {
    "Manual preview": { main: [[{ node: "Fetch stac", type: "main", index: 0 },
      { node: "Fetch block", type: "main", index: 0 }]] },
    "Fetch stac": { main: [[{ node: "Combine snapshots", type: "main", index: 0 }]] },
    "Fetch block": { main: [[{ node: "Combine snapshots", type: "main", index: 1 }]] },
    "Combine snapshots": { main: [[{ node: "Validate and expand", type: "main", index: 0 }]] },
  },
};
const output = `${JSON.stringify(workflow, null, 2)}\n`;
const target = path.join(__dirname, "n8n-preview.json");
if (process.argv.includes("--check")) {
  if (fs.readFileSync(target, "utf8") !== output) throw new Error("Regenerate n8n-preview.json");
} else fs.writeFileSync(target, output);
