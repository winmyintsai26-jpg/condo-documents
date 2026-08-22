import { json, requireAdminMutation } from "./_shared/auth";
import { storagePath, validatePdfBytes } from "./_shared/documents";
import { DOCUMENT_BUCKET, getSupabase } from "./_shared/supabase";

export default async (request: Request) => {
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id"); const form = await request.formData(); const file = form.get("file");
  if (!id || !(file instanceof File)) return json({ message: "Document and PDF are required." }, 400);
  const fileError = await validatePdfBytes(file); if (fileError) return json({ message: fileError }, 400);
  const db = getSupabase(); const { data: old, error: lookupError } = await db.from("documents").select("storage_path").eq("id", id).single();
  if (lookupError) return json({ message: "Document not found." }, 404);
  const path = storagePath(file.name); const uploaded = await db.storage.from(DOCUMENT_BUCKET).upload(path, await file.arrayBuffer(), { contentType: "application/pdf" });
  if (uploaded.error) return json({ message: "The PDF could not be uploaded." }, 500);
  const { error } = await db.from("documents").update({ storage_path: path, file_name: file.name, file_size: file.size, file_type: "PDF" }).eq("id", id);
  if (error) { console.error("Document replacement failed", error.code); await db.storage.from(DOCUMENT_BUCKET).remove([path]); return json({ message: "The PDF could not be replaced." }, 400); }
  const removed = await db.storage.from(DOCUMENT_BUCKET).remove([old.storage_path]); if (removed.error) console.error("Orphaned replaced file", old.storage_path, removed.error);
  return json({ ok: true });
};
