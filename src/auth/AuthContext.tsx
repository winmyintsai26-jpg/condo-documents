import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
type Status = "checking" | "authenticated" | "unauthenticated";
type AuthContextValue = { status: Status; login: (username: string, password: string) => Promise<void>; logout: () => Promise<void>; };
const AuthContext = createContext<AuthContextValue | null>(null);
async function api(path: string, init?: RequestInit) { const response = await fetch(path, { credentials: "include", headers: { "content-type": "application/json", ...init?.headers }, ...init }); const data = await response.json().catch(() => ({})) as { authenticated?: boolean; message?: string }; if (!response.ok) throw new Error(data.message ?? "The administration service is unavailable."); return data; }
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  useEffect(() => { let active = true; void api("/api/auth/session").then(data => { if (active) setStatus(data.authenticated ? "authenticated" : "unauthenticated"); }, () => { if (active) setStatus("unauthenticated"); }); return () => { active = false; }; }, []);
  const login = useCallback(async (username: string, password: string) => { await api("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }); setStatus("authenticated"); }, []);
  const logout = useCallback(async () => { await api("/api/auth/logout", { method: "POST", body: "{}" }); setStatus("unauthenticated"); }, []);
  const value = useMemo(() => ({ status, login, logout }), [status, login, logout]); return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
