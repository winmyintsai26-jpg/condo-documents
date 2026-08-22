import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { hash } from "bcryptjs";
import login from "../netlify/functions/auth-login";
import logout from "../netlify/functions/auth-logout";
import session from "../netlify/functions/auth-session";
import { resetRateLimitsForTests } from "../netlify/functions/_shared/rate-limit";

const origin = "http://localhost:8888";
beforeEach(async () => {
  process.env.ADMIN_USERNAME = "test-admin";
  process.env.ADMIN_PASSWORD_HASH = await hash("correct-test-password", 4);
  process.env.SESSION_SECRET = "test-session-secret-that-is-longer-than-thirty-two-characters";
  process.env.ALLOWED_ORIGINS = origin;
  process.env.CONTEXT = "dev";
  resetRateLimitsForTests();
});
function loginRequest(password: string, username = "test-admin") { return new Request(`${origin}/api/auth/login`, { method: "POST", headers: { origin, "content-type": "application/json", "x-forwarded-for": "127.0.0.1" }, body: JSON.stringify({ username, password }) }); }

test("invalid credentials return a generic error", async () => {
  const response = await login(loginRequest("wrong-password"));
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { message: "Invalid username or password." });
});

test("valid login creates a session that survives a new request", async () => {
  const loginResponse = await login(loginRequest("correct-test-password"));
  assert.equal(loginResponse.status, 200);
  const setCookie = loginResponse.headers.get("set-cookie");
  assert.match(setCookie ?? "", /HttpOnly/); assert.match(setCookie ?? "", /SameSite=Strict/);
  const cookie = setCookie?.split(";")[0] ?? "";
  const sessionResponse = await session(new Request(`${origin}/api/auth/session`, { headers: { cookie } }));
  assert.deepEqual(await sessionResponse.json(), { authenticated: true });
});

test("logout clears the session cookie", async () => {
  const response = await logout(new Request(`${origin}/api/auth/logout`, { method: "POST", headers: { origin } }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie") ?? "", /Max-Age=0/);
});

test("cross-origin login is rejected", async () => {
  const request = loginRequest("correct-test-password");
  request.headers.set("origin", "https://attacker.example");
  assert.equal((await login(request)).status, 403);
});
