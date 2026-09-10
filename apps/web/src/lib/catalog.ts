const baseUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

export type CatalogExercise = {
  id: string;
  language: string;
  name: string;
  description: string;
  category: string | null;
  muscles: string[];
  musclesSecondary: string[];
  equipment: string[];
  imageUrl: string | null;
  license: string | null;
  licenseAuthor: string | null;
  sourceUrl: string | null;
};

export type CatalogPage = {
  exercises: CatalogExercise[];
  total: number;
  limit: number;
  offset: number;
};

export type CatalogFacets = {
  muscles: string[];
  equipment: string[];
  categories: string[];
};

export type CatalogFilters = {
  search?: string;
  muscle?: string;
  equipment?: string;
  withImage?: boolean;
  limit?: number;
  offset?: number;
};

export function isCatalogAvailable() {
  return baseUrl.length > 0;
}

/** O catálogo é público: não manda token nem depende de sessão. */
async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, { signal });
  if (!response.ok)
    throw new Error(`Catálogo indisponível (${response.status}).`);
  return (await response.json()) as T;
}

export function fetchExercises(filters: CatalogFilters, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.muscle) params.set("muscle", filters.muscle);
  if (filters.equipment) params.set("equipment", filters.equipment);
  if (filters.withImage) params.set("withImage", "true");
  params.set("limit", String(filters.limit ?? 24));
  params.set("offset", String(filters.offset ?? 0));

  return get<CatalogPage>(`/api/exercises?${params}`, signal);
}

export function fetchFacets(signal?: AbortSignal) {
  return get<CatalogFacets>("/api/exercises/facets", signal);
}
