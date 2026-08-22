import { Landmark, LibraryBig, Megaphone, ReceiptText, ScrollText } from "lucide-react";
import { categories, documents } from "../data/documents";
import type { DocumentCategory } from "../types/document";
const icons = { management: Landmark, dedicatory: ScrollText, minutes: LibraryBig, financial: ReceiptText, notices: Megaphone };
export function CategoryOverview({ onSelect }: { onSelect: (category: DocumentCategory) => void }) {
  return <div className="category-grid" aria-label="Document categories">{categories.map(category => { const Icon = icons[category.id]; const count = documents.filter(document => document.category === category.id).length; return <button type="button" className="category-item" key={category.id} onClick={() => onSelect(category.id)}><span className="category-icon"><Icon size={20} strokeWidth={1.7} /></span><span className="category-copy"><strong>{category.title}</strong><small>{category.description}</small></span><span className="category-count">{count}</span></button>; })}</div>;
}
