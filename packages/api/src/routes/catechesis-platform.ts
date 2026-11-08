import type { Env } from "../lib/types";
import { jsonResponse } from "../lib/types";
import { boundedText, isEmail, isOneOf } from "../lib/validation";
import { randomToken, sessionCookie, sessionEmail, sha256, sendMagicLink } from "../lib/catechesis-auth";

const CONSENT_VERSION = "2026-11-08";
const uuid = () => crypto.randomUUID();

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try { return await request.json() as Record<string, unknown>; } catch { return null; }
}

export async function handleCatechesisPlatformRoutes(path: string, url: URL, request: Request, env: Env): Promise<Response | null> {
  if (path === "/api/catechesis-platform/modules" && request.method === "GET") {
    const modules = await env.DB.prepare(`
      SELECT m.slug, m.level, m.title, m.objective, m.description, v.id AS version_id,
        (SELECT json_group_array(json_object('number', t.meeting_number, 'title', t.title, 'objective', t.objective, 'scope_note', t.scope_note))
         FROM catechesis_topics t WHERE t.module_version_id = v.id ORDER BY t.meeting_number) AS topics
      FROM catechesis_modules m JOIN catechesis_module_versions v ON v.module_id = m.id
      WHERE m.status = 'published' AND v.status = 'published' ORDER BY CASE m.level WHEN 'basic' THEN 1 WHEN 'intermediate' THEN 2 ELSE 3 END
    `).all<Record<string, unknown>>();
    return jsonResponse({ data: modules.results.map((row) => ({ ...row, topics: JSON.parse(String(row.topics ?? "[]")) })) }, 200, request);
  }

  if (path === "/api/catechesis-platform/cohorts/open" && request.method === "GET") {
    const rows = await env.DB.prepare(`SELECT c.id, c.title, c.starts_on, c.ends_on, m.slug AS module_slug, m.title AS module_title FROM catechesis_cohorts c JOIN catechesis_module_versions v ON v.id = c.module_version_id JOIN catechesis_modules m ON m.id = v.module_id WHERE c.status = 'open' ORDER BY c.starts_on`).all();
    return jsonResponse({ data: rows.results }, 200, request);
  }

  if (path === "/api/catechesis-platform/applications" && request.method === "POST") {
    const body = await readBody(request);
    if (!body) return jsonResponse({ error: "JSON inválido." }, 400, request);
    const cohortId = typeof body.cohort_id === "string" ? body.cohort_id.trim() : "";
    const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const parish = typeof body.parish === "string" && body.parish.trim() ? body.parish.trim() : null;
    const attendance = body.attendance_preference;
    if (!boundedText(cohortId, 100) || !boundedText(fullName, 240) || !isEmail(email) || !boundedText(phone, 40) || (parish !== null && !boundedText(parish, 240)) || !isOneOf(attendance, ["presential", "online", "hybrid"] as const) || body.consent !== true) {
      return jsonResponse({ error: "Preencha os dados obrigatórios e aceite a política de privacidade." }, 400, request);
    }
    const cohort = await env.DB.prepare(`SELECT id FROM catechesis_cohorts WHERE id = ? AND status = 'open'`).bind(cohortId).first();
    if (!cohort) return jsonResponse({ error: "Turma não disponível para inscrição." }, 404, request);
    const now = new Date();
    try {
      await env.DB.prepare(`INSERT INTO catechesis_applications (id, cohort_id, full_name, email, phone, parish, attendance_preference, consent_version, consented_at, retention_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .bind(uuid(), cohortId, fullName, email, phone, parish, attendance, CONSENT_VERSION, now.toISOString(), new Date(now.getTime() + 365 * 86400000).toISOString()).run();
    } catch {
      return jsonResponse({ error: "Já existe uma inscrição deste e-mail para a turma." }, 409, request);
    }
    return jsonResponse({ ok: true, message: "Inscrição recebida para análise da equipe de catequese." }, 201, request);
  }

  if (path === "/api/catechesis-platform/auth/request" && request.method === "POST") {
    const body = await readBody(request);
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!isEmail(email)) return jsonResponse({ error: "E-mail inválido." }, 400, request);
    const enrollment = await env.DB.prepare(`SELECT id FROM catechesis_enrollments WHERE email = ? AND status = 'active' LIMIT 1`).bind(email).first();
    // The same response prevents account enumeration.
    if (enrollment) {
      const token = randomToken();
      const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();
      await env.DB.prepare(`INSERT INTO catechesis_magic_tokens (id, email, token_hash, expires_at) VALUES (?, ?, ?, ?)`).bind(uuid(), email, await sha256(token), expiresAt).run();
      const origin = env.CATECHESIS_WEB_ORIGIN ?? url.origin;
      const link = `${origin.replace(/\/$/, "")}/catequeses/area?token=${encodeURIComponent(token)}`;
      await sendMagicLink(env, email, link);
    }
    return jsonResponse({ ok: true, message: "Se o e-mail estiver matriculado, o link chegará em alguns minutos." }, 200, request);
  }

  if (path === "/api/catechesis-platform/auth/verify" && request.method === "POST") {
    const body = await readBody(request);
    const token = typeof body?.token === "string" ? body.token : "";
    if (!boundedText(token, 200)) return jsonResponse({ error: "Link inválido." }, 400, request);
    const hash = await sha256(token);
    const record = await env.DB.prepare(`SELECT id, email FROM catechesis_magic_tokens WHERE token_hash = ? AND used_at IS NULL AND expires_at > ? LIMIT 1`).bind(hash, new Date().toISOString()).first<{ id: string; email: string }>();
    if (!record) return jsonResponse({ error: "Link inválido ou expirado." }, 401, request);
    const sessionToken = randomToken();
    const expiresAt = new Date(Date.now() + 14 * 86400000).toISOString();
    const consumed = await env.DB.prepare(`UPDATE catechesis_magic_tokens SET used_at = ? WHERE id = ? AND used_at IS NULL`).bind(new Date().toISOString(), record.id).run();
    if ((consumed.meta?.changes ?? 0) !== 1) return jsonResponse({ error: "Link já utilizado." }, 401, request);
    await env.DB.prepare(`INSERT INTO catechesis_sessions (id, email, token_hash, expires_at) VALUES (?, ?, ?, ?)`)
      .bind(uuid(), record.email, await sha256(sessionToken), expiresAt).run();
    const response = jsonResponse({ ok: true }, 200, request);
    response.headers.append("Set-Cookie", sessionCookie(sessionToken, 14 * 86400));
    return response;
  }

  if (path === "/api/catechesis-platform/me" && request.method === "GET") {
    const email = await sessionEmail(request, env);
    if (!email) return jsonResponse({ error: "Não autenticado." }, 401, request);
    const enrollments = await env.DB.prepare(`SELECT e.id, e.cohort_id, e.status, c.title AS cohort_title, c.starts_on, c.ends_on, m.title AS module_title FROM catechesis_enrollments e JOIN catechesis_cohorts c ON c.id = e.cohort_id JOIN catechesis_module_versions v ON v.id = c.module_version_id JOIN catechesis_modules m ON m.id = v.module_id WHERE e.email = ? AND e.status = 'active'`).bind(email).all();
    const meetings = await env.DB.prepare(`SELECT mt.id, mt.cohort_id, mt.meeting_number, mt.starts_at, mt.ends_at, mt.recording_published_at, mt.recording_expires_at, t.title, CASE WHEN mt.live_url IS NOT NULL AND datetime('now') >= datetime(mt.starts_at, '-30 minutes') AND datetime('now') <= datetime(mt.ends_at) THEN 1 ELSE 0 END AS live_available FROM catechesis_meetings mt JOIN catechesis_topics t ON t.id = mt.topic_id JOIN catechesis_enrollments e ON e.cohort_id = mt.cohort_id WHERE e.email = ? AND e.status = 'active' ORDER BY mt.starts_at`).bind(email).all();
    return jsonResponse({ email, enrollments: enrollments.results, meetings: meetings.results }, 200, request);
  }

  const liveMatch = path.match(/^\/api\/catechesis-platform\/meetings\/([^/]+)\/live$/);
  if (liveMatch && request.method === "GET") {
    const email = await sessionEmail(request, env);
    if (!email) return jsonResponse({ error: "Não autenticado." }, 401, request);
    const row = await env.DB.prepare(`SELECT mt.live_url FROM catechesis_meetings mt JOIN catechesis_enrollments e ON e.cohort_id = mt.cohort_id WHERE mt.id = ? AND e.email = ? AND e.status = 'active' AND datetime('now') >= datetime(mt.starts_at, '-30 minutes') AND datetime('now') <= datetime(mt.ends_at)`).bind(liveMatch[1], email).first<{ live_url: string | null }>();
    if (!row?.live_url) return jsonResponse({ error: "A sala ainda não está disponível." }, 403, request);
    return jsonResponse({ url: row.live_url }, 200, request);
  }

  const recordingMatch = path.match(/^\/api\/catechesis-platform\/meetings\/([^/]+)\/recording$/);
  if (recordingMatch && request.method === "GET") {
    const email = await sessionEmail(request, env);
    if (!email) return jsonResponse({ error: "Não autenticado." }, 401, request);
    const row = await env.DB.prepare(`SELECT mt.recording_uid, COALESCE(x.new_expires_at, mt.recording_expires_at) AS expires_at FROM catechesis_meetings mt JOIN catechesis_enrollments e ON e.cohort_id = mt.cohort_id LEFT JOIN catechesis_access_extensions x ON x.enrollment_id = e.id AND x.meeting_id = mt.id WHERE mt.id = ? AND e.email = ? AND e.status = 'active' AND mt.recording_uid IS NOT NULL ORDER BY x.created_at DESC LIMIT 1`).bind(recordingMatch[1], email).first<{ recording_uid: string; expires_at: string }>();
    if (!row || !row.expires_at || row.expires_at <= new Date().toISOString()) return jsonResponse({ error: "A gravação não está disponível." }, 403, request);
    if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_STREAM_TOKEN || !env.CLOUDFLARE_STREAM_CUSTOMER_CODE) return jsonResponse({ error: "Vídeo não configurado." }, 503, request);
    const stream = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/${row.recording_uid}/token`, { method: "POST", headers: { Authorization: `Bearer ${env.CLOUDFLARE_STREAM_TOKEN}` } });
    const payload = await stream.json() as { success?: boolean; result?: { token?: string } };
    if (!stream.ok || !payload.success || !payload.result?.token) return jsonResponse({ error: "Não foi possível liberar o vídeo." }, 502, request);
    return jsonResponse({ iframe_url: `https://customer-${env.CLOUDFLARE_STREAM_CUSTOMER_CODE}.cloudflarestream.com/${payload.result.token}/iframe` }, 200, request);
  }

  return null;
}
