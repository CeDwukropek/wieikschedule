// Runs inside the n8n container during ops/release/n8n-import.sh. Re-importing replaces the workflows,
// so credentials chosen in the UI are carried over: by node name, otherwise (a new node) from any existing
// node with the same credential type. Prints the IDs of workflows that were active before the import.
// node n8n-keep-credentials.cjs <new.json> <current.json> <merged.json>
const fs = require("fs");
const [next, current, merged] = process.argv.slice(2);
const workflows = JSON.parse(fs.readFileSync(next, "utf8"));
const existing = fs.existsSync(current) ? JSON.parse(fs.readFileSync(current, "utf8")) : [];
const byType = {};
for (const workflow of existing) for (const node of workflow.nodes || [])
  for (const [type, credential] of Object.entries(node.credentials || {})) if (credential.id) byType[type] ??= credential;
const active = [];
for (const workflow of workflows) {
  const before = existing.find((item) => item.id === workflow.id);
  if (before?.active) active.push(workflow.id);
  for (const node of workflow.nodes) {
    const previous = before?.nodes.find((item) => item.name === node.name)?.credentials || {};
    for (const type of Object.keys(node.credentials || {})) {
      const credential = previous[type]?.id ? previous[type] : byType[type];
      if (credential) node.credentials[type] = { id: credential.id, name: credential.name };
      else console.error(`no ${type} credential for "${node.name}" in "${workflow.name}"; select it in n8n`);
    }
  }
}
fs.writeFileSync(merged, JSON.stringify(workflows));
console.log(active.join(" "));
