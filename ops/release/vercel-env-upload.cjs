// Uploads the release environment from a dotenv file to the wieikschedule Vercel project (Production and
// the Preview of PREVIEW_BRANCH). Never prints values. DRY_RUN=1 only reports formats and planned writes.
// docker run --rm --env-file ~/.config/wieikschedule/ops.env -e PREVIEW_BRANCH=release/e5 -v "$PWD/ops/release":/scripts:ro \
//   -v <.env.local>:/secrets/.env.local:ro node:22.11.0-alpine node /scripts/vercel-env-upload.cjs
const fs = require("fs");
const token = process.env.VERCEL_TOKEN;
const FILE = "/secrets/.env.local";
const BRANCH = process.env.PREVIEW_BRANCH;
// ONLY=KEY1,KEY2 limits the upload to those keys, e.g. to replace one corrected value.
const ONLY = process.env.ONLY ? new Set(process.env.ONLY.split(",")) : null;
const KEYS = ["REACT_APP_SUPABASE_URL", "REACT_APP_SUPABASE_ANON_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY",
  "FIREBASE_PROJECT_ID", "FIREBASE_CLIENT_EMAIL", "FIREBASE_PRIVATE_KEY", "SCHEDULE_TOOL_SECRET",
  "REACT_APP_PERSONAL_SCHEDULE", "REACT_APP_CALENDAR_SYNC", "REACT_APP_ENABLE_AI_CHAT", "REACT_APP_N8N_CHAT_WEBHOOK",
  "REACT_APP_PLAN_ITEMS"];
const SECRET = new Set(["SUPABASE_SERVICE_ROLE_KEY", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL", "SCHEDULE_TOOL_SECRET"]);

function parse(text) {
  const out = {};
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2], quoted = false;
    if (value.length >= 2 && value[0] === "'" && value.at(-1) === "'") {
      value = value.slice(1, -1); quoted = true;
    } else if (value.length >= 2 && value[0] === '"' && value.at(-1) === '"') {
      // Same escapes as dotenv and docker compose: a private key stored with \\n must become real newlines.
      value = value.slice(1, -1).replace(/\\(.)/g, (_, c) => ({ n: "\n", r: "\r", t: "\t" })[c] ?? c); quoted = true;
    }
    out[m[1]] = { value, quoted };
  }
  return out;
}
async function api(method, path, body) {
  const res = await fetch("https://api.vercel.com" + path, { method, headers: { Authorization: "Bearer " + token,
    "Content-Type": "application/json" }, body: body && JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(method + " " + path.split("?")[0] + " -> " + res.status + " " + (json.error ? json.error.code + ": " + json.error.message : ""));
  return json;
}
(async () => {
  if (!BRANCH) throw new Error("PREVIEW_BRANCH missing");
  const env = parse(fs.readFileSync(FILE, "utf8"));
  const keys = KEYS.filter((key) => !ONLY || ONLY.has(key));
  if (ONLY && keys.length !== ONLY.size) throw new Error("ONLY names an unknown key");
  for (const key of keys) {
    const item = env[key];
    if (!item || !item.value) throw new Error("missing or empty " + key);
    console.log(key, "len=" + item.value.length, "quoted=" + item.quoted, "escapedNewlines=" + item.value.includes("\\n"),
      "realNewlines=" + item.value.includes("\n"), "type=" + (SECRET.has(key) ? "sensitive" : "encrypted"));
  }
  const project = (await api("GET", "/v9/projects?limit=100")).projects.find(p => p.name === "wieikschedule");
  const existing = (await api("GET", "/v9/projects/" + project.id + "/env")).envs;
  const writes = [];
  for (const key of keys) {
    const type = SECRET.has(key) ? "sensitive" : "encrypted";
    writes.push({ key, value: env[key].value, type, target: ["production"] });
    writes.push({ key, value: env[key].value, type, target: ["preview"], gitBranch: BRANCH });
  }
  for (const w of writes) {
    const clash = existing.filter(e => e.key === w.key && (e.target || []).some(t => w.target.includes(t)) && (e.gitBranch || "") === (w.gitBranch || ""));
    console.log("plan:", w.key, w.target.join(","), w.gitBranch || "(all branches)", clash.length ? "REPLACES EXISTING" : "new");
  }
  if (process.env.DRY_RUN === "1") return console.log("dry run: nothing written");
  for (const w of writes) {
    await api("POST", "/v10/projects/" + project.id + "/env?upsert=true", w);
    console.log("written:", w.key, w.target.join(","), w.gitBranch || "");
  }
})().catch(err => { console.log("error:", err.message); process.exitCode = 1; });
