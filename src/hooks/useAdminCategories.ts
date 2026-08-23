import { useCallback, useEffect, useState } from "react";
import { getAdminCategories } from "../api/documents";
import type { CategoryDefinition } from "../types/document";

let categoryCache: CategoryDefinition[] | null = null;
let categoryRequest: Promise<CategoryDefinition[]> | null = null;

function fetchCategories() {
  categoryRequest ??= getAdminCategories().then(result => {
    categoryCache = result.categories;
    return result.categories;
  }).finally(() => { categoryRequest = null; });
  return categoryRequest;
}

export function useAdminCategories() {
  const [categories, setLocalCategories] = useState<CategoryDefinition[]>(() => categoryCache ?? []); const [loading, setLoading] = useState(categoryCache === null); const [error, setError] = useState("");
  const setCategories = useCallback((update: CategoryDefinition[] | ((current: CategoryDefinition[]) => CategoryDefinition[])) => {
    setLocalCategories(current => {
      const next = typeof update === "function" ? update(current) : update;
      categoryCache = next;
      return next;
    });
  }, []);
  const reload = useCallback(async () => { setLoading(true); setError(""); try { setCategories(await fetchCategories()); } catch { setLocalCategories([]); setError("Categories could not be loaded. Check the connection and try again."); } finally { setLoading(false); } }, [setCategories]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (categoryCache === null) void reload(); }, [reload]);
  return { categories, loading, error, reload, setCategories };
}
