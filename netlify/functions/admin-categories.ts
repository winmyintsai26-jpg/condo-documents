import { json, isAuthenticated, requireAdminMutation } from "./_shared/auth";
import { getSupabase } from "./_shared/supabase";

export default async (request: Request) => {
  const db = getSupabase();
  if (request.method === "GET") {
    if (!(await isAuthenticated(request))) return json({ message: "Authentication required." }, 401);
    const { data, error } = await db.from("categories").select("id,name,slug,short_name,description,position").order("position");
    return error ? json({ message: error.message }, 500) : json({ categories: data });
  }
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const input = await request.json() as Record<string, unknown>;
  const name = String(input.name ?? "").trim(); const shortName = String(input.shortName ?? name).trim(); const slug = String(input.slug ?? name).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!name || !slug) return json({ message: "Category name is required." }, 400);
  const { data, error } = await db.from("categories").insert({ name: name.slice(0, 100), short_name: shortName.slice(0, 40), slug, description: String(input.description ?? "").trim().slice(0, 240) }).select().single();
  return error ? json({ message: error.message }, 400) : json({ category: data }, 201);
};
