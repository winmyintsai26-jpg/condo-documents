import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import adminCategories from "../netlify/functions/admin-categories";
import adminCategory from "../netlify/functions/admin-category";
import adminDocument from "../netlify/functions/admin-document";
import adminDocumentReplace from "../netlify/functions/admin-document-replace";
import adminDocuments from "../netlify/functions/admin-documents";
import adminLogin from "../netlify/functions/auth-login";
import ownerLogin from "../netlify/functions/auth-owner-login";
import ownerLogout from "../netlify/functions/auth-owner-logout";
import ownerSession from "../netlify/functions/auth-owner-session";
import { createOwnerSessionToken, createSessionToken, OWNER_SESSION_COOKIE, SESSION_COOKIE } from "../netlify/functions/_shared/auth";
import { resetRateLimitsForTests } from "../netlify/functions/_shared/rate-limit";

const origin = "http://localhost:8888";
const secret = "test-session-secret-that-is-longer-than-thirty-two-characters";
const encoder = new TextEncoder();

beforeEach(async () => {
  process.env.ADMIN_USERNAME = "test-admin";
  process.env.ADMIN_PASSWORD_HASH = await hash("correct-admin-test-password", 4);
  process.env.OWNER_USERNAME = "test-owner";
  process.env.OWNER_PASSWORD_HASH = await hash("correct-owner-test-password", 4);
  process.env.SESSION_SECRET = secret;
  process.env.ALLOWED_ORIGINS = origin;
  process.env.CONTEXT = "dev";
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  resetRateLimitsForTests();
});

function loginRequest(password: string, username = "test-owner", ip = "127.0.0.1") {
  return new Request(`${origin}/api/auth/owner/login`, { method: "POST", headers: { origin, "content-type": "application/json", "x-forwarded-for": ip }, body: JSON.stringify({ username, password }) });
}

test("correct owner credentials create an isolated owner session", async () => {
  const response = await ownerLogin(loginRequest("correct-owner-test-password"));
  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.match(setCookie, /^condo_owner_session=/);
  assert.match(setCookie, /HttpOnly/);
  assert.match(setCookie, /SameSite=Strict/);
  assert.match(setCookie, /Max-Age=28800/);
  const token = setCookie.split(";")[0].slice(`${OWNER_SESSION_COOKIE}=`.length);
  const { payload } = await jwtVerify(token, encoder.encode(secret), { algorithms: ["HS256"], subject: "shared-owner" });
  assert.equal(payload.role, "owner");
  assert.equal(payload.sub, "shared-owner");
});

test("owner session cookie is Secure in production", async () => {
  process.env.CONTEXT = "production";
  const response = await ownerLogin(loginRequest("correct-owner-test-password"));
  assert.match(response.headers.get("set-cookie") ?? "", /; Secure/);
});

test("incorrect owner credentials return a generic 401", async () => {
  const response = await ownerLogin(loginRequest("incorrect-owner-test-password"));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Invalid username or password." });
});

test("owner session restores from its cookie and rejects an admin cookie", async () => {
  const ownerToken = await createOwnerSessionToken();
  const restored = await ownerSession(new Request(`${origin}/api/auth/owner/session`, { headers: { cookie: `${OWNER_SESSION_COOKIE}=${ownerToken}` } }));
  assert.deepEqual(await restored.json(), { authenticated: true });
  const adminToken = await createSessionToken();
  const rejected = await ownerSession(new Request(`${origin}/api/auth/owner/session`, { headers: { cookie: `${SESSION_COOKIE}=${adminToken}` } }));
  assert.deepEqual(await rejected.json(), { authenticated: false });
});

test("owner logout clears only the owner cookie", async () => {
  const response = await ownerLogout(new Request(`${origin}/api/auth/owner/logout`, { method: "POST", headers: { origin, cookie: `${SESSION_COOKIE}=admin-value; ${OWNER_SESSION_COOKIE}=owner-value` } }));
  assert.equal(response.status, 200);
  const setCookie = response.headers.get("set-cookie") ?? "";
  assert.match(setCookie, /^condo_owner_session=/);
  assert.match(setCookie, /Max-Age=0/);
  assert.doesNotMatch(setCookie, /condo_admin_session/);
});

test("owner and admin login rate limits are independent", async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) assert.equal((await ownerLogin(loginRequest("wrong-owner-password"))).status, 401);
  assert.equal((await ownerLogin(loginRequest("correct-owner-test-password"))).status, 429);
  const adminResponse = await adminLogin(new Request(`${origin}/api/auth/login`, { method: "POST", headers: { origin, "content-type": "application/json", "x-forwarded-for": "127.0.0.1" }, body: JSON.stringify({ username: "test-admin", password: "correct-admin-test-password" }) }));
  assert.equal(adminResponse.status, 200);
});

test("owner and admin cookies coexist and retain strict role separation", async () => {
  const ownerToken = await createOwnerSessionToken();
  const adminToken = await createSessionToken();
  const cookies = `${SESSION_COOKIE}=${adminToken}; ${OWNER_SESSION_COOKIE}=${ownerToken}`;
  const ownerResponse = await ownerSession(new Request(`${origin}/api/auth/owner/session`, { headers: { cookie: cookies } }));
  assert.deepEqual(await ownerResponse.json(), { authenticated: true });
});

test("tampered and expired owner tokens are rejected", async () => {
  const valid = await createOwnerSessionToken();
  const tampered = `${valid.slice(0, -1)}${valid.endsWith("a") ? "b" : "a"}`;
  const tamperedResponse = await ownerSession(new Request(`${origin}/api/auth/owner/session`, { headers: { cookie: `${OWNER_SESSION_COOKIE}=${tampered}` } }));
  assert.deepEqual(await tamperedResponse.json(), { authenticated: false });
  const expired = await new SignJWT({ role: "owner" }).setProtectedHeader({ alg: "HS256" }).setSubject("shared-owner").setIssuedAt(1).setExpirationTime(2).sign(encoder.encode(secret));
  const expiredResponse = await ownerSession(new Request(`${origin}/api/auth/owner/session`, { headers: { cookie: `${OWNER_SESSION_COOKIE}=${expired}` } }));
  assert.deepEqual(await expiredResponse.json(), { authenticated: false });
});

test("a valid owner cookie cannot access admin document or category APIs", async () => {
  const ownerToken = await createOwnerSessionToken();
  const headers = { origin, cookie: `${OWNER_SESSION_COOKIE}=${ownerToken}`, "content-type": "application/json" };
  const responses = await Promise.all([
    adminDocuments(new Request(`${origin}/api/admin/documents`, { headers })),
    adminDocuments(new Request(`${origin}/api/admin/documents`, { method: "POST", headers, body: new FormData() })),
    adminDocument(new Request(`${origin}/api/admin/document?id=document-1`, { method: "PATCH", headers, body: "{}" })),
    adminDocument(new Request(`${origin}/api/admin/document?id=document-1`, { method: "DELETE", headers })),
    adminDocumentReplace(new Request(`${origin}/api/admin/document/replace?id=document-1`, { method: "POST", headers, body: new FormData() })),
    adminCategories(new Request(`${origin}/api/admin/categories`, { headers })),
    adminCategories(new Request(`${origin}/api/admin/categories`, { method: "POST", headers, body: "{}" })),
    adminCategory(new Request(`${origin}/api/admin/category?id=category-1`, { method: "PATCH", headers, body: "{}" })),
    adminCategory(new Request(`${origin}/api/admin/category?id=category-1`, { method: "DELETE", headers })),
  ]);
  assert.deepEqual(responses.map(response => response.status), [401, 401, 401, 401, 401, 401, 401, 401, 401]);
});
