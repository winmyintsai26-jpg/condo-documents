import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useOwnerAuth } from "./OwnerAuthContext";

export function OwnerProtectedRoute() {
  const { status } = useOwnerAuth();
  const location = useLocation();
  if (status === "checking") return <main className="auth-loading"><span className="loading-ring" /><p>Checking owner session…</p></main>;
  if (status === "unauthenticated") return <Navigate to="/owner/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
