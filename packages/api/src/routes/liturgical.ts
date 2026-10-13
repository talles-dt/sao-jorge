// ☩ São Jorge V2 — Liturgical day routes

import type { Env, LiturgicalDayRow } from "../lib/types";
import { jsonResponse, todayBrasilia } from "../lib/types";
import { isIsoDate } from "../lib/validation";

async function handleDayToday(env: Env): Promise<Response> {
  const today = todayBrasilia();
  const cached = await env.DAY_CACHE.get(`day:${today}`);
  if (cached) {
    try { return jsonResponse({ ...JSON.parse(cached), cache_status: "hit" }); }
    catch { await env.DAY_CACHE.delete(`day:${today}`); }
  }

  const row = await env.DB.prepare(
    `SELECT * FROM liturgical_days WHERE date = ?`,
  )
    .bind(today)
    .first<LiturgicalDayRow>();

  if (!row) return jsonResponse({ error: "No data for today", date: today }, 404);

  let enrichmentData: unknown = null;
  if (row.enrichment) {
    try {
      enrichmentData = JSON.parse(row.enrichment);
    } catch {
      enrichmentData = row.enrichment;
    }
  }
  const data = { ...row, enrichment: enrichmentData, updated_at: row.scraped_at, revision: `${row.date}:${row.scraped_at}`, cache_status: "miss" };
  await env.DAY_CACHE.put(`day:${today}`, JSON.stringify(data), {
    expirationTtl: 300,
  });
  return jsonResponse(data);
}

async function handleDayByDate(date: string, env: Env): Promise<Response> {
  if (!isIsoDate(date)) {
    return jsonResponse({ error: "Invalid date format" }, 400);
  }
  const cached = await env.DAY_CACHE.get(`day:${date}`);
  if (cached) {
    try { return jsonResponse({ ...JSON.parse(cached), cache_status: "hit" }); }
    catch { await env.DAY_CACHE.delete(`day:${date}`); }
  }

  const row = await env.DB.prepare(
    `SELECT * FROM liturgical_days WHERE date = ?`,
  )
    .bind(date)
    .first<LiturgicalDayRow>();

  if (!row) return jsonResponse({ error: "Not found", date }, 404);

  const data = {
    ...row,
    updated_at: row.scraped_at,
    revision: `${row.date}:${row.scraped_at}`,
    cache_status: "miss",
    enrichment: row.enrichment
      ? (() => {
          try {
            return JSON.parse(row.enrichment);
          } catch {
            return null;
          }
        })()
      : null,
  };
  await env.DAY_CACHE.put(`day:${date}`, JSON.stringify(data), {
    expirationTtl: 300,
  });
  return jsonResponse(data);
}

export async function handleLiturgicalRoutes(
  path: string,
  request: Request,
  env: Env,
): Promise<Response | null> {
  if (path === "/api/day/today" && request.method === "GET") {
    return handleDayToday(env);
  }

  if (path.startsWith("/api/day/") && request.method === "GET") {
    const date = path.split("/api/day/")[1] ?? "";
    return handleDayByDate(date, env);
  }

  return null;
}
