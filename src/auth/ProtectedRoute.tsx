import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
export function ProtectedRoute() { const { status } = useAuth(); const location = useLocation(); if (status === "checking") return <main className="auth-loading"><span className="loading-ring" /><p>Checking secure session…</p></main>; if (status === "unauthenticated") return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />; return <Outlet />; }
