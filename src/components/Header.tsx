"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { siteConfig } from "../config/site";
import { PropertyMark } from "./PropertyMark";
export function Header() {
  const [open, setOpen] = useState(false); const location = useLocation(); const close = () => setOpen(false);
  return <header className="site-header"><div className="shell header-inner">
    <Link className="brand" to={location.pathname === "/" ? "#top" : "/"} onClick={close} aria-label={`${siteConfig.propertyName} home`}><PropertyMark /><span>{siteConfig.propertyName}</span></Link>
    <button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="primary-navigation" aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
    <nav id="primary-navigation" className={open ? "nav-links nav-open" : "nav-links"} aria-label="Primary navigation"><Link to="/#documents" onClick={close}>Documents</Link><Link to="/#about" onClick={close}>About</Link><Link to="/#contact" onClick={close}>Contact</Link><Link className="admin-link" to="/admin" onClick={close}>Admin</Link></nav>
  </div></header>;
}
