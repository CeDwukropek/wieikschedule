"use strict";
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { pipeline } = require("node:stream");

const root = path.resolve(__dirname, "../../build");
// Same per-area routers as the Vercel functions api/<area>/[action].js.
const routers = Object.fromEntries(["my-plan", "schedule", "calendar-sync"].map((area) =>
  [area, require(`../../api/${area}/[action].js`)]));
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript",
  ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png",
  ".ico": "image/x-icon", ".woff2": "font/woff2" };
function json(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(value));
}
function proxy(req, res, target) {
  const headers = { ...req.headers, host: target.host };
  delete headers.connection;
  const upstream = http.request(target, { method: req.method, headers, timeout: 210000 }, (response) => {
    res.writeHead(response.statusCode, response.headers);
    pipeline(response, res, () => {});
  });
  upstream.on("timeout", () => upstream.destroy(new Error("timeout")));
  upstream.on("error", () => { if (!res.headersSent) json(res, 502, { ok: false, error: "STAGING_UPSTREAM_UNAVAILABLE" }); else res.destroy(); });
  req.on("aborted", () => upstream.destroy());
  pipeline(req, upstream, () => {});
}
async function api(req, res, handler, url) {
  req.query = Object.fromEntries(url.searchParams);
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1048576) return json(res, 413, { ok: false, error: "BODY_TOO_LARGE" });
    chunks.push(chunk);
  }
  try { req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}; }
  catch { return json(res, 400, { ok: false, error: "INVALID_JSON" }); }
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (value) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(value)); };
  await handler(req, res);
}
const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://staging.invalid");
    if (url.pathname === "/staging/health") {
      const response = await fetch("http://postgrest:3000/events?select=id&limit=1", { signal: AbortSignal.timeout(4000) });
      return json(res, response.ok ? 200 : 503, { environment: "local-staging", database: response.ok,
        firebaseConfigured: Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) });
    }
    if (url.pathname.startsWith("/supabase/rest/v1/")) {
      const target = new URL("http://postgrest:3000");
      target.pathname = url.pathname.slice("/supabase/rest/v1".length);
      target.search = url.search;
      return proxy(req, res, target);
    }
    if (url.pathname === "/staging/chat") return proxy(req, res, new URL("http://n8n:5678/webhook/schedule-staging-chat"));
    // Fixed staging-only target; never dial a URL supplied by a browser/model.
    if (process.env.SCHEDULE_ENVIRONMENT === 'staging' &&
        ['/local-odysseus/api/schedule/capabilities','/local-odysseus/api/schedule/chat'].includes(url.pathname)) {
      return proxy(req,res,new URL('http://odysseus-local:7000'+url.pathname.slice('/local-odysseus'.length)));
    }
    const area = url.pathname.match(/^\/api\/(my-plan|schedule|calendar-sync)\/[^/]+$/);
    if (area) return await api(req, res, routers[area[1]], url);
    if (url.pathname.startsWith("/api/")) return json(res, 404, { ok: false, error: "NOT_FOUND" });
    if (req.method !== "GET" && req.method !== "HEAD") return json(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
    const filename = path.resolve(root, "." + decodeURIComponent(url.pathname));
    if (filename !== root && !filename.startsWith(root + path.sep)) return json(res, 404, { ok: false });
    const file = fs.existsSync(filename) && fs.statSync(filename).isFile() ? filename : path.join(root, "index.html");
    res.setHeader("Content-Type", types[path.extname(file)] || "application/octet-stream");
    if (file.endsWith("index.html")) {
      res.setHeader("Cache-Control", "no-store");
      const html = fs.readFileSync(file, "utf8").replace("<body>", '<body><div style="background:#713f12;color:white;text-align:center;padding:6px;font:14px sans-serif">Środowisko testowe — osobna baza danych</div>');
      return res.end(req.method === "HEAD" ? "" : html);
    }
    if (req.method === "HEAD") return res.end();
    pipeline(fs.createReadStream(file), res, () => {});
  } catch { if (!res.headersSent) json(res, 500, { ok: false, error: "STAGING_REQUEST_FAILED" }); else res.destroy(); }
});
server.listen(Number(process.env.PORT) || 3100, "0.0.0.0", () => console.log("Local staging application listening"));
