const fs = require("fs");
const path = require("path");

const root = process.cwd();
const distDir = path.join(
  root,
  "node_modules",
  "@firebase",
  "firestore",
  "dist",
);

const missingMapFiles = ["index.esm.js.map", "common-fe7037b3.esm.js.map"];

const emptySourceMap = JSON.stringify({
  version: 3,
  file: "",
  sources: [],
  names: [],
  mappings: "",
});

if (!fs.existsSync(distDir)) {
  process.exit(0);
}

for (const mapFile of missingMapFiles) {
  const fullPath = path.join(distDir, mapFile);
  if (fs.existsSync(fullPath)) continue;
  fs.writeFileSync(fullPath, emptySourceMap, "utf8");
}
