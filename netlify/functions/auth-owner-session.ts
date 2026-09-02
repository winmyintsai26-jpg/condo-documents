import { isOwnerAuthenticated, json } from "./_shared/auth";

export default async (request: Request) => request.method === "GET"
  ? json({ authenticated: await isOwnerAuthenticated(request) })
  : json({ message: "Method not allowed." }, 405, { allow: "GET" });
