// ☩ São Jorge V2 — Shared types (inline to avoid bundler issues with shared package)

import { createRemoteJWKSet, jwtVerify } from "jose";

export interface Env {
  DB: D1Database;
  DAY_CACHE: KVNamespace;
  MEDIA: R2Bucket;
  AI: Ai;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUDIENCE: string;
  ACCESS_ADMIN_ROLE?: string;
  ACCESS_ADMIN_EMAILS?: string;
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

const ALLOWED_ORIGINS = new Set([
  "https://sao-jorge-iota.vercel.app",
  "https://sao-jorge.oliceu.com",
  "https://ortodoxiacwb.oliceu.com",
  "http://localhost:3000",
]);

export function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://sao-jorge.oliceu.com",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Cf-Access-Jwt-Assertion",
    "Access-Control-Allow-Credentials": "true",
    "Content-Type": "application/json",
  };
}

export function jsonResponse(data: unknown, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(request),
  });
}

export function todayBrasilia(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
}

export function addBrasiliaDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}-${String(value.getUTCDate()).padStart(2, "0")}`;
}

export interface AdminContext { sub: string; email?: string; roles: string[]; issuedAt?: number }

export async function checkAdminAuth(request: Request, env: Env): Promise<AdminContext | "forbidden" | null> {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUDIENCE) return null;
  try {
    const issuer = `https://${env.ACCESS_TEAM_DOMAIN}`;
    const jwks = createRemoteJWKSet(new URL(`${issuer}/cdn-cgi/access/certs`));
    const { payload } = await jwtVerify(token, jwks, { issuer, audience: env.ACCESS_AUDIENCE });
    if (typeof payload.sub !== "string") return null;
    const roles = Array.isArray(payload.roles) ? payload.roles.filter((r): r is string => typeof r === "string") : [];
    const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
    const configuredEmails = (env.ACCESS_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
    const roleAllowed = Boolean(env.ACCESS_ADMIN_ROLE && roles.includes(env.ACCESS_ADMIN_ROLE));
    const emailAllowed = Boolean(email && configuredEmails.includes(email));
    if (env.ACCESS_ADMIN_ROLE && !roleAllowed && !emailAllowed) return "forbidden";
    return { sub: payload.sub, email, roles, issuedAt: payload.iat };
  } catch { return null; }
}
