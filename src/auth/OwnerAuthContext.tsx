import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type Status = "checking" | "authenticated" | "unauthenticated";
type OwnerAuthContextValue = { status: Status; login: (username: string, password: string) => Promise<void>; logout: () => Promise<void> };
const OwnerAuthContext = createContext<OwnerAuthContextValue | null>(null);

async function ownerAuthApi(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "include", headers: { "content-type": "application/json", ...init?.headers }, ...init });
  const isJson = response.headers.get("content-type")?.toLowerCase().includes("application/json");
  if (!isJson) throw new Error("The owner service returned an unexpected response.");
  const data = await response.json().catch(() => ({})) as { authenticated?: boolean; message?: string };
  if (!response.ok) throw new Error(data.message ?? "The owner service is unavailable.");
  return data;
}

export function OwnerAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  useEffect(() => {
    let active = true;
    void ownerAuthApi("/api/auth/owner/session").then(
      data => { if (active) setStatus(data.authenticated ? "authenticated" : "unauthenticated"); },
      () => { if (active) setStatus("unauthenticated"); },
    );
    return () => { active = false; };
  }, []);
  const login = useCallback(async (username: string, password: string) => {
    await ownerAuthApi("/api/auth/owner/login", { method: "POST", body: JSON.stringify({ username, password }) });
    setStatus("authenticated");
  }, []);
  const logout = useCallback(async () => {
    await ownerAuthApi("/api/auth/owner/logout", { method: "POST", body: "{}" });
    setStatus("unauthenticated");
  }, []);
  const value = useMemo(() => ({ status, login, logout }), [status, login, logout]);
  return <OwnerAuthContext.Provider value={value}>{children}</OwnerAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOwnerAuth() {
  const value = useContext(OwnerAuthContext);
  if (!value) throw new Error("useOwnerAuth must be used inside OwnerAuthProvider");
  return value;
}
