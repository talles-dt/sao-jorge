// ☩ São Jorge V2 — Public content routes (services, blog, bulletin, catechesis, podcast)

import type { Env } from "../lib/types";
import { jsonResponse } from "../lib/types";
import { boundedText, isEmail, isIsoDate, normalizeLimit } from "../lib/validation";

const CONSENT_VERSION = "2026-10-13";
const PRIVACY_POLICY_VERSION = "2026-10-13";

async function consumeSignupRateLimit(env: Env, key: string, max: number): Promise<boolean> {
  const windowStart = new Date().toISOString().slice(0, 13);
  const result = await env.DB.prepare(`
    INSERT INTO signup_rate_limits (rate_key, window_start, request_count)
    VALUES (?, ?, 1)
    ON CONFLICT(rate_key) DO UPDATE SET
      window_start = excluded.window_start,
      request_count = CASE
        WHEN signup_rate_limits.window_start <> excluded.window_start THEN 1
        ELSE signup_rate_limits.request_count + 1
      END
    WHERE signup_rate_limits.window_start <> excluded.window_start
       OR signup_rate_limits.request_count < ?
  `).bind(key, windowStart, max).run();
  return (result.meta?.changes ?? 0) > 0;
}

async function releaseSignupRateLimit(env: Env, key: string): Promise<void> {
  await env.DB.prepare(`UPDATE signup_rate_limits SET request_count = MAX(request_count - 1, 0) WHERE rate_key = ?`).bind(key).run();
}

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
    const slug = path.split("/api/services/")[1]?.replace(/\//g, "") ?? "";
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
    const limit = normalizeLimit(url.searchParams.get("limit"), 10);
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
    const limit = normalizeLimit(url.searchParams.get("limit"), 20);
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
      `SELECT slug, title, description, order_index, body FROM catechesis_units ORDER BY order_index ASC`,
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
      `SELECT slug, title, order_index, status, body, group_label FROM catechesis_lessons WHERE unit_slug = ? AND status = 'published' ORDER BY order_index`,
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

  // Catechesis signup (public registration form)
  if (path === "/api/catechesis-signup" && request.method === "POST") {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return jsonResponse({ error: "JSON inválido" }, 400);
    }

    const unitSlug = typeof body.unit_slug === "string" ? body.unit_slug.trim() : "";
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const agreedToTerms = body.agreed_to_terms === true;
    const phone = body.phone === undefined || body.phone === null || body.phone === "" ? null : body.phone;
    const birthDate = body.birth_date === undefined || body.birth_date === null || body.birth_date === "" ? null : body.birth_date;
    const previousReligion = body.previous_religion === undefined || body.previous_religion === null || body.previous_religion === "" ? null : body.previous_religion;
    const motivation = body.motivation === undefined || body.motivation === null || body.motivation === "" ? null : body.motivation;

    if (!boundedText(unitSlug, 160) || !boundedText(fullName, 240) || !isEmail(email) ||
      (phone !== null && !boundedText(phone, 40, false)) ||
      (birthDate !== null && (!isIsoDate(birthDate) || !boundedText(birthDate, 10))) ||
      (previousReligion !== null && !boundedText(previousReligion, 240, false)) ||
      (motivation !== null && !boundedText(motivation, 4000, false))) {
      return jsonResponse(
        { error: "Os dados da inscrição são inválidos." },
        400,
      );
    }
    if (!agreedToTerms) {
      return jsonResponse(
        { error: "É necessário concordar em participar dos encontros e observar os jejuns." },
        400,
      );
    }
    const unit = await env.DB.prepare(
      `SELECT slug FROM catechesis_units WHERE slug = ?`,
    ).bind(unitSlug).first();
    if (!unit) return jsonResponse({ error: "Unidade não encontrada." }, 404);

    // Atomic D1 rate limiting: max 3 signups per IP per hour.
    const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
    const ipKey = `ip:${ip}`;
    if (!(await consumeSignupRateLimit(env, ipKey, 3))) {
      return jsonResponse(
        { error: "Limite de inscrições por hora atingido. Tente novamente mais tarde." },
        429,
      );
    }
    const emailKey = `email:${email}`;
    const recentEmail = await env.DB.prepare(`SELECT id FROM catechesis_signups WHERE email = ? AND deleted_at IS NULL AND created_at >= datetime('now', '-1 day') LIMIT 1`).bind(email).first();
    if (recentEmail || !(await consumeSignupRateLimit(env, emailKey, 1))) {
      await releaseSignupRateLimit(env, ipKey);
      return jsonResponse(
        { error: "Este e-mail já foi inscrito recentemente." },
        409,
      );
    }
    const retentionUntil = new Date(Date.now() + 365 * 86400000).toISOString();
    try {
      await env.DB.prepare(
      `INSERT INTO catechesis_signups (unit_slug, full_name, email, phone, birth_date, previous_religion, motivation, agreed_to_terms, consent_version, consented_at, privacy_policy_version, retention_until)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        unitSlug,
        fullName,
        email,
        phone,
        birthDate,
        previousReligion,
        motivation,
        1, CONSENT_VERSION, new Date().toISOString(), PRIVACY_POLICY_VERSION, retentionUntil,
      ).run();
    } catch (error) {
      await releaseSignupRateLimit(env, ipKey);
      await releaseSignupRateLimit(env, emailKey);
      console.error("[signup] persistence failed", error instanceof Error ? error.message : "unknown error");
      return jsonResponse({ error: "Não foi possível concluir a inscrição." }, 500);
    }

    return jsonResponse({ ok: true });
  }

  return null;
}
