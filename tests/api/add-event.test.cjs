const { test, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");

let calls, authError, rpcResult;
function stub(relative, exports) {
  const filename = require.resolve(path.join(__dirname, "../../api", relative));
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
}
stub("_lib/requestAuth", { verifyRequestUser: async () => {
  if (authError) throw authError;
  return { uid: "verified-user" };
} });
stub("_lib/supabaseAdmin", { getSupabaseAdminClient: () => ({ rpc: async (...args) => {
  calls.push(args); return rpcResult;
} }) });
stub("_lib/http", { setCors: () => {}, respond: (res, status, body) => Object.assign(res, { statusCode: status, body }) });
const handler = require("../../api/my-plan/add-event");
const request = { method: "POST", body: {
  event_id: "00000000-0000-0000-0000-000000000001", scheduleName: "A", firebase_uid: "spoofed-user",
} };
beforeEach(() => {
  calls = []; authError = null;
  rpcResult = { data: { ok: true, already_added: false, added_event: { id: "added" } } };
});

test("one RPC uses only the verified identity", async () => {
  const res = {};
  await handler(request, res);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(calls, [["add_my_plan_event", {
    p_firebase_uid: "verified-user", p_event_id: request.body.event_id, p_schedule_name: "A", p_reason: "makeup",
  }]]);
});
test("unauthorized and invalid requests never access the database", async () => {
  authError = Object.assign(new Error("No token"), { statusCode: 401 });
  const unauthorized = {};
  await handler(request, unauthorized);
  assert.equal(unauthorized.statusCode, 401);
  authError = null;
  const invalid = {};
  await handler({ ...request, body: { ...request.body, event_id: "invalid" } }, invalid);
  assert.equal(invalid.statusCode, 400);
  assert.equal(calls.length, 0);
});
test("preserves validation and idempotent responses from SQL", async () => {
  const mismatch = {};
  rpcResult = { data: { ok: false, status_code: 400, error: "EVENT_SCHEDULE_MISMATCH" } };
  await handler(request, mismatch);
  assert.equal(mismatch.statusCode, 400);
  assert.equal(mismatch.body.error, "EVENT_SCHEDULE_MISMATCH");
  const duplicate = {};
  rpcResult = { data: { ok: true, already_added: true, added_event: { id: "existing" } } };
  await handler(request, duplicate);
  assert.equal(duplicate.body.already_added, true);
});
test("a missing migration fails without exposing database error details", async () => {
  rpcResult = { error: { code: "PGRST202", message: "internal schema details" } };
  const res = {};
  await handler(request, res);
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.error, "ADD_EVENT_FAILED");
  assert.equal(JSON.stringify(res).includes("internal schema"), false);
});
