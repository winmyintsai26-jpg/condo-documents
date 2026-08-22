import { json, isAuthenticated, requireAdminMutation } from "./_shared/auth";
import { getSupabase } from "./_shared/supabase";
import { categoryInput, toCategory, type CategoryRow } from "./_shared/categories";

export default async (request: Request) => {
  if (request.method === "GET") {
    if (!(await isAuthenticated(request))) return json({ message: "Authentication required." }, 401);
    const db = getSupabase();
    const { data, error } = await db.from("categories").select("id,name,slug,short_name,description,position").order("position");
    if (error) { console.error("Category list query failed", error.code); return json({ message: "Categories could not be loaded." }, 500); }
    return json({ categories: (data ?? []).map(row => toCategory(row as CategoryRow)) });
  }
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const db = getSupabase();
  const fields = categoryInput(await request.json() as Record<string, unknown>); if ("error" in fields) return json({ message: fields.error }, 400);
  const { data, error } = await db.from("categories").insert({ name: fields.name, short_name: fields.shortName, slug: fields.slug, description: fields.description, ...(fields.position === undefined ? {} : { position: fields.position }) }).select("id,name,slug,short_name,description,position").single();
  if (error) { console.error("Category creation failed", error.code); return json({ message: error.code === "23505" ? "A category with that name already exists." : "Category could not be created." }, 400); }
  return json({ category: toCategory(data as CategoryRow) }, 201);
};
