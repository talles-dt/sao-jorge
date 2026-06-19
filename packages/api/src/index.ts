// ☩ São Jorge V2 — Main Cloudflare Worker
// Entry point: HTTP API + Cron trigger
// Refactored from monolithic 500+ line file into modular routes.

import type { Env } from "./lib/types";
import { corsHeaders, jsonResponse, todayBrasilia } from "./lib/types";
import { runScraper } from "./lib/scraper";
import { handleLiturgicalRoutes } from "./routes/liturgical";
import { handleContentRoutes } from "./routes/content";
import { handleAdminRoutes } from "./routes/admin";

export default {
  // HTTP API
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Health check
    if (path === "/api/health") {
      return jsonResponse({
        ok: true,
        env: env.ENVIRONMENT,
        date: todayBrasilia(),
      });
    }

    // Route to handlers (order matters — first match wins)
    // 1. Liturgical routes
    const liturgicalResult = await handleLiturgicalRoutes(path, request, env);
    if (liturgicalResult) return liturgicalResult;

    // 2. Content routes (services, blog, bulletin, catechesis, podcast)
    const contentResult = await handleContentRoutes(path, url, request, env);
    if (contentResult) return contentResult;

    // 3. Admin routes
    const adminResult = await handleAdminRoutes(path, request, env);
    if (adminResult) return adminResult;

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
      await env.DAY_CACHE.delete("day:" + todayBrasilia());
    } catch (e: unknown) {
      console.error("[cron] Scraper failed:", (e as Error).message);
    }
  },
};
