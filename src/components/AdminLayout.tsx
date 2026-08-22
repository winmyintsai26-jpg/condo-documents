import { FileText, LogOut, PanelLeft, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PropertyMark } from "./PropertyMark";
import { siteConfig } from "../config/site";
export function AdminLayout() { const [open, setOpen] = useState(false); const { logout } = useAuth(); const navigate = useNavigate(); const signOut = async () => { await logout(); navigate("/admin/login", { replace: true }); }; return <div className="admin-shell"><aside className={open ? "admin-sidebar open" : "admin-sidebar"}><div className="admin-brand"><PropertyMark /><div><strong>{siteConfig.propertyName}</strong><span>Administration</span></div><button onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button></div><nav><NavLink to="/admin/documents" onClick={() => setOpen(false)}><FileText size={19} />Documents</NavLink></nav><div className="admin-sidebar-footer"><Link to="/">View Public Site</Link><button type="button" onClick={signOut}><LogOut size={18} />Logout</button></div></aside><div className="admin-workspace"><header className="admin-topbar"><button type="button" onClick={() => setOpen(true)} aria-label="Open navigation"><PanelLeft /></button><span>Administration</span><Link to="/">View Public Site</Link></header><Outlet /></div></div>; }
