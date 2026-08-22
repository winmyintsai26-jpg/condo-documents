import { randomUUID } from "node:crypto";
import { DOCUMENT_BUCKET, getSupabase } from "./supabase";

export const MAX_FILE_SIZE = 15 * 1024 * 1024;
export const DOCUMENT_SELECT = "id,title,category_id,file_name,storage_path,year,updated_at,file_type,file_size,published,categories(id,name,slug,short_name,description)";

export function validatePdf(file: File) {
  if (file.size > MAX_FILE_SIZE) return "PDF files must be 15 MB or smaller.";
  if (file.type !== "application/pdf") return "Only PDF files are supported.";
  return null;
}

export async function validatePdfBytes(file: File) {
  const error = validatePdf(file); if (error) return error;
  const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return new TextDecoder().decode(signature) === "%PDF-" ? null : "The uploaded file is not a valid PDF.";
}

export function storagePath(fileName: string) {
  const safe = fileName.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
  return `${new Date().getUTCFullYear()}/${randomUUID()}-${safe || "document.pdf"}`;
}

interface DocumentRow { id: string; title: string; category_id: string; categories: unknown; file_name: string; storage_path: string; year: number; updated_at: string; file_type: string; file_size: number; published: boolean; }
export function toDocument(row: DocumentRow) {
  const supabase = getSupabase();
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  return { id: row.id, title: row.title, categoryId: row.category_id, category, fileName: row.file_name, fileUrl: supabase.storage.from(DOCUMENT_BUCKET).getPublicUrl(row.storage_path).data.publicUrl, year: row.year, updatedAt: row.updated_at, fileType: row.file_type, fileSize: row.file_size, published: row.published };
}

export function parseDocumentFields(form: FormData) {
  const title = String(form.get("title") ?? "").trim();
  const categoryId = String(form.get("categoryId") ?? "").trim();
  const year = Number(form.get("year"));
  const published = String(form.get("published") ?? "true") === "true";
  if (!title || title.length > 180) return { error: "Enter a title of 180 characters or fewer." } as const;
  if (!categoryId) return { error: "Choose a category." } as const;
  if (!Number.isInteger(year) || year < 1800 || year > 2200) return { error: "Enter a valid year." } as const;
  return { title, categoryId, year, published } as const;
}
