import { Landmark, LibraryBig, Megaphone, ReceiptText, ScrollText } from "lucide-react";
import type { CategoryDefinition, CondoDocument } from "../types/document";
const icons = [Landmark, ScrollText, LibraryBig, ReceiptText, Megaphone];
export function CategoryOverview({ categories, documents, onSelect }: { categories: CategoryDefinition[]; documents: CondoDocument[]; onSelect: (category: string) => void }) {
  return <div className="category-grid" aria-label="Document categories">{categories.map((category, index) => { const Icon = icons[index % icons.length]; const count = documents.filter(document => document.categoryId === category.id).length; return <button type="button" className="category-item" key={category.id} onClick={() => onSelect(category.id)}><span className="category-icon"><Icon size={20} strokeWidth={1.7} /></span><span className="category-copy"><strong>{category.name}</strong><small>{category.description}</small></span><span className="category-count">{count}</span></button>; })}</div>;
}
