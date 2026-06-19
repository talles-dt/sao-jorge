// ☩ São Jorge V2 — Public content routes (services, blog, bulletin, catechesis, podcast)

import type { Env } from "../lib/types";
import { jsonResponse } from "../lib/types";

export async function handleContentRoutes(
  path: string,
  url: URL,
  request: Request,
  env: Env,
): Promise<Response | null> {
  // Services catalog
  if (path === "/api/services" && request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT slug, title_pt, title_ar, category, subcategory, sort_order FROM service_catalog ORDER BY sort_order ASC`,
    ).all();
    return jsonResponse(rows.results);
  }

  // Single service
  if (path.startsWith("/api/services/") && request.method === "GET") {
    const slug = path.split("/api/services/")[1]?.replace("/", "") ?? "";
    const row = await env.DB.prepare(
      `SELECT st.*, sc.title_pt AS catalog_title_pt, sc.title_ar AS catalog_title_ar FROM service_texts st LEFT JOIN service_catalog sc ON st.slug = sc.slug WHERE st.slug = ? AND st.status = 'published' ORDER BY st.version DESC LIMIT 1`,
    )
      .bind(slug)
      .first();
    if (!row) return jsonResponse({ error: "Service not found" }, 404);
    const sections = row.sections ? JSON.parse(row.sections as string) : [];
    return jsonResponse({ ...row, sections });
  }

  // Blog list
  if (path === "/api/blog" && request.method === "GET") {
    const limit = parseInt(url.searchParams.get("limit") ?? "10");
    const rows = await env.DB.prepare(
      `SELECT slug, title, excerpt, author, category, tags, published_at, created_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC LIMIT ?`,
    )
      .bind(limit)
      .all();
    return jsonResponse(rows.results);
  }

  // Single blog post
  if (path.startsWith("/api/blog/") && request.method === "GET") {
    const slug = path.split("/api/blog/")[1]?.replace("/", "") ?? "";
    const row = await env.DB.prepare(
      `SELECT * FROM blog_posts WHERE slug = ? AND status = 'published' LIMIT 1`,
    )
      .bind(slug)
      .first();
    if (!row) return jsonResponse({ error: "Post not found" }, 404);
    return jsonResponse(row);
  }

  // Bulletins
  if (path === "/api/bulletin" && request.method === "GET") {
    const limit = parseInt(url.searchParams.get("limit") ?? "20");
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "America/Sao_Paulo",
    });
    const rows = await env.DB.prepare(
      `SELECT id, title, body, category, publish_date FROM bulletins WHERE status = 'published' AND publish_date <= ? AND (expires_date IS NULL OR expires_date >= ?) ORDER BY publish_date DESC LIMIT ?`,
    )
      .bind(today, today, limit)
      .all();
    return jsonResponse(rows.results);
  }

  // Catechesis units
  if (path === "/api/catechesis" && request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT slug, title, description, order_index FROM catechesis_units ORDER BY order_index ASC`,
    ).all();
    return jsonResponse(rows.results);
  }

  // Single catechesis unit with lessons
  if (path.startsWith("/api/catechesis/") && request.method === "GET") {
    const slug = path.split("/api/catechesis/")[1]?.replace("/", "") ?? "";
    const unit = await env.DB.prepare(
      `SELECT * FROM catechesis_units WHERE slug = ?`,
    )
      .bind(slug)
      .first();
    if (!unit) return jsonResponse({ error: "Unit not found" }, 404);
    const lessons = await env.DB.prepare(
      `SELECT slug, title, order_index, status FROM catechesis_lessons WHERE unit_slug = ? AND status = 'published' ORDER BY order_index`,
    )
      .bind(slug)
      .all();
    return jsonResponse({ ...unit, lessons: lessons.results });
  }

  // Podcast
  if (path === "/api/podcast" && request.method === "GET") {
    const rows = await env.DB.prepare(
      `SELECT guid, title, description, published_at, duration_sec, spotify_url, buzzsprout_url FROM podcast_episodes ORDER BY published_at DESC LIMIT 10`,
    ).all();
    return jsonResponse(rows.results);
  }

  return null;
}
