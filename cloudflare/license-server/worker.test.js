import assert from "node:assert/strict";
import test from "node:test";
import worker from "./worker.js";

const ADMIN_TOKEN = "test-admin-token-with-at-least-32-characters";

class MemoryD1 {
  constructor() {
    this.licenses = new Map();
  }

  prepare(sql) {
    return {
      bind: (...values) => ({
        first: async () => {
          const license = this.licenses.get(values[0]);
          return license ? { status: license.status, device_id: license.deviceId } : null;
        },
        run: async () => this.run(sql, values)
      })
    };
  }

  run(sql, values) {
    if (sql.startsWith("INSERT INTO licenses")) {
      const [keyHash, createdAt] = values;
      this.licenses.set(keyHash, { status: "active", createdAt, deviceId: null, activatedAt: null });
      return { meta: { changes: 1 } };
    }

    if (sql.startsWith("UPDATE licenses SET device_id = ?, activated_at")) {
      const [deviceId, now, keyHash, allowedDeviceId] = values;
      const license = this.licenses.get(keyHash);
      if (!license || license.status !== "active" || (license.deviceId && license.deviceId !== allowedDeviceId)) {
        return { meta: { changes: 0 } };
      }
      license.deviceId = deviceId;
      license.activatedAt = license.activatedAt || now;
      return { meta: { changes: 1 } };
    }

    if (sql.startsWith("UPDATE licenses SET device_id = NULL")) {
      const license = this.licenses.get(values[0]);
      if (!license || license.status !== "active") return { meta: { changes: 0 } };
      license.deviceId = null;
      license.activatedAt = null;
      return { meta: { changes: 1 } };
    }

    if (sql.startsWith("UPDATE licenses SET status = 'revoked'")) {
      const license = this.licenses.get(values[0]);
      if (!license || license.status !== "active") return { meta: { changes: 0 } };
      license.status = "revoked";
      return { meta: { changes: 1 } };
    }

    throw new Error(`Unexpected SQL in test: ${sql}`);
  }
}

function makeEnv() {
  return { DB: new MemoryD1(), ADMIN_API_TOKEN: ADMIN_TOKEN };
}

function makeRequest(path, { method = "POST", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return new Request(`https://license.example${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
}

async function json(response) {
  return response.json();
}

test("creates a license only for an authenticated admin", async () => {
  const env = makeEnv();
  const unauthorized = await worker.fetch(makeRequest("/admin/licenses"), env);
  assert.equal(unauthorized.status, 401);

  const created = await worker.fetch(makeRequest("/admin/licenses", { token: ADMIN_TOKEN }), env);
  const body = await json(created);
  assert.equal(created.status, 201);
  assert.match(body.licenseKey, /^SK-(?:[A-F0-9]{8}-){7}[A-F0-9]{8}$/);
  assert.equal(env.DB.licenses.size, 1);
});

test("enforces one installation and permits reset and reactivation", async () => {
  const env = makeEnv();
  const created = await worker.fetch(makeRequest("/admin/licenses", { token: ADMIN_TOKEN }), env);
  const { licenseKey } = await json(created);
  const first = { licenseKey, deviceId: "installation-device-id-0001" };

  assert.equal((await worker.fetch(makeRequest("/api/activate", { body: first }), env)).status, 200);
  assert.equal((await worker.fetch(makeRequest("/api/verify", { body: first }), env)).status, 200);
  assert.equal((await worker.fetch(makeRequest("/api/verify", {
    body: { licenseKey: licenseKey.toLowerCase(), deviceId: first.deviceId }
  }), env)).status, 200);
  assert.equal((await worker.fetch(makeRequest("/api/activate", {
    body: { licenseKey, deviceId: "different-installation-id-0002" }
  }), env)).status, 403);

  assert.equal((await worker.fetch(makeRequest("/admin/reset-device", {
    token: ADMIN_TOKEN,
    body: { licenseKey }
  }), env)).status, 200);
  assert.equal((await worker.fetch(makeRequest("/api/activate", {
    body: { licenseKey, deviceId: "different-installation-id-0002" }
  }), env)).status, 200);
});

test("revoked licenses cannot be verified or activated", async () => {
  const env = makeEnv();
  const created = await worker.fetch(makeRequest("/admin/licenses", { token: ADMIN_TOKEN }), env);
  const { licenseKey } = await json(created);
  const credentials = { licenseKey, deviceId: "installation-device-id-0001" };

  assert.equal((await worker.fetch(makeRequest("/api/activate", { body: credentials }), env)).status, 200);
  assert.equal((await worker.fetch(makeRequest("/admin/revoke", {
    token: ADMIN_TOKEN,
    body: { licenseKey }
  }), env)).status, 200);
  assert.equal((await worker.fetch(makeRequest("/api/verify", { body: credentials }), env)).status, 403);
  assert.equal((await worker.fetch(makeRequest("/api/activate", { body: credentials }), env)).status, 403);
});

test("responds to preflight requests with CORS headers", async () => {
  const response = await worker.fetch(makeRequest("/api/activate", { method: "OPTIONS" }), makeEnv());
  assert.equal(response.status, 204);
  assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
});
