export interface CategoryRow { id: string; name: string; slug: string; short_name: string; description: string; position: number; }
export interface CategoryDto { id: string; name: string; slug: string; shortName: string; description: string; position: number; }
export function toCategory(row: CategoryRow): CategoryDto { return { id: row.id, name: row.name, slug: row.slug, shortName: row.short_name, description: row.description, position: row.position }; }
export function categoryInput(input: Record<string, unknown>) {
  const name = String(input.name ?? "").trim(); const shortName = String(input.shortName ?? name).trim();
  const slug = String(input.slug ?? name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const description = String(input.description ?? "").trim(); const position = input.position === undefined ? undefined : Number(input.position);
  if (!name || !slug) return { error: "Category name is required." } as const;
  if (name.length > 100 || !shortName || shortName.length > 40 || description.length > 240) return { error: "Category values exceed the allowed length." } as const;
  if (position !== undefined && (!Number.isInteger(position) || position < 0 || position > 10000)) return { error: "Category order must be a whole number." } as const;
  return { name, shortName, slug, description, position } as const;
}
export function categoryUpdate(input: Record<string, unknown>) {
  const update: Record<string, string | number> = {};
  if (typeof input.name === "string" && input.name.trim()) update.name = input.name.trim().slice(0, 100);
  if (typeof input.shortName === "string" && input.shortName.trim()) update.short_name = input.shortName.trim().slice(0, 40);
  if (typeof input.description === "string") update.description = input.description.trim().slice(0, 240);
  if (Number.isInteger(input.position) && Number(input.position) >= 0) update.position = Number(input.position);
  return update;
}
export function categoryDeletionError(documentCount: number) { return documentCount > 0 ? "Move or delete this category’s documents first." : null; }
