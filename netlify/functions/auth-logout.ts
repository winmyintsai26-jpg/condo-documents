import { assertSameOrigin, clearSessionCookie, json } from "./_shared/auth";
export default async (request: Request) => {
  if (request.method !== "POST") return json({ message: "Method not allowed." }, 405, { allow: "POST" });
  if (!assertSameOrigin(request)) return json({ message: "Request could not be verified." }, 403);
  return json({ authenticated: false }, 200, { "set-cookie": clearSessionCookie() });
};
