import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "condo_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();
const dummyHash = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.3cW5B8xj2PNJ5nJvS4eY8GQ5zQ0rZ4K";

function required(name: "ADMIN_USERNAME" | "ADMIN_PASSWORD_HASH" | "SESSION_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server configuration: ${name}`);
  return value;
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function verifyCredentials(username: string, password: string) {
  const expectedUsername = required("ADMIN_USERNAME");
  const passwordHash = required("ADMIN_PASSWORD_HASH");
  const usernameMatches = safeEqual(username, expectedUsername);
  const passwordMatches = await compare(password, usernameMatches ? passwordHash : dummyHash);
  return usernameMatches && passwordMatches;
}

export async function createSessionToken() {
  const secret = required("SESSION_SECRET");
  if (secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject("single-admin").setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(encoder.encode(secret));
}

export async function isAuthenticated(request: Request) {
  const token = getCookie(request, SESSION_COOKIE); if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, encoder.encode(required("SESSION_SECRET")), { algorithms: ["HS256"], subject: "single-admin" });
    return payload.role === "admin";
  } catch { return false; }
}

export async function requireAdminMutation(request: Request) {
  if (!assertSameOrigin(request)) return json({ message: "Request could not be verified." }, 403);
  if (!(await isAuthenticated(request))) return json({ message: "Authentication required." }, 401);
  return null;
}

export function sessionCookie(token: string) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${process.env.CONTEXT === "production" ? "; Secure" : ""}`;
}
export function clearSessionCookie() { return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.CONTEXT === "production" ? "; Secure" : ""}`; }
export function getCookie(request: Request, name: string) { const cookies = request.headers.get("cookie") ?? ""; return cookies.split(";").map(value => value.trim()).find(value => value.startsWith(`${name}=`))?.slice(name.length + 1) ?? null; }

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin"); if (!origin) return false;
  const requestOrigin = new URL(request.url).origin;
  const configured = (process.env.ALLOWED_ORIGINS ?? "").split(",").map(value => value.trim()).filter(Boolean);
  return origin === requestOrigin || configured.includes(origin);
}

export function json(body: unknown, status = 200, headers: HeadersInit = {}) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
}
