// ☩ São Jorge V2 — Admin routes

import type { Env } from "../lib/types";
import { jsonResponse, checkAdminAuth } from "../lib/types";
import { runScraper } from "../lib/scraper";
import { boundedText, isBoundedStringArray, isIsoDate, isOneOf, normalizeLimit } from "../lib/validation";
import { getZernioClient, listZernioAccounts, createZernioPost, listZernioPosts, getZernioAnalytics, listZernioInboxConversations, sendZernioMessage } from "@sao-jorge/shared/zernio";

async function audit(env: Env, actor: { sub: string; email?: string }, action: string, resourceType: string, resourceId?: string, metadata?: Record<string, unknown>) {
  await env.DB.prepare(`INSERT INTO admin_audit_events (actor_subject, actor_email, action, resource_type, resource_id, metadata) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(actor.sub, actor.email ?? null, action, resourceType, resourceId ?? null, metadata ? JSON.stringify(metadata) : null).run();
}

export async function handleAdminRoutes(
  path: string,
  request: Request,
  env: Env,
): Promise<Response | null> {
  if (!path.startsWith("/api/admin/")) return null;

  const auth = await checkAdminAuth(request, env);
  if (!auth) {
    return jsonResponse({ error: "Unauthorized" }, 401, request);
  }
  if (auth === "forbidden") {
    return jsonResponse({ error: "Forbidden" }, 403, request);
  }

  if (path === "/api/admin/catechesis-signups" && request.method === "GET") {
    const returnTo = new URL(request.url).searchParams.get("return_to");
    const requestOrigin = new URL(request.url).origin;
    const sameWorkerAdminUrl = `${requestOrigin}/admin`;
    if (returnTo && ((env.ADMIN_UI_URL && returnTo === env.ADMIN_UI_URL) || returnTo === sameWorkerAdminUrl)) {
      return Response.redirect(returnTo, 303);
    }
    const rows = await env.DB.prepare(`SELECT id, unit_slug, full_name, email, phone, birth_date, previous_religion, motivation, consent_version, consented_at, privacy_policy_version, retention_until, created_at FROM catechesis_signups WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 100`).all();
    await audit(env, auth, "read", "catechesis_signup");
    return jsonResponse({ data: rows.results, accessed_by: auth.email ?? auth.sub }, 200, request);
  }

  if (path === "/api/admin/catechesis-signups/delete" && request.method === "POST") {
    const body = (await request.json()) as { id?: number };
    if (!Number.isInteger(body.id)) return jsonResponse({ error: "id required" }, 400, request);
    await env.DB.prepare(`UPDATE catechesis_signups SET deleted_at = ? WHERE id = ?`).bind(new Date().toISOString(), body.id).run();
    await audit(env, auth, "delete", "catechesis_signup", String(body.id));
    return jsonResponse({ ok: true, deleted_by: auth.email ?? auth.sub }, 200, request);
  }

  // Admin: manual liturgical day override
  if (path === "/api/admin/liturgical" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    const { date, ...data } = body;
    const validDate = isIsoDate(date);
    const tone = Number(data.tone_of_week ?? 1);
    const feastLevel = Number(data.feast_level ?? 0);
    const fastTypes = new Set(["none", "strict", "fish", "wine-oil", "xerophagy"]);
    const status = data.status ?? "approved";
    if (!validDate || !Number.isInteger(tone) || tone < 1 || tone > 8 || !Number.isInteger(feastLevel) || feastLevel < 0 || feastLevel > 6 || !fastTypes.has(String(data.fast_type ?? "none")) || !isOneOf(status, ["pending", "approved", "published"] as const) || !boundedText(data.feast_name_pt, 240) || (data.feast_name_ar !== undefined && !boundedText(data.feast_name_ar, 240, false)) || (data.epistle_ref !== undefined && !boundedText(data.epistle_ref, 160, false)) || (data.gospel_ref !== undefined && !boundedText(data.gospel_ref, 160, false))) {
      return jsonResponse({ error: "Invalid liturgical day payload" }, 400, request);
    }
    await env.DB.prepare(
      `INSERT OR REPLACE INTO liturgical_days (date, tone_of_week, fast_type, feast_level, feast_name_pt, feast_name_ar, epistle_ref, gospel_ref, source, status, scraped_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).bind(
      date,
      tone,
      data.fast_type ?? "none",
      feastLevel,
      data.feast_name_pt,
      data.feast_name_ar,
      data.epistle_ref,
      data.gospel_ref,
      "manual-override",
      status,
      new Date().toISOString(),
    ).run();
    await env.DAY_CACHE.delete(`day:${String(date)}`);
    await audit(env, auth, "update", "liturgical_day", String(date), { source: "manual-override", status });
    // The public "today" route uses the same date-key; this single purge is
    // sufficient and avoids pretending that a second cache namespace exists.
    const updated = await env.DB.prepare(`SELECT * FROM liturgical_days WHERE date = ?`).bind(date).first();
    return jsonResponse({ ok: true, data: updated, cache_status: "purged", updated_by: auth.email ?? auth.sub }, 200, request);
  }

  // Admin: blog post create/update
  if (path === "/api/admin/blog" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    if (!boundedText(body.slug, 160) || !boundedText(body.title, 240) || !boundedText(body.excerpt, 1000) || !boundedText(body.body, 200000) || !boundedText(body.author, 160) || !boundedText(body.category, 40) || (body.status !== undefined && !isOneOf(body.status, ["draft", "published"] as const)) || (body.tags !== undefined && !isBoundedStringArray(body.tags, 80, 30))) {
      return jsonResponse({ error: "Invalid blog payload" }, 400, request);
    }
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
    await audit(env, auth, "upsert", "blog_post", String(body.slug), { status: body.status ?? "draft" });
    return jsonResponse({ ok: true });
  }

  // Admin: bulletin create/update
  if (path === "/api/admin/bulletin" && request.method === "POST") {
    const body = (await request.json()) as Record<string, unknown>;
    if (!boundedText(body.title, 240) || !boundedText(body.body, 200000) || !isOneOf(body.category, ["announcement", "event", "pastoral"] as const) || !isIsoDate(body.publish_date) || (body.expires_date !== undefined && body.expires_date !== null && !isIsoDate(body.expires_date)) || (body.status !== undefined && !isOneOf(body.status, ["pending", "published"] as const))) {
      return jsonResponse({ error: "Invalid bulletin payload" }, 400, request);
    }
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
    await audit(env, auth, "upsert", "bulletin", String(body.title), { status: body.status ?? "pending" });
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
    if (!boundedText(body.slug, 160) || !boundedText(body.title_pt, 240) || !boundedText(body.category, 60) || (body.status !== undefined && !isOneOf(body.status, ["pending", "approved", "published"] as const)) || (body.sections !== undefined && typeof body.sections !== "string" && !Array.isArray(body.sections))) {
      return jsonResponse({ error: "Invalid service-text payload" }, 400, request);
    }
    const catalogEntry = await env.DB.prepare(`SELECT slug FROM service_catalog WHERE slug = ?`).bind(body.slug).first();
    if (!catalogEntry) return jsonResponse({ error: "Service catalog entry not found" }, 400, request);
    const now = new Date().toISOString();
    const sections =
      typeof body.sections === "string"
        ? body.sections
        : JSON.stringify(body.sections ?? []);
    if (sections.length > 200000) return jsonResponse({ error: "Invalid service-text payload" }, 400, request);
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
      body.status === "published" ? auth.sub : null,
    ).run();
    await audit(env, auth, "create", "service_text", `${String(body.slug)}:v${version}`, { status: body.status ?? "pending" });
    return jsonResponse({ ok: true, version });
  }

  // Admin: service-texts update
  if (path === "/api/admin/service-texts" && request.method === "PUT") {
    const body = (await request.json()) as Record<string, unknown>;
    if (!Number.isInteger(body.id) || !boundedText(body.title_pt, 240) || !boundedText(body.category, 60) || (body.status !== undefined && !isOneOf(body.status, ["pending", "approved", "published"] as const)) || (body.sections !== undefined && typeof body.sections !== "string" && !Array.isArray(body.sections))) {
      return jsonResponse({ error: "Invalid service-text payload" }, 400, request);
    }
    const now = new Date().toISOString();
    const sections =
      typeof body.sections === "string"
        ? body.sections
        : JSON.stringify(body.sections ?? []);
    if (sections.length > 200000) return jsonResponse({ error: "Invalid service-text payload" }, 400, request);
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
      body.status === "published" ? auth.sub : null,
      body.id,
    ).run();
    await audit(env, auth, "update", "service_text", String(body.id), { status: body.status ?? "pending" });
    return jsonResponse({ ok: true });
  }

  // Admin: trigger scraper manually
  if (path === "/api/admin/scrape-now" && request.method === "POST") {
    await runScraper(env);
    return jsonResponse({ ok: true, triggered: "scraper" });
  }

  // ─── Zernio Admin Routes ────────────────────────────────────────────────

  // Zernio: list connected accounts
  if (path === "/api/admin/zernio/accounts" && request.method === "GET") {
    try {
      const accounts = await listZernioAccounts();
      return jsonResponse(accounts);
    } catch (e: unknown) {
      console.error("[admin] zernio accounts failed", (e as Error).message);
      return jsonResponse({ error: "Internal server error" }, 500, request);
    }
  }

  // Zernio: list posts
  if (path === "/api/admin/zernio/posts" && request.method === "GET") {
    try {
      const url = new URL(request.url);
      const params = {
        status: url.searchParams.get("status") || undefined,
        platform: url.searchParams.get("platform") || undefined,
        accountId: url.searchParams.get("accountId") || undefined,
        limit: normalizeLimit(url.searchParams.get("limit"), 20, 100),
        offset: Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0),
      };
      const posts = await listZernioPosts(params);
      return jsonResponse(posts);
    } catch (e: unknown) {
      console.error("[admin] zernio posts failed", (e as Error).message);
      return jsonResponse({ error: "Internal server error" }, 500, request);
    }
  }

  // Zernio: create post
  if (path === "/api/admin/zernio/posts" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        content: string;
        platforms: { platform: string; accountId: string }[];
        scheduledFor?: string;
        publishNow?: boolean;
      };
      const result = await createZernioPost(body);
      return jsonResponse(result);
    } catch (e: unknown) {
      console.error("[admin] zernio analytics failed", (e as Error).message);
      return jsonResponse({ error: "Internal server error" }, 500, request);
    }
  }

  // Zernio: analytics
  if (path === "/api/admin/zernio/analytics" && request.method === "GET") {
    try {
      const url = new URL(request.url);
      const params = {
        platform: url.searchParams.get("platform") || undefined,
        accountId: url.searchParams.get("accountId") || undefined,
        from: url.searchParams.get("from") || undefined,
        to: url.searchParams.get("to") || undefined,
      };
      const analytics = await getZernioAnalytics(params);
      return jsonResponse(analytics);
    } catch (e: unknown) {
      console.error("[admin] zernio inbox failed", (e as Error).message);
      return jsonResponse({ error: "Internal server error" }, 500, request);
    }
  }

  // Zernio: inbox conversations
  if (path === "/api/admin/zernio/inbox" && request.method === "GET") {
    try {
      const url = new URL(request.url);
      const params = {
        platform: url.searchParams.get("platform") || undefined,
        accountId: url.searchParams.get("accountId") || undefined,
        status: url.searchParams.get("status") || undefined,
        limit: normalizeLimit(url.searchParams.get("limit"), 20, 100),
        offset: Math.max(0, Number.parseInt(url.searchParams.get("offset") ?? "0", 10) || 0),
      };
      const conversations = await listZernioInboxConversations(params);
      return jsonResponse(conversations);
    } catch (e: unknown) {
      console.error("[admin] zernio message failed", (e as Error).message);
      return jsonResponse({ error: "Internal server error" }, 500, request);
    }
  }

  // Zernio: send message
  if (path === "/api/admin/zernio/inbox/send" && request.method === "POST") {
    try {
      const body = (await request.json()) as {
        conversationId: string;
        content: string;
        mediaIds?: string[];
      };
      const result = await sendZernioMessage(body.conversationId, body.content, body.mediaIds);
      return jsonResponse(result);
    } catch (e: unknown) {
      console.error("[admin] zernio publish failed", (e as Error).message);
      return jsonResponse({ error: "Internal server error" }, 500, request);
    }
  }

  return jsonResponse({ error: "Not found" }, 404);
}
