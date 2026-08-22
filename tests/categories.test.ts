import assert from "node:assert/strict";
import test from "node:test";
import { categoryDeletionError, categoryInput, categoryUpdate, toCategory } from "../netlify/functions/_shared/categories";
import categoriesHandler from "../netlify/functions/admin-categories";

test("normalizes Supabase category rows for the admin and upload clients", () => {
  const category = toCategory({ id: "category-1", name: "Meeting Minutes", slug: "minutes", short_name: "Meetings", description: "Board records", position: 30 });
  assert.deepEqual(category, { id: "category-1", name: "Meeting Minutes", slug: "minutes", shortName: "Meetings", description: "Board records", position: 30 });
});
test("validates category creation fields", () => { assert.deepEqual(categoryInput({ name: "  New Category ", shortName: " New ", description: " Details ", position: 60 }), { name: "New Category", shortName: "New", slug: "new-category", description: "Details", position: 60 }); });
test("maps editable category fields including ordering", () => { assert.deepEqual(categoryUpdate({ name: "Renamed", shortName: "Short", description: "Updated", position: 20 }), { name: "Renamed", short_name: "Short", description: "Updated", position: 20 }); });
test("allows empty category deletion and rejects categories with documents", () => { assert.equal(categoryDeletionError(0), null); assert.equal(categoryDeletionError(2), "Move or delete this category’s documents first."); });
test("category list rejects an unauthenticated request before database access", async () => { delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY; const response = await categoriesHandler(new Request("http://localhost:8888/api/admin/categories")); assert.equal(response.status, 401); });
