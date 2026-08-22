import { json, requireAdminMutation } from "./_shared/auth";
import { getSupabase } from "./_shared/supabase";

export default async (request: Request) => {
  if (!["PATCH", "DELETE"].includes(request.method)) return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id"); if (!id) return json({ message: "Category ID is required." }, 400);
  const db = getSupabase();
  if (request.method === "DELETE") {
    const { count } = await db.from("documents").select("id", { count: "exact", head: true }).eq("category_id", id);
    if ((count ?? 0) > 0) return json({ message: "Move or delete this category’s documents first." }, 409);
    const { error } = await db.from("categories").delete().eq("id", id); return error ? json({ message: error.message }, 400) : json({ ok: true });
  }
  const input = await request.json() as Record<string, unknown>; const update: Record<string, string> = {};
  if (typeof input.name === "string" && input.name.trim()) update.name = input.name.trim().slice(0, 100);
  if (typeof input.shortName === "string" && input.shortName.trim()) update.short_name = input.shortName.trim().slice(0, 40);
  if (typeof input.description === "string") update.description = input.description.trim().slice(0, 240);
  const { error } = await db.from("categories").update(update).eq("id", id); return error ? json({ message: error.message }, 400) : json({ ok: true });
};
