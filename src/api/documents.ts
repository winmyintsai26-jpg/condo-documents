import type { CategoryDefinition, CondoDocument, LibraryResponse } from "../types/document";
async function api<T>(url: string, init?: RequestInit): Promise<T> { const response = await fetch(url, { credentials: "same-origin", ...init }); const body = await response.json().catch(() => ({})) as { message?: string }; if (!response.ok) throw new Error(body.message ?? "The request could not be completed."); return body as T; }
export const getLibrary = () => api<LibraryResponse>("/api/library");
export const getAdminDocuments = () => api<{documents: CondoDocument[]}>("/api/admin/documents");
export const getAdminCategories = async () => { const result = await api<{categories?: unknown}>("/api/admin/categories"); if (!Array.isArray(result.categories)) throw new Error("The category service returned an invalid response."); return { categories: result.categories as CategoryDefinition[] }; };
export const createDocument = (form: FormData) => api<{document: CondoDocument}>("/api/admin/documents", { method: "POST", body: form });
export const updateDocument = (id: string, fields: object) => api<{ok: true}>(`/api/admin/document?id=${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(fields) });
export const deleteDocument = (id: string) => api<{ok: true}>(`/api/admin/document?id=${encodeURIComponent(id)}`, { method: "DELETE" });
export const replaceDocument = (id: string, file: File) => { const form = new FormData(); form.set("file", file); return api<{ok: true}>(`/api/admin/document/replace?id=${encodeURIComponent(id)}`, { method: "POST", body: form }); };
export const createCategory = (fields: object) => api<{category: CategoryDefinition}>("/api/admin/categories", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(fields) });
export const updateCategory = (id: string, fields: object) => api<{ok: true}>(`/api/admin/category?id=${encodeURIComponent(id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(fields) });
export const deleteCategory = (id: string) => api<{ok: true}>(`/api/admin/category?id=${encodeURIComponent(id)}`, { method: "DELETE" });
