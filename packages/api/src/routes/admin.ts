// ☩ São Jorge V2 — Admin routes

import type { Env } from "../lib/types";
import { jsonResponse, checkAdminAuth, todayBrasilia } from "../lib/types";
import { runScraper } from "../lib/scraper";

export async function handleAdminRoutes(
  path: string,
  request: Request,
  env: Env,
): Promise<Response | null> {
  if (!path.startsWith("/api/admin/")) return null;

  const auth = checkAdminAuth(request, env);
  if (!auth.ok) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  // Admin: manual liturgical day override
  if (path === "/api/admin/liturgical" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    const { date, ...data } = body;
    await env.DB.prepare(
      `INSERT OR REPLACE INTO liturgical_days (date, tone_of_week, fast_type, feast_level, feast_name_pt, feast_name_ar, epistle_ref, gospel_ref, source, status, scraped_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      date,
      data.tone_of_week ?? 1,
      data.fast_type ?? "none",
      data.feast_level ?? 0,
      data.feast_name_pt,
      data.feast_name_ar,
      data.epistle_ref,
      data.gospel_ref,
      "manual-override",
      data.status ?? "approved",
      new Date().toISOString(),
    ).run();
    return jsonResponse({ ok: true });
  }

  // Admin: blog post create/update
  if (path === "/api/admin/blog" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT OR REPLACE INTO blog_posts (slug, title, excerpt, body, author, category, tags, status, published_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      body.slug,
      body.title,
      body.excerpt,
      body.body,
      body.author,
      body.category,
      JSON.stringify(body.tags ?? []),
      body.status ?? "draft",
      body.status === "published" ? now : body.published_at,
      now,
    ).run();
    return jsonResponse({ ok: true });
  }

  // Admin: bulletin create/update
  if (path === "/api/admin/bulletin" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    await env.DB.prepare(
      `INSERT OR REPLACE INTO bulletins (title, body, category, publish_date, expires_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(
      body.title,
      body.body,
      body.category,
      body.publish_date,
      body.expires_date ?? null,
      body.status ?? "pending",
    ).run();
    return jsonResponse({ ok: true });
  }

  // Admin: service-texts list
  if (path === "/api/admin/service-texts" && request.method === "GET") {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug") ?? "";
    if (slug) {
      const rows = await env.DB.prepare(
        `SELECT id, slug, title_pt, title_ar, title_ar_transliterated, category, subcategory, status, version, source_booklet_pages, updated_at, approved_at FROM service_texts WHERE slug = ? ORDER BY version DESC`,
      )
        .bind(slug)
        .all();
      return jsonResponse(rows.results);
    }
    const rows = await env.DB.prepare(
      `SELECT st.id, st.slug, st.title_pt, st.status, st.version, st.updated_at, sc.title_pt AS catalog_title_pt FROM service_texts st LEFT JOIN service_catalog sc ON st.slug = sc.slug ORDER BY st.slug, st.version DESC`,
    ).all();
    return jsonResponse(rows.results);
  }

  // Admin: service-texts create
  if (path === "/api/admin/service-texts" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const sections =
      typeof body.sections === "string"
        ? body.sections
        : JSON.stringify(body.sections ?? []);
    const currentVersion = await env.DB.prepare(
      `SELECT MAX(version) as max_v FROM service_texts WHERE slug = ?`,
    )
      .bind(body.slug)
      .first<{ max_v: number | null }>();
    const version = (currentVersion?.max_v ?? 0) + 1;
    await env.DB.prepare(
      `INSERT INTO service_texts (slug, title_pt, title_ar, title_ar_transliterated, category, subcategory, sections, status, version, source_booklet_pages, updated_at, approved_at, approved_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      body.slug,
      body.title_pt,
      body.title_ar ?? null,
      body.title_ar_transliterated ?? null,
      body.category,
      body.subcategory ?? null,
      sections,
      body.status ?? "pending",
      version,
      body.source_booklet_pages ?? null,
      now,
      body.status === "published" ? now : null,
      body.status === "published" ? "admin" : null,
    ).run();
    return jsonResponse({ ok: true, version });
  }

  // Admin: service-texts update
  if (path === "/api/admin/service-texts" && request.method === "PUT") {
    const body = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const sections =
      typeof body.sections === "string"
        ? body.sections
        : JSON.stringify(body.sections ?? []);
    await env.DB.prepare(
      `UPDATE service_texts SET title_pt = ?, title_ar = ?, title_ar_transliterated = ?, category = ?, subcategory = ?, sections = ?, status = ?, source_booklet_pages = ?, updated_at = ?, approved_at = ?, approved_by = ? WHERE id = ?`,
    ).bind(
      body.title_pt,
      body.title_ar ?? null,
      body.title_ar_transliterated ?? null,
      body.category,
      body.subcategory ?? null,
      sections,
      body.status ?? "pending",
      body.source_booklet_pages ?? null,
      now,
      body.status === "published" ? now : null,
      body.status === "published" ? "admin" : null,
      body.id,
    ).run();
    return jsonResponse({ ok: true });
  }

  // Admin: trigger scraper manually
  if (path === "/api/admin/scrape-now" && request.method === "POST") {
    await runScraper(env);
    return jsonResponse({ ok: true, triggered: "scraper" });
  }

  return jsonResponse({ error: "Not found" }, 404);
}
