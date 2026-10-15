"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");

test("authenticated add includes the schedule_name required by the schema", async () => {
  let inserted;
  const query = (result) => ({
    select() { return this; }, eq() { return this; },
    async maybeSingle() { return { data: result }; },
    insert(row) { inserted = row; return this; },
    async single() { return { data: { id: "synthetic-added", ...inserted } }; },
  });
  const client = { from: (table) => table === "events"
    ? query({ id: "synthetic-event", faculty: "TEST", status: "aktywne" }) : query(null) };
  const mocks = {
    "../_lib/requestAuth": { verifyRequestUser: async () => ({ uid: "synthetic-user" }) },
    "../_lib/users": { resolveUserIdByFirebaseUid: async () => "synthetic-user-uuid" },
    "../_lib/supabaseAdmin": { getSupabaseAdminClient: () => client },
  };
  for (const [name, exports] of Object.entries(mocks)) {
    const id = require.resolve(name);
    require.cache[id] = { id, filename: id, loaded: true, exports };
  }
  const handler = require("./add-event.js");
  const response = { statusCode: 200, setHeader() {}, status(value) { this.statusCode = value; return this; },
    json(value) { this.body = value; } };
  await handler({ method: "POST", body: { event_id: "synthetic-event", scheduleName: "TEST" } }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.ok, true);
  assert.equal(inserted.schedule_name, "TEST");
  assert.equal(inserted.user_id, "synthetic-user-uuid");
});
