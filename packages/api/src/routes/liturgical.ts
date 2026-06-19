// ☩ São Jorge V2 — Liturgical day routes

import type { Env, LiturgicalDayRow } from "../lib/types";
import { jsonResponse, todayBrasilia } from "../lib/types";

async function handleDayToday(env: Env): Promise<Response> {
  const today = todayBrasilia();
  const cached = await env.DAY_CACHE.get(`day:${today}`);
  if (cached) return jsonResponse(JSON.parse(cached));

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
  const data = { ...row, enrichment: enrichmentData };
  await env.DAY_CACHE.put(`day:${today}`, JSON.stringify(data), {
    expirationTtl: 86400,
  });
  return jsonResponse(data);
}

async function handleDayByDate(date: string, env: Env): Promise<Response> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonResponse({ error: "Invalid date format" }, 400);
  }
  const cached = await env.DAY_CACHE.get(`day:${date}`);
  if (cached) return jsonResponse(JSON.parse(cached));

  const row = await env.DB.prepare(
    `SELECT * FROM liturgical_days WHERE date = ?`,
  )
    .bind(date)
    .first<LiturgicalDayRow>();

  if (!row) return jsonResponse({ error: "Not found", date }, 404);

  const data = {
    ...row,
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
    expirationTtl: 86400,
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
