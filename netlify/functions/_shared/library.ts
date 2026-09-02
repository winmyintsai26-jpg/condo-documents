import { toCategory, type CategoryRow } from "./categories";
import { DOCUMENT_SELECT, toDocument } from "./documents";
import { getSupabase } from "./supabase";

export async function getPublishedLibrary() {
  const db = getSupabase();
  const [{ data: categories, error: categoryError }, { data: rows, error: documentError }] = await Promise.all([
    db.from("categories").select("id,name,slug,short_name,description,position").order("position"),
    db.from("documents").select(DOCUMENT_SELECT).eq("published", true).order("updated_at", { ascending: false }),
  ]);
  if (categoryError || documentError) throw categoryError ?? documentError;
  return {
    categories: (categories ?? []).map(row => toCategory(row as CategoryRow)),
    documents: (rows ?? []).map(row => toDocument(row)),
  };
}
