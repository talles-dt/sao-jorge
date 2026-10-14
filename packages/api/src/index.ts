// ☩ São Jorge V2 — Main Cloudflare Worker
// Entry point: HTTP API + Cron trigger
// Refactored from monolithic 500+ line file into modular routes.

import type { Env } from "./lib/types";
import { addBrasiliaDays, checkAdminAuth, corsHeaders, jsonResponse, todayBrasilia } from "./lib/types";
import { runScraper } from "./lib/scraper";
import { handleLiturgicalRoutes } from "./routes/liturgical";
import { handleContentRoutes } from "./routes/content";
import { handleAdminRoutes } from "./routes/admin";

function isAdminUiPath(path: string): boolean {
  return path === "/admin" || path.startsWith("/admin/") || path.startsWith("/_next/");
}

async function proxyAdminUi(request: Request, env: Env): Promise<Response> {
  const uiOrigin = env.ADMIN_UI_ORIGIN ?? "";
  if (!uiOrigin.startsWith("https://")) {
    return jsonResponse({ error: "Admin UI is not configured" }, 503, request);
  }

  const incoming = new URL(request.url);
  const target = new URL(`${incoming.pathname}${incoming.search}`, `${uiOrigin}/`);
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cookie");
  const upstream = await fetch(new Request(target, {
    method: request.method,
    headers,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
    redirect: "manual",
  }));
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete("set-cookie");
  responseHeaders.delete("content-security-policy");
  responseHeaders.set("cache-control", "no-store");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export default {
  // HTTP API
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }

    // Health check
    if (path === "/api/health") {
      return jsonResponse({
        ok: true,
        env: env.ENVIRONMENT,
        date: todayBrasilia(),
      });
    }

    // Serve the protected admin UI through the same Worker hostname as the
    // Access-protected API. This keeps the Access session first-party even
    // while the public website remains hosted on Vercel.
    if (isAdminUiPath(path)) {
      // The UI shell itself contains no parish data and is proxied here so
      // the browser's API calls are first-party. Every data read/write still
      // goes through /api/admin/*, which remains Access-protected.
      return proxyAdminUi(request, env);
    }

    // Route to handlers (order matters — first match wins)
    // 1. Liturgical routes
    const withRequestCors = (response: Response) => {
      const headers = new Headers(response.headers);
      for (const name of ["access-control-allow-origin", "access-control-allow-methods", "access-control-allow-headers", "access-control-allow-credentials", "content-type"]) headers.delete(name);
      for (const [name, value] of Object.entries(corsHeaders(request))) headers.set(name, value);
      return new Response(response.body, { status: response.status, headers });
    };
    const liturgicalResult = await handleLiturgicalRoutes(path, request, env);
    if (liturgicalResult) return withRequestCors(liturgicalResult);

    // 2. Content routes (services, blog, bulletin, catechesis, podcast)
    const contentResult = await handleContentRoutes(path, url, request, env);
    if (contentResult) return withRequestCors(contentResult);

    // 3. Admin routes
    const adminResult = await handleAdminRoutes(path, request, env);
    if (adminResult) return withRequestCors(adminResult);

    return jsonResponse({ error: "Not found" }, 404);
  },

  // Cron trigger — daily scraper
  async scheduled(
    _event: ScheduledEvent,
    env: Env,
    _ctx: ExecutionContext,
  ): Promise<void> {
    console.log(`[cron] ☩ São Jorge scraper — ${todayBrasilia()}`);
    try {
      await runScraper(env);
      // Invalidate ALL date caches (today + next 7 days)
      const today = todayBrasilia();
      for (let i = 0; i < 8; i++) {
        await env.DAY_CACHE.delete("day:" + addBrasiliaDays(today, i));
      }
    } catch (e: unknown) {
      console.error("[cron] Scraper failed:", (e as Error).message);
    }
  },
};
