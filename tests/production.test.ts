import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createServer } from "node:http";
import test from "node:test";
import publicLibrary from "../netlify/functions/public-library";

test("migration grants only the server service role application-table access", async () => {
  const migration = await readFile("supabase/migrations/202608220001_document_management.sql", "utf8");
  assert.match(migration, /grant usage on schema public to service_role/i);
  assert.match(migration, /grant select, insert, update, delete on table public\.categories to service_role/i);
  assert.match(migration, /grant select, insert, update, delete on table public\.documents to service_role/i);
  assert.doesNotMatch(migration, /grant\s+(?:insert|update|delete|all)[^;]*\bto\s+anon\b/i);
});

test("Netlify routes functions before the SPA fallback", async () => {
  const config = await readFile("netlify.toml", "utf8");
  const apiRedirect = config.indexOf('from = "/api/auth/login"');
  const spaFallback = config.indexOf('from = "/*"');
  assert.ok(apiRedirect >= 0 && spaFallback > apiRedirect);
  assert.match(config, /command = "npm run build"/);
  assert.match(config, /publish = "dist"/);
  assert.match(config, /functions = "netlify\/functions"/);
  await assert.rejects(() => access("public/_redirects"));
});

test("public library requests published documents only", async () => {
  let documentQuery = "";
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? "/", "http://localhost");
    response.setHeader("content-type", "application/json");
    if (url.pathname === "/rest/v1/categories") {
      response.end(JSON.stringify([{ id: "category-1", name: "Meeting Minutes", slug: "minutes", short_name: "Meetings", description: "Board records", position: 10 }]));
      return;
    }
    if (url.pathname === "/rest/v1/documents") {
      documentQuery = url.search;
      response.end(JSON.stringify([{ id: "document-1", title: "Published minutes", category_id: "category-1", file_name: "minutes.pdf", storage_path: "2026/minutes.pdf", year: 2026, updated_at: "2026-08-22T00:00:00.000Z", file_type: "PDF", file_size: 100, published: true, categories: { id: "category-1", name: "Meeting Minutes", slug: "minutes", short_name: "Meetings", description: "Board records" } }]));
      return;
    }
    response.statusCode = 404; response.end("{}");
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Mock server did not start");
  process.env.SUPABASE_URL = `http://127.0.0.1:${address.port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-service-role-key";
  try {
    const response = await publicLibrary(new Request("http://localhost:8888/api/library"));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const body = await response.json();
    assert.equal(body.documents.length, 1);
    assert.equal(body.documents[0].published, true);
    assert.match(documentQuery, /published=eq\.true/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});

test("frontend source does not reference server secrets", async () => {
  const files = ["src/api/documents.ts", "src/auth/AuthContext.tsx", "src/config/site.ts"];
  const source = (await Promise.all(files.map(file => readFile(file, "utf8")))).join("\n");
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY|ADMIN_PASSWORD_HASH|SESSION_SECRET/);
});

test("admin document mutations update local state without refetching the full list", async () => {
  const source = await readFile("src/pages/AdminDocumentsPage.tsx", "utf8");
  assert.match(source, /setDocuments\(current => putFirst\(current, document\)\)/);
  assert.match(source, /setDocuments\(current => current\.filter\(entry => entry\.id !== item\.id\)\)/);
  assert.doesNotMatch(source, /await load\(\)/);
});
