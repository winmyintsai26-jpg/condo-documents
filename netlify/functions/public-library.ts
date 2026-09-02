import { isOwnerAuthenticated, json } from "./_shared/auth";
import { getPublishedLibrary } from "./_shared/library";

export default async (request: Request) => {
  if (request.method !== "GET") return json({ message: "Method not allowed." }, 405, { allow: "GET" });
  if (!(await isOwnerAuthenticated(request))) return json({ message: "Authentication required." }, 401);
  try {
    return json(await getPublishedLibrary());
  } catch (error) { console.error("Public library error", error); return json({ message: "The document library is temporarily unavailable." }, 503); }
};
