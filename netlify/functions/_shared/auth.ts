import { compare } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "condo_admin_session";
export const OWNER_SESSION_COOKIE = "condo_owner_session";
const SESSION_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();
const dummyHash = "$2b$12$C6UzMDM.H6dfI/f/IKcEe.3cW5B8xj2PNJ5nJvS4eY8GQ5zQ0rZ4K";

type SessionRole = "admin" | "owner";

const sessionConfig = {
  admin: { cookie: SESSION_COOKIE, subject: "single-admin", username: "ADMIN_USERNAME", passwordHash: "ADMIN_PASSWORD_HASH" },
  owner: { cookie: OWNER_SESSION_COOKIE, subject: "shared-owner", username: "OWNER_USERNAME", passwordHash: "OWNER_PASSWORD_HASH" },
} as const;

function required(name: "ADMIN_USERNAME" | "ADMIN_PASSWORD_HASH" | "OWNER_USERNAME" | "OWNER_PASSWORD_HASH" | "SESSION_SECRET") {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server configuration: ${name}`);
  return value.trim();
}

export function isValidBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value.trim());
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function verifyRoleCredentials(role: SessionRole, username: string, password: string) {
  const config = sessionConfig[role];
  const expectedUsername = required(config.username);
  const passwordHash = required(config.passwordHash);
  if (!isValidBcryptHash(passwordHash)) throw new Error(`${config.passwordHash} is not a valid bcrypt hash`);
  const usernameMatches = safeEqual(username, expectedUsername);
  const passwordMatches = await compare(password, usernameMatches ? passwordHash : dummyHash);
  return usernameMatches && passwordMatches;
}

export const verifyCredentials = (username: string, password: string) => verifyRoleCredentials("admin", username, password);

export async function createRoleSessionToken(role: SessionRole) {
  const secret = required("SESSION_SECRET");
  if (secret.length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters");
  return new SignJWT({ role }).setProtectedHeader({ alg: "HS256" }).setSubject(sessionConfig[role].subject).setIssuedAt().setExpirationTime(`${SESSION_SECONDS}s`).sign(encoder.encode(secret));
}

export const createSessionToken = () => createRoleSessionToken("admin");
export const createOwnerSessionToken = () => createRoleSessionToken("owner");

export async function isRoleAuthenticated(request: Request, role: SessionRole) {
  const config = sessionConfig[role];
  const token = getCookie(request, config.cookie); if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, encoder.encode(required("SESSION_SECRET")), { algorithms: ["HS256"], subject: config.subject });
    return payload.role === role;
  } catch { return false; }
}

export const isAuthenticated = (request: Request) => isRoleAuthenticated(request, "admin");
export const isOwnerAuthenticated = (request: Request) => isRoleAuthenticated(request, "owner");

export async function requireAdminMutation(request: Request) {
  if (!assertSameOrigin(request)) return json({ message: "Request could not be verified." }, 403);
  if (!(await isAuthenticated(request))) return json({ message: "Authentication required." }, 401);
  return null;
}

function roleSessionCookie(role: SessionRole, token: string) {
  return `${sessionConfig[role].cookie}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_SECONDS}${process.env.CONTEXT === "production" ? "; Secure" : ""}`;
}
function clearRoleSessionCookie(role: SessionRole) { return `${sessionConfig[role].cookie}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${process.env.CONTEXT === "production" ? "; Secure" : ""}`; }
export const sessionCookie = (token: string) => roleSessionCookie("admin", token);
export const ownerSessionCookie = (token: string) => roleSessionCookie("owner", token);
export const clearSessionCookie = () => clearRoleSessionCookie("admin");
export const clearOwnerSessionCookie = () => clearRoleSessionCookie("owner");
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
