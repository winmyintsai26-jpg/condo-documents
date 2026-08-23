import { json } from "./_shared/auth";
import { DOCUMENT_SELECT, toDocument } from "./_shared/documents";
import { getSupabase } from "./_shared/supabase";
import { toCategory, type CategoryRow } from "./_shared/categories";

export default async (request: Request) => {
  if (request.method !== "GET") return json({ message: "Method not allowed." }, 405, { allow: "GET" });
  try {
    const db = getSupabase();
    const [{ data: categories, error: categoryError }, { data: rows, error: documentError }] = await Promise.all([
      db.from("categories").select("id,name,slug,short_name,description,position").order("position"),
      db.from("documents").select(DOCUMENT_SELECT).eq("published", true).order("updated_at", { ascending: false }),
    ]);
    if (categoryError || documentError) throw categoryError ?? documentError;
    return json({ categories: (categories ?? []).map(row => toCategory(row as CategoryRow)), documents: (rows ?? []).map(row => toDocument(row)) });
  } catch (error) { console.error("Public library error", error); return json({ message: "The document library is temporarily unavailable." }, 503); }
};
