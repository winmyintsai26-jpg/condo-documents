import { json, requireAdminMutation } from "./_shared/auth";
import { getSupabase } from "./_shared/supabase";
import { categoryDeletionError, categoryUpdate } from "./_shared/categories";

export default async (request: Request) => {
  if (!["PATCH", "DELETE"].includes(request.method)) return json({ message: "Method not allowed." }, 405);
  const denied = await requireAdminMutation(request); if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id"); if (!id) return json({ message: "Category ID is required." }, 400);
  const db = getSupabase();
  if (request.method === "DELETE") {
    const { count, error: countError } = await db.from("documents").select("id", { count: "exact", head: true }).eq("category_id", id);
    if (countError) { console.error("Category document count failed", countError.code); return json({ message: "Category could not be checked for deletion." }, 500); }
    const blocked = categoryDeletionError(count ?? 0); if (blocked) return json({ message: blocked }, 409);
    const { error } = await db.from("categories").delete().eq("id", id); if (error) { console.error("Category deletion failed", error.code); return json({ message: "Category could not be deleted." }, 400); } return json({ ok: true });
  }
  const input = await request.json() as Record<string, unknown>; const update = categoryUpdate(input);
  if (!Object.keys(update).length) return json({ message: "No valid category changes were provided." }, 400);
  const { error } = await db.from("categories").update(update).eq("id", id); if (error) { console.error("Category update failed", error.code); return json({ message: "Category could not be updated." }, 400); } return json({ ok: true });
};
