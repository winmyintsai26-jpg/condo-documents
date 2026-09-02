import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { beforeEach } from "node:test";
import ownerLibrary from "../netlify/functions/owner-library";
import { createOwnerSessionToken, createSessionToken, OWNER_SESSION_COOKIE, SESSION_COOKIE } from "../netlify/functions/_shared/auth";

const origin = "http://localhost:8888";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-session-secret-that-is-longer-than-thirty-two-characters";
});

test("owner library rejects missing and admin-only sessions before data access", async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await ownerLibrary(new Request(`${origin}/api/owner/library`))).status, 401);
  const adminToken = await createSessionToken();
  assert.equal((await ownerLibrary(new Request(`${origin}/api/owner/library`, { headers: { cookie: `${SESSION_COOKIE}=${adminToken}` } }))).status, 401);
});

test("authenticated owner receives published documents through the shared library query", async () => {
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
    response.statusCode = 404;
    response.end("{}");
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Mock server did not start");
  process.env.SUPABASE_URL = `http://127.0.0.1:${address.port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-service-role-key";
  const ownerToken = await createOwnerSessionToken();
  try {
    const response = await ownerLibrary(new Request(`${origin}/api/owner/library`, { headers: { cookie: `${OWNER_SESSION_COOKIE}=${ownerToken}` } }));
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.documents.length, 1);
    assert.equal(body.documents[0].published, true);
    assert.equal(body.categories[0].name, "Meeting Minutes");
    assert.match(documentQuery, /published=eq\.true/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
