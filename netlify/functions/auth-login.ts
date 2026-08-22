import { assertSameOrigin, createSessionToken, json, sessionCookie, verifyCredentials } from "./_shared/auth";
import { clearFailures, clientKey, isRateLimited, recordFailure } from "./_shared/rate-limit";
export default async (request: Request) => {
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405, { allow: "POST" });
  if (!assertSameOrigin(request)) return json({ message: "Request could not be verified." }, 403);
  const key = clientKey(request); if (isRateLimited(key)) return json({ message: "Too many login attempts. Please try again later." }, 429);
  let body: unknown; try { body = await request.json(); } catch { return json({ message: "Invalid username or password." }, 400); }
  const { username, password } = (body ?? {}) as Record<string, unknown>;
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password || username.length > 128 || password.length > 256) return json({ message: "Invalid username or password." }, 400);
  try {
    if (!(await verifyCredentials(username.trim(), password))) { recordFailure(key); return json({ message: "Invalid username or password." }, 401); }
    clearFailures(key); const token = await createSessionToken(); return json({ authenticated: true }, 200, { "set-cookie": sessionCookie(token) });
  } catch (error) { console.error("Authentication configuration error", error instanceof Error ? error.message : "unknown"); return json({ message: "The administration service is temporarily unavailable." }, 503); }
};
