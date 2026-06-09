import type { LiturgicalDay } from "@sao-jorge/shared";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://sao-jorge-api.talles-f1e.workers.dev";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function fetchApi<T>(
  path: string,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) return { error: `[${res.status}] ${res.statusText}` };
  try {
    return { data: (await res.json()) as T };
  } catch {
    return { error: "Invalid JSON" };
  }
}

/* ── Liturgical ────────────────────────────────────────────── */
export function fetchDay(date?: string) {
  if (date) return fetchApi<LiturgicalDay>(`/api/day/${date}`);
  return fetchApi<LiturgicalDay>("/api/day/today");
}

/* ── Services ────────────────────────────────────────────── */
export function fetchServices() {
  return fetchApi<
    Array<{
      slug: string;
      title_pt: string;
      title_ar: string | null;
      category: string;
      subcategory: string | null;
    }>
  >("/api/services");
}

export function fetchService(slug: string) {
  return fetchApi<Record<string, unknown>>(`/api/services/${slug}`);
}

/* Alias for clarity */
export const fetchServiceTextsBySlug = fetchService;
export const fetchServiceCatalog = fetchServices;

/* ── Blog ──────────────────────────────────────────────── */
export function fetchPosts(limit = 10) {
  return fetchApi<Array<Record<string, unknown>>>(`/api/blog?limit=${limit}`);
}

export function fetchPost(slug: string) {
  return fetchApi<Record<string, unknown>>(`/api/blog/${slug}`);
}

/* ── Bulletin ──────────────────────────────────────────── */
export function fetchBulletins(limit = 20) {
  return fetchApi<Array<Record<string, unknown>>>(`/api/bulletin?limit=${limit}`);
}

/* ── Catechesis ──────────────────────────────────────── */
export function fetchCatechesis() {
  return fetchApi<Array<Record<string, unknown>>>("/api/catechesis");
}

export function fetchCatechesisUnit(slug: string) {
  return fetchApi<Record<string, unknown>>(`/api/catechesis/${slug}`);
}

export function fetchCatechesisLessonsByUnitSlug(unitSlug: string) {
  return fetchApi<Array<Record<string, unknown>>>(
    `/api/catechesis/${unitSlug}/lessons`
  );
}

/* Alias for clarity */
export const fetchCatechesisUnits = fetchCatechesis;

/* ── Podcast ──────────────────────────────────────────── */
export function fetchPodcast() {
  return fetchApi<Array<Record<string, unknown>>>(`/api/podcast`);
}