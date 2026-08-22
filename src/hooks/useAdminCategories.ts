import { useCallback, useEffect, useState } from "react";
import { getAdminCategories } from "../api/documents";
import type { CategoryDefinition } from "../types/document";
export function useAdminCategories() {
  const [categories, setCategories] = useState<CategoryDefinition[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const reload = useCallback(async () => { setLoading(true); setError(""); try { setCategories((await getAdminCategories()).categories); } catch { setCategories([]); setError("Categories could not be loaded. Check the connection and try again."); } finally { setLoading(false); } }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void reload(); }, [reload]);
  return { categories, loading, error, reload };
}
