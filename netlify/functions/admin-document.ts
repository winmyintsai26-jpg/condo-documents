import { json, requireAdminMutation } from "./_shared/auth";
import { DOCUMENT_SELECT, toDocument } from "./_shared/documents";
import { DOCUMENT_BUCKET, getSupabase } from "./_shared/supabase";

export default async (request: Request) => {
  if (!["PATCH", "DELETE"].includes(request.method)) return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id"); if (!id) return json({ message: "Document ID is required." }, 400);
  const db = getSupabase();
  if (request.method === "PATCH") {
    const input = await request.json() as Record<string, unknown>; const update: Record<string, unknown> = {};
    if (typeof input.title === "string" && input.title.trim()) update.title = input.title.trim().slice(0, 180);
    if (typeof input.categoryId === "string") update.category_id = input.categoryId;
    if (Number.isInteger(input.year) && Number(input.year) >= 1800 && Number(input.year) <= 2200) update.year = input.year;
    if (typeof input.published === "boolean") update.published = input.published;
    const { data, error } = await db.from("documents").update(update).eq("id", id).select(DOCUMENT_SELECT).single();
    if (error) { console.error("Document update failed", error.code); return json({ message: "The document could not be updated." }, 400); }
    return json({ document: toDocument(data) });
  }
  const { data, error } = await db.from("documents").delete().eq("id", id).select("storage_path").single();
  if (error) { console.error("Document deletion failed", error.code); return json({ message: error.code === "PGRST116" ? "Document not found." : "The document could not be deleted." }, error.code === "PGRST116" ? 404 : 400); }
  const removed = await db.storage.from(DOCUMENT_BUCKET).remove([data.storage_path]);
  if (removed.error) console.error("Orphaned document file", data.storage_path, removed.error);
  return json({ ok: true });
};
