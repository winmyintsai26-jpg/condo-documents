import { LogOut, RefreshCw, Search, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOwnerLibrary } from "../api/documents";
import { useOwnerAuth } from "../auth/OwnerAuthContext";
import { CategoryOverview } from "../components/CategoryOverview";
import { DocumentRow } from "../components/DocumentRow";
import { PropertyMark } from "../components/PropertyMark";
import { siteConfig } from "../config/site";
import type { LibraryResponse } from "../types/document";

export function OwnerLibraryPage() {
  const [library, setLibrary] = useState<LibraryResponse>({ categories: [], documents: [] });
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [logoutError, setLogoutError] = useState("");
  const { logout } = useOwnerAuth();
  const navigate = useNavigate();
  const load = () => {
    setStatus("loading");
    getOwnerLibrary().then(data => { setLibrary(data); setStatus("ready"); }).catch(() => setStatus("error"));
  };
  // Initial API synchronization.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(load, []);
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return library.documents.filter(item => (filter === "all" || item.categoryId === filter) && (!normalized || [item.title, item.category?.name, item.category?.shortName, String(item.year)].some(value => value?.toLowerCase().includes(normalized))));
  }, [filter, query, library.documents]);
  const signOut = async () => {
    setLogoutError("");
    try { await logout(); navigate("/owner/login", { replace: true }); }
    catch { setLogoutError("Logout could not be completed. Please try again."); }
  };
  return <div className="owner-shell">
    <header className="owner-header"><div className="shell owner-header-inner"><div className="owner-brand"><PropertyMark /><div><strong>{siteConfig.propertyName}</strong><span>Owner Portal</span></div></div><button type="button" onClick={() => void signOut()}><LogOut size={18} aria-hidden="true" />Logout</button></div></header>
    <main className="owner-library shell">
      <div className="owner-heading"><div><p className="eyebrow">Published association records</p><h1>Owner Document Library</h1><p>Search and open the association documents available to owners.</p></div><p>{library.documents.length} documents available</p></div>
      {logoutError && <div className="login-error" role="alert">{logoutError}</div>}
      {status === "loading" ? <div className="library-state" role="status"><span className="loading-ring" />Loading owner documents…</div> : status === "error" ? <div className="library-state" role="alert"><SearchX aria-hidden="true" /><h2>Documents unavailable</h2><p>Please try again in a moment.</p><button className="primary-button" onClick={load}><RefreshCw size={17} aria-hidden="true" />Retry</button></div> : <>
        <label className="search-field"><Search aria-hidden="true" size={21} /><span className="sr-only">Search owner documents</span><input type="search" placeholder="Search by title, category, or year..." value={query} onChange={event => setQuery(event.target.value)} /></label>
        <CategoryOverview categories={library.categories} documents={library.documents} onSelect={setFilter} />
        <div className="filter-bar" aria-label="Filter by category"><button type="button" aria-pressed={filter === "all"} className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All Documents</button>{library.categories.map(category => <button type="button" aria-pressed={filter === category.id} className={filter === category.id ? "active" : ""} onClick={() => setFilter(category.id)} key={category.id}>{category.shortName}</button>)}</div>
        <div className="document-results" aria-live="polite"><div className="results-summary"><strong>{results.length} {results.length === 1 ? "document" : "documents"}</strong>{filter !== "all" && <span>in {library.categories.find(category => category.id === filter)?.name}</span>}</div>{results.length ? results.map(item => <DocumentRow document={item} key={item.id} />) : <div className="empty-state"><SearchX size={28} aria-hidden="true" /><h2>No documents found</h2><p>{library.documents.length ? "Try a different title, category, or year." : "No published documents are available yet."}</p>{library.documents.length > 0 && <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear search and filters</button>}</div>}</div>
      </>}
    </main>
  </div>;
}
