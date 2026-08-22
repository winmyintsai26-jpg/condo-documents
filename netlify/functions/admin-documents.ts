import { json, isAuthenticated, requireAdminMutation } from "./_shared/auth";
import { DOCUMENT_SELECT, parseDocumentFields, storagePath, toDocument, validatePdfBytes } from "./_shared/documents";
import { DOCUMENT_BUCKET, getSupabase } from "./_shared/supabase";

export default async (request: Request) => {
  if (request.method === "GET") {
    if (!(await isAuthenticated(request))) return json({ message: "Authentication required." }, 401);
    const db = getSupabase();
    const { data, error } = await db.from("documents").select(DOCUMENT_SELECT).order("updated_at", { ascending: false });
    if (error) { console.error("Admin document list failed", error.code); return json({ message: "Documents could not be loaded." }, 500); }
    return json({ documents: (data ?? []).map(row => toDocument(row)) });
  }
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const db = getSupabase();
  const form = await request.formData(); const fields = parseDocumentFields(form); if ("error" in fields) return json({ message: fields.error }, 400);
  const file = form.get("file"); if (!(file instanceof File)) return json({ message: "Choose a PDF file." }, 400);
  const fileError = await validatePdfBytes(file); if (fileError) return json({ message: fileError }, 400);
  const path = storagePath(file.name); const bytes = await file.arrayBuffer();
  const uploaded = await db.storage.from(DOCUMENT_BUCKET).upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (uploaded.error) return json({ message: "The PDF could not be uploaded." }, 500);
  const { data, error } = await db.from("documents").insert({ title: fields.title, category_id: fields.categoryId, file_name: file.name, storage_path: path, year: fields.year, file_type: "PDF", file_size: file.size, published: fields.published }).select(DOCUMENT_SELECT).single();
  if (error) { console.error("Document creation failed", error.code); await db.storage.from(DOCUMENT_BUCKET).remove([path]); return json({ message: "The document record could not be created. Check the category and try again." }, 400); }
  return json({ document: toDocument(data) }, 201);
};
