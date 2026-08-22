"use client";
import { ArrowDown, Building, Mail, Phone, Search, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { CategoryOverview } from "../components/CategoryOverview";
import { DocumentRow } from "../components/DocumentRow";
import { categories, documents } from "../data/documents";
import { siteConfig } from "../config/site";
import type { DocumentCategory } from "../types/document";
type Filter = "all" | DocumentCategory;
export function HomePage() {
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<Filter>("all");
  const results = useMemo(() => { const normalized = query.trim().toLowerCase(); return documents.filter(document => { const category = categories.find(item => item.id === document.category); return (filter === "all" || document.category === filter) && (!normalized || [document.title, category?.title, category?.shortTitle, String(document.year)].some(value => value?.toLowerCase().includes(normalized))); }); }, [filter, query]);
  const chooseCategory = (category: DocumentCategory) => { setFilter(category); document.getElementById("document-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return <main id="top">
    <section className="hero" aria-labelledby="hero-title"><div className="hero-pattern" aria-hidden="true" /><div className="shell hero-inner"><p className="eyebrow">Official association records</p><h1 id="hero-title">{siteConfig.subtitle}</h1><p className="hero-description">{siteConfig.description} Clear, current, and available in one trusted place.</p><a className="hero-link" href="#documents">Browse documents <ArrowDown size={17} /></a></div></section>
    <section className="documents-section shell" id="documents" aria-labelledby="documents-heading"><div className="section-heading"><div><p className="eyebrow">Document library</p><h2 id="documents-heading">Find association records</h2></div><p>{documents.length} documents available</p></div>
      <label className="search-field"><Search aria-hidden="true" size={21} /><span className="sr-only">Search documents</span><input type="search" placeholder="Search documents..." value={query} onChange={event => setQuery(event.target.value)} /></label>
      <CategoryOverview onSelect={chooseCategory} />
      <div className="filter-bar" aria-label="Filter by category"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")} type="button">All Documents</button>{categories.map(category => <button className={filter === category.id ? "active" : ""} onClick={() => setFilter(category.id)} type="button" key={category.id}>{category.shortTitle}</button>)}</div>
      <div id="document-results" className="document-results" aria-live="polite"><div className="results-summary"><strong>{results.length} {results.length === 1 ? "document" : "documents"}</strong>{filter !== "all" && <span>in {categories.find(category => category.id === filter)?.title}</span>}</div>{results.length ? results.map(document => <DocumentRow document={document} key={document.id} />) : <div className="empty-state"><SearchX size={28} /><h3>No documents found</h3><p>Try a different title, category, or year.</p><button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>Clear search and filters</button></div>}</div>
    </section>
    <section className="about-section" id="about"><div className="shell about-grid"><div className="about-heading"><span className="section-icon"><Building size={24} /></span><p className="eyebrow">About this portal</p><h2>Community records, made easier to access.</h2></div><p>This document center provides residents, owners, and the public with convenient access to official association records and current community information. Documents are organized for quick reference and maintained by property management.</p></div></section>
    <section className="contact-section shell" id="contact" aria-labelledby="contact-title"><div><p className="eyebrow">Questions or assistance</p><h2 id="contact-title">Contact property management</h2><p>For questions about a document or to request additional association records, contact the management office.</p></div><address className="contact-details"><strong>{siteConfig.contact.label}</strong><a href={`mailto:${siteConfig.contact.email}`}><Mail size={18} />{siteConfig.contact.email}</a><a href={`tel:${siteConfig.contact.phoneHref}`}><Phone size={18} />{siteConfig.contact.phone}</a></address></section>
  </main>;
}
