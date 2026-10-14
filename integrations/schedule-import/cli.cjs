#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const { transformSnapshots } = require("./transform.cjs");
const { createPlan } = require("./plan.cjs");

// Offline only: no credentials, database connection or write switch.
function read(path) {
  if (!path) throw new Error("Missing input file");
  return JSON.parse(fs.readFileSync(path, "utf8"));
}
try {
  const [command, ...paths] = process.argv.slice(2);
  let output;
  if (command === "transform" && paths.length === 2)
    output = transformSnapshots(read(paths[0]), read(paths[1]));
  else if (command === "plan" && (paths.length === 2 || paths.length === 3)) {
    output = createPlan(read(paths[0]), read(paths[1]), paths[2] ? read(paths[2]) : {});
    if (!output.ready) process.exitCode = 2;
  } else throw new Error("Usage: node cli.cjs transform stac.json block.json | plan normalized.json events.json [decisions.json]");
  process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`Import preparation failed: ${error.message}\n`);
  process.exitCode = 1;
}
