import { FilePenLine, FileUp, RefreshCw, Trash2, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { createDocument, deleteDocument, getAdminDocuments, replaceDocument, updateDocument } from "../api/documents";
import { useAdminCategories } from "../hooks/useAdminCategories";
import type { CondoDocument } from "../types/document";

export function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<CondoDocument[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const { categories, loading: categoriesLoading, error: categoriesError, reload: reloadCategories } = useAdminCategories();

  const load = async () => {
    setLoadStatus("loading");
    try { setDocuments((await getAdminDocuments()).documents); setLoadStatus("ready"); }
    catch { setLoadStatus("error"); }
  };

  // Initial API synchronization.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load(); }, []);

  const upload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = event.currentTarget; setBusy(true); setMessage("");
    try { await createDocument(new FormData(form)); form.reset(); setShowForm(false); setMessage("Document uploaded."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The document could not be uploaded."); }
    finally { setBusy(false); }
  };

  const edit = async (item: CondoDocument) => {
    const title = prompt("Document title", item.title); if (!title) return;
    const year = Number(prompt("Document year", String(item.year)));
    try { await updateDocument(item.id, { title, year }); setMessage("Document updated."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The document could not be updated."); }
  };

  const replace = (item: CondoDocument) => {
    const input = document.createElement("input"); input.type = "file"; input.accept = "application/pdf,.pdf";
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file || !confirm(`Replace the current PDF for “${item.title}”?`)) return;
      try { await replaceDocument(item.id, file); setMessage("PDF replaced."); await load(); }
      catch (error) { setMessage(error instanceof Error ? error.message : "The PDF could not be replaced."); }
    };
    input.click();
  };

  const remove = async (item: CondoDocument) => {
    if (!confirm(`Delete “${item.title}” and its PDF? This cannot be undone.`)) return;
    try { await deleteDocument(item.id); setMessage("Document deleted."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The document could not be deleted."); }
  };

  const togglePublished = async (item: CondoDocument) => {
    try { await updateDocument(item.id, { published: !item.published }); setMessage(item.published ? "Document unpublished." : "Document published."); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : "The publication status could not be changed."); }
  };

  return <main className="admin-content">
    <div className="admin-page-heading admin-heading-row"><div><p className="eyebrow">Library</p><h1>Documents</h1><p>Upload and manage the records shown on the public website.</p></div><button type="button" className="primary-button" onClick={() => setShowForm(value => !value)}><Upload size={18} aria-hidden="true"/>Upload Document</button></div>
    {message && <div className="admin-notice" role="status">{message}</div>}
    {showForm && <form className="admin-form" onSubmit={upload}>
      <label>Title<input name="title" required maxLength={180}/></label>
      <label>Category<select name="categoryId" required defaultValue="" disabled={categoriesLoading || !!categoriesError}><option value="" disabled>{categoriesLoading ? "Loading categories…" : categoriesError ? "Categories unavailable" : "Choose category"}</option>{categories.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}</select>{categoriesError && <button type="button" className="inline-retry" onClick={() => void reloadCategories()}>Retry categories</button>}</label>
      <label>Year<input name="year" type="number" min="1800" max="2200" defaultValue={new Date().getFullYear()} required/></label>
      <label>PDF File<input name="file" type="file" accept="application/pdf,.pdf" required/></label>
      <label className="checkbox-field"><input name="published" type="checkbox" value="true" defaultChecked/>Publish Now</label>
      <button className="primary-button" disabled={busy || categoriesLoading || !!categoriesError}>{busy ? "Uploading…" : "Upload PDF"}</button><small>PDF only, maximum 15 MB.</small>
    </form>}
    {loadStatus === "loading" ? <div className="admin-resource-state" role="status"><span className="loading-ring"/>Loading documents…</div> : loadStatus === "error" ? <div className="admin-resource-state" role="alert"><h2>Documents unavailable</h2><p>The document list could not be loaded. Please try again.</p><button type="button" className="primary-button" onClick={() => void load()}><RefreshCw size={17} aria-hidden="true"/>Retry</button></div> : <div className="admin-table-wrap">
      <table className="admin-table"><thead><tr><th>Document</th><th>Category</th><th>Year</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{documents.map(item => <tr key={item.id}><td><FileUp size={18} aria-hidden="true"/><strong>{item.title}</strong></td><td>{item.category?.name}</td><td>{item.year}</td><td><button type="button" className={`status-toggle ${item.published ? "published" : ""}`} onClick={() => void togglePublished(item)}>{item.published ? "Published" : "Draft"}</button></td><td><div className="row-actions"><button type="button" onClick={() => void edit(item)}><FilePenLine/>Edit</button><button type="button" onClick={() => replace(item)}><RefreshCw/>Replace PDF</button><button type="button" onClick={() => void remove(item)} className="danger"><Trash2/>Delete</button></div></td></tr>)}</tbody></table>
      {documents.length === 0 && <div className="admin-empty">No documents have been uploaded.</div>}
    </div>}
  </main>;
}
