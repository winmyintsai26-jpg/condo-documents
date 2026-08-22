import { ArrowUpRight, FileText } from "lucide-react";
import { categories } from "../data/documents";
import type { CondoDocument } from "../types/document";
const dateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export function DocumentRow({ document }: { document: CondoDocument }) {
  const category = categories.find(item => item.id === document.category);
  return <article className="document-row"><span className="document-icon" aria-hidden="true"><FileText size={22} strokeWidth={1.6} /></span><div className="document-main"><h3>{document.title}</h3><p>{category?.title} <span aria-hidden="true">·</span> {document.fileType}</p></div><div className="document-meta"><span className="meta-label">Year</span><strong>{document.year}</strong></div><div className="document-meta updated"><span className="meta-label">Last updated</span><strong>{dateFormatter.format(new Date(document.updatedAt))}</strong></div><a className="document-action" href={document.fileUrl} onClick={event => event.preventDefault()} aria-label={`View ${document.title}`}><span>View document</span><ArrowUpRight size={18} /></a></article>;
}
