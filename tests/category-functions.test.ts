import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import categoriesHandler from "../netlify/functions/admin-categories";
import categoryHandler from "../netlify/functions/admin-category";
import { createSessionToken, SESSION_COOKIE } from "../netlify/functions/_shared/auth";

test("authenticated category API lists, creates, edits, and safely deletes", async () => {
  const rows = ["Management Certificate", "Dedicatory Instruments", "Meeting Minutes", "Financial Statements", "Community Notices"].map((name, index) => ({ id: `category-${index + 1}`, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), short_name: name.split(" ")[0], description: `${name} records`, position: (index + 1) * 10 }));
  const occupiedId = rows[0].id;
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost"); const chunks: Buffer[] = [];
    request.on("data", chunk => chunks.push(chunk)); request.on("end", () => {
      response.setHeader("content-type", "application/json");
      if (url.pathname === "/rest/v1/categories" && request.method === "GET") { response.end(JSON.stringify(rows)); return; }
      if (url.pathname === "/rest/v1/categories" && request.method === "POST") { const input = JSON.parse(Buffer.concat(chunks).toString()) as Record<string, unknown>; const row = { id: "category-new", ...input }; rows.push(row as typeof rows[number]); response.statusCode = 201; response.end(JSON.stringify(row)); return; }
      if (url.pathname === "/rest/v1/categories" && request.method === "PATCH") { const id = url.searchParams.get("id")?.replace("eq.", ""); const row = rows.find(item => item.id === id); if (row) Object.assign(row, JSON.parse(Buffer.concat(chunks).toString())); response.end(JSON.stringify([])); return; }
      if (url.pathname === "/rest/v1/documents" && request.method === "HEAD") { const categoryId = url.searchParams.get("category_id")?.replace("eq.", ""); response.setHeader("content-range", categoryId === occupiedId ? "0-0/1" : "*/0"); response.end(); return; }
      if (url.pathname === "/rest/v1/categories" && request.method === "DELETE") { const id = url.searchParams.get("id")?.replace("eq.", ""); const index = rows.findIndex(item => item.id === id); if (index >= 0) rows.splice(index, 1); response.end(JSON.stringify([])); return; }
      response.statusCode = 404; response.end(JSON.stringify({ message: "not found" }));
    });
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve)); const address = server.address(); if (!address || typeof address === "string") throw new Error("Mock server did not start");
  process.env.SUPABASE_URL = `http://127.0.0.1:${address.port}`; process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-service-role-key"; process.env.SESSION_SECRET = "test-session-secret-that-is-longer-than-thirty-two-characters"; process.env.ALLOWED_ORIGINS = "http://localhost:8888";
  const token = await createSessionToken(); const headers = { cookie: `${SESSION_COOKIE}=${token}`, origin: "http://localhost:8888", "content-type": "application/json" };
  try {
    const list = await categoriesHandler(new Request("http://localhost:8888/api/admin/categories", { headers })); assert.equal(list.status, 200); const listed = await list.json(); assert.deepEqual(listed.categories.map((item: { name: string }) => item.name), ["Management Certificate", "Dedicatory Instruments", "Meeting Minutes", "Financial Statements", "Community Notices"]); assert.equal(listed.categories[0].shortName, "Management");
    const created = await categoriesHandler(new Request("http://localhost:8888/api/admin/categories", { method: "POST", headers, body: JSON.stringify({ name: "Architectural Requests", shortName: "Architecture", description: "Review forms", position: 60 }) })); assert.equal(created.status, 201);
    const edited = await categoryHandler(new Request("http://localhost:8888/api/admin/category?id=category-new", { method: "PATCH", headers, body: JSON.stringify({ name: "Architectural Review", description: "Updated forms", position: 55 }) })); assert.equal(edited.status, 200); assert.equal(rows.find(item => item.id === "category-new")?.name, "Architectural Review");
    const deleted = await categoryHandler(new Request("http://localhost:8888/api/admin/category?id=category-new", { method: "DELETE", headers })); assert.equal(deleted.status, 200); assert.equal(rows.some(item => item.id === "category-new"), false);
    const blocked = await categoryHandler(new Request(`http://localhost:8888/api/admin/category?id=${occupiedId}`, { method: "DELETE", headers })); assert.equal(blocked.status, 409); assert.equal(rows.some(item => item.id === occupiedId), true);
  } finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
});
