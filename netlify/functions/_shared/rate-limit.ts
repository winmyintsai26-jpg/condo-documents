type Attempt = { failures: number; resetAt: number };
const attempts = new Map<string, Attempt>(); const WINDOW_MS = 15 * 60 * 1000; const MAX_FAILURES = 5;
export function clientKey(request: Request) { return request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; }
export function isRateLimited(key: string, now = Date.now()) { const entry = attempts.get(key); if (!entry || entry.resetAt <= now) { attempts.delete(key); return false; } return entry.failures >= MAX_FAILURES; }
export function recordFailure(key: string, now = Date.now()) { const current = attempts.get(key); if (!current || current.resetAt <= now) attempts.set(key, { failures: 1, resetAt: now + WINDOW_MS }); else current.failures += 1; }
export function clearFailures(key: string) { attempts.delete(key); }
export function resetRateLimitsForTests() { attempts.clear(); }
