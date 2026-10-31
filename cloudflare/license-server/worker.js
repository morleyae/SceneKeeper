const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Max-Age": "86400"
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function constantTimeEqual(left, right) {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  let difference = a.length ^ b.length;
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (a[index] || 0) ^ (b[index] || 0);
  }

  return difference === 0;
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function licenseHash(value) {
  return sha256(value.trim().toUpperCase());
}

async function parseJson(request) {
  if (!(request.headers.get("Content-Type") || "").toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return await request.json();
  } catch (error) {
    return null;
  }
}

function validLicenseKey(value) {
  return typeof value === "string" && value.length >= 20 && value.length <= 128;
}

function validDeviceId(value) {
  return typeof value === "string" && value.length >= 16 && value.length <= 128;
}

function isAdminAuthorized(request, env) {
  const expected = env.ADMIN_API_TOKEN;
  const authorization = request.headers.get("Authorization") || "";

  if (!expected || expected.length < 32 || !authorization.startsWith("Bearer ")) {
    return false;
  }

  return constantTimeEqual(authorization.slice("Bearer ".length), expected);
}

function makeLicenseKey() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `SK-${hex.match(/.{1,8}/g).join("-")}`;
}

async function handleActivation(request, env) {
  const body = await parseJson(request);
  if (!body || !validLicenseKey(body.licenseKey) || !validDeviceId(body.deviceId)) {
    return jsonResponse({ error: "Provide a valid licenseKey and deviceId." }, 400);
  }

  const keyHash = await licenseHash(body.licenseKey);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(
    "UPDATE licenses SET device_id = ?, activated_at = COALESCE(activated_at, ?) " +
    "WHERE key_hash = ? AND status = 'active' AND (device_id IS NULL OR device_id = ?)"
  ).bind(body.deviceId, now, keyHash, body.deviceId).run();

  if (!result.meta || result.meta.changes !== 1) {
    return jsonResponse({ error: "This license is invalid, revoked, or already activated on another device." }, 403);
  }

  return jsonResponse({ valid: true, checkedAt: Date.now() });
}

async function handleVerification(request, env) {
  const body = await parseJson(request);
  if (!body || !validLicenseKey(body.licenseKey) || !validDeviceId(body.deviceId)) {
    return jsonResponse({ error: "Provide a valid licenseKey and deviceId." }, 400);
  }

  const keyHash = await licenseHash(body.licenseKey);
  const license = await env.DB.prepare(
    "SELECT status, device_id FROM licenses WHERE key_hash = ?"
  ).bind(keyHash).first();

  if (!license || license.status !== "active" || license.device_id !== body.deviceId) {
    return jsonResponse({ error: "This license is invalid, revoked, or activated on another device." }, 403);
  }

  return jsonResponse({ valid: true, checkedAt: Date.now() });
}

async function handleAdminRequest(request, env, pathname) {
  if (!isAdminAuthorized(request, env)) {
    return jsonResponse({ error: "Unauthorized." }, 401);
  }

  if (pathname === "/admin/licenses" && request.method === "POST") {
    const licenseKey = makeLicenseKey();
    await env.DB.prepare(
      "INSERT INTO licenses (key_hash, status, created_at) VALUES (?, 'active', ?)"
    ).bind(await licenseHash(licenseKey), new Date().toISOString()).run();

    return jsonResponse({ licenseKey }, 201);
  }

  const body = await parseJson(request);
  if (!body || !validLicenseKey(body.licenseKey)) {
    return jsonResponse({ error: "Provide a valid licenseKey." }, 400);
  }

  const keyHash = await licenseHash(body.licenseKey);
  if (pathname === "/admin/reset-device" && request.method === "POST") {
    const result = await env.DB.prepare(
      "UPDATE licenses SET device_id = NULL, activated_at = NULL WHERE key_hash = ? AND status = 'active'"
    ).bind(keyHash).run();
    return result.meta && result.meta.changes === 1
      ? jsonResponse({ reset: true })
      : jsonResponse({ error: "Active license not found." }, 404);
  }

  if (pathname === "/admin/revoke" && request.method === "POST") {
    const result = await env.DB.prepare(
      "UPDATE licenses SET status = 'revoked' WHERE key_hash = ? AND status = 'active'"
    ).bind(keyHash).run();
    return result.meta && result.meta.changes === 1
      ? jsonResponse({ revoked: true })
      : jsonResponse({ error: "Active license not found." }, 404);
  }

  return jsonResponse({ error: "Not found." }, 404);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);
    if (pathname === "/health" && request.method === "GET") {
      return jsonResponse({ ok: true });
    }
    if (pathname === "/api/activate" && request.method === "POST") {
      return handleActivation(request, env);
    }
    if (pathname === "/api/verify" && request.method === "POST") {
      return handleVerification(request, env);
    }
    if (pathname.startsWith("/admin/")) {
      return handleAdminRequest(request, env, pathname);
    }

    return jsonResponse({ error: "Not found." }, 404);
  }
};
