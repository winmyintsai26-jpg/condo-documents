import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { hash } from "bcryptjs";
import adminDocument from "../netlify/functions/admin-document";
import { MAX_FILE_SIZE, validatePdf, validatePdfBytes } from "../netlify/functions/_shared/documents";

const origin = "http://localhost:8888";
beforeEach(async () => { process.env.ADMIN_USERNAME = "admin"; process.env.ADMIN_PASSWORD_HASH = await hash("password", 4); process.env.SESSION_SECRET = "test-session-secret-that-is-longer-than-thirty-two-characters"; process.env.ALLOWED_ORIGINS = origin; });
test("rejects unauthenticated document mutations before data access", async () => { const response = await adminDocument(new Request(`${origin}/api/admin/document?id=123`, { method: "DELETE", headers: { origin } })); assert.equal(response.status, 401); });
test("rejects a PDF with an invalid signature", async () => { const file = new File(["not a pdf"], "fake.pdf", { type: "application/pdf" }); assert.equal(await validatePdfBytes(file), "The uploaded file is not a valid PDF."); });
test("rejects unsupported MIME types and oversized files", () => { assert.equal(validatePdf(new File(["text"], "notes.txt", { type: "text/plain" })), "Only PDF files are supported."); const oversized = { size: MAX_FILE_SIZE + 1, type: "application/pdf" } as File; assert.equal(validatePdf(oversized), "PDF files must be 15 MB or smaller."); });
