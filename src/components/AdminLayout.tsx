import { FileText, FolderOpen, LogOut, PanelLeft, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { siteConfig } from "../config/site";
import { PropertyMark } from "./PropertyMark";

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    setLogoutError("");
    try {
      await logout();
      navigate("/admin/login", { replace: true });
    } catch {
      setLogoutError("Logout could not be completed. Please try again.");
    }
  };

  return <div className="admin-shell">
    <aside id="admin-navigation" className={open ? "admin-sidebar open" : "admin-sidebar"}>
      <div className="admin-brand">
        <PropertyMark />
        <div><strong>{siteConfig.propertyName}</strong><span>Administration</span></div>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button>
      </div>
      <nav aria-label="Admin navigation">
        <NavLink to="documents" onClick={() => setOpen(false)}><FileText size={19} aria-hidden="true" />Documents</NavLink>
        <NavLink to="categories" onClick={() => setOpen(false)}><FolderOpen size={19} aria-hidden="true" />Categories</NavLink>
      </nav>
      <div className="admin-sidebar-footer">
        {logoutError && <p className="admin-logout-error" role="alert">{logoutError}</p>}
        <Link to="/">View Public Site</Link>
        <button type="button" onClick={() => void signOut()}><LogOut size={18} aria-hidden="true" />Logout</button>
      </div>
    </aside>
    <div className="admin-workspace">
      <header className="admin-topbar">
        <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation" aria-controls="admin-navigation" aria-expanded={open}><PanelLeft /></button>
        <span>Administration</span><Link to="/">View Public Site</Link>
      </header>
      <Outlet />
    </div>
  </div>;
}
