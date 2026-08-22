import { ArrowUpRight, FileText } from "lucide-react";
import type { CondoDocument } from "../types/document";
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export function DocumentRow({ document }: { document: CondoDocument }) {
  return <article className="document-row"><span className="document-icon" aria-hidden="true"><FileText size={22} strokeWidth={1.6} /></span><div className="document-main"><h3>{document.title}</h3><p>{document.category?.name} <span aria-hidden="true">·</span> {document.fileType}</p></div><div className="document-meta"><span className="meta-label">Year</span><strong>{document.year}</strong></div><div className="document-meta updated"><span className="meta-label">Last updated</span><strong>{dateFormatter.format(new Date(document.updatedAt))}</strong></div><a className="document-action" href={document.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${document.title} PDF in a new tab`}><span>Open document</span><ArrowUpRight size={18} aria-hidden="true" /></a></article>;
}
