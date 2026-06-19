// ☩ São Jorge V2 — Shared types (inline to avoid bundler issues with shared package)

export interface Env {
  DB: D1Database;
  DAY_CACHE: KVNamespace;
  MEDIA: R2Bucket;
  AI: Ai;
  ADMIN_TOKEN: string;
  ENVIRONMENT: string;
}

export interface LiturgicalDayRow {
  date: string;
  tone_of_week: number;
  fast_type: string;
  feast_level: number;
  feast_name_pt: string | null;
  feast_name_ar: string | null;
  feast_name_en: string | null;
  saint_slug: string | null;
  epistle_ref: string | null;
  gospel_ref: string | null;
  epistle_text_pt: string | null;
  gospel_text_pt: string | null;
  troparion_slug: string | null;
  kontakion_slug: string | null;
  enrichment: string | null;
  source: string;
  status: string;
  scraped_at: string;
  approved_at: string | null;
  approved_by: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function corsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(),
  });
}

export function todayBrasilia(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

export function checkAdminAuth(request: Request, env: Env): { ok: boolean } {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return { ok: false };
  const token = auth.slice(7);
  // Timing-safe comparison to prevent timing attacks
  if (token.length !== env.ADMIN_TOKEN.length) return { ok: false };
  let result = 0;
  for (let i = 0; i < token.length; i++) {
    result |= token.charCodeAt(i) ^ env.ADMIN_TOKEN.charCodeAt(i);
  }
  return { ok: result === 0 };
}
