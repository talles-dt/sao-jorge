import type { Env } from "../lib/types";
import { checkAdminAuth, jsonResponse } from "../lib/types";
import { boundedText, isIsoDate, isOneOf } from "../lib/validation";
import { recordingPublication } from "../lib/catechesis-recording";

async function audit(env: Env, actor: { sub: string; email?: string }, action: string, resource: string, resourceId?: string, metadata?: unknown) {
  await env.DB.prepare(`INSERT INTO admin_audit_events (actor_subject, actor_email, action, resource_type, resource_id, metadata) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(actor.sub, actor.email ?? null, action, resource, resourceId ?? null, metadata ? JSON.stringify(metadata) : null).run();
}

export async function handleCatechesisAdminRoutes(path: string, request: Request, env: Env): Promise<Response | null> {
  if (!path.startsWith("/api/admin/catechesis-platform")) return null;
  const auth = await checkAdminAuth(request, env);
  if (!auth) return jsonResponse({ error: "Unauthorized" }, 401, request);
  if (auth === "forbidden") return jsonResponse({ error: "Forbidden" }, 403, request);

  if (path === "/api/admin/catechesis-platform" && request.method === "GET") {
    const [applications, cohorts, versions, meetings] = await Promise.all([
      env.DB.prepare(`SELECT a.*, c.title AS cohort_title, m.title AS module_title FROM catechesis_applications a JOIN catechesis_cohorts c ON c.id = a.cohort_id JOIN catechesis_module_versions v ON v.id = c.module_version_id JOIN catechesis_modules m ON m.id = v.module_id ORDER BY a.created_at DESC LIMIT 200`).all(),
      env.DB.prepare(`SELECT c.*, m.title AS module_title, (SELECT COUNT(*) FROM catechesis_enrollments e WHERE e.cohort_id = c.id AND e.status = 'active') AS active_enrollments FROM catechesis_cohorts c JOIN catechesis_module_versions v ON v.id = c.module_version_id JOIN catechesis_modules m ON m.id = v.module_id ORDER BY c.starts_on DESC`).all(),
      env.DB.prepare(`SELECT v.id, m.title FROM catechesis_module_versions v JOIN catechesis_modules m ON m.id = v.module_id WHERE v.status = 'published' ORDER BY m.title`).all(),
      env.DB.prepare(`SELECT mt.id, mt.meeting_number, mt.starts_at, mt.ends_at, mt.live_url, mt.recording_uid, mt.recording_expires_at, c.title AS cohort_title, t.title FROM catechesis_meetings mt JOIN catechesis_cohorts c ON c.id = mt.cohort_id JOIN catechesis_topics t ON t.id = mt.topic_id ORDER BY mt.starts_at DESC LIMIT 200`).all(),
    ]);
    await audit(env, auth, "read", "catechesis_platform");
    return jsonResponse({ applications: applications.results, cohorts: cohorts.results, module_versions: versions.results, meetings: meetings.results }, 200, request);
  }

  if (path === "/api/admin/catechesis-platform/cohorts" && request.method === "POST") {
    const body = await request.json() as Record<string, unknown>;
    const firstStartsAt = typeof body.first_starts_at === "string" ? new Date(body.first_starts_at) : new Date(Number.NaN);
    const durationMinutes = Number(body.duration_minutes);
    if (!boundedText(body.module_version_id, 100) || !boundedText(body.title, 240) || !isIsoDate(body.starts_on) || !isIsoDate(body.ends_on) || Number.isNaN(firstStartsAt.getTime()) || !Number.isInteger(durationMinutes) || durationMinutes < 30 || durationMinutes > 240 || !isOneOf(body.status, ["draft", "open", "in_progress", "closed", "archived"] as const)) return jsonResponse({ error: "Dados da turma inválidos." }, 400, request);
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO catechesis_cohorts (id, module_version_id, title, starts_on, ends_on, status) VALUES (?, ?, ?, ?, ?, ?)`)
      .bind(id, body.module_version_id, body.title, body.starts_on, body.ends_on, body.status).run();
    const topics = await env.DB.prepare(`SELECT id, meeting_number FROM catechesis_topics WHERE module_version_id = ? ORDER BY meeting_number`).bind(body.module_version_id).all<{ id: string; meeting_number: number }>();
    const first = firstStartsAt;
    await env.DB.batch(topics.results.map((topic) => {
      const startsAt = new Date(first.getTime() + (topic.meeting_number - 1) * 14 * 86400000);
      const endsAt = new Date(startsAt.getTime() + durationMinutes * 60000);
      return env.DB.prepare(`INSERT INTO catechesis_meetings (id, cohort_id, topic_id, meeting_number, starts_at, ends_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), id, topic.id, topic.meeting_number, startsAt.toISOString(), endsAt.toISOString());
    }));
    await audit(env, auth, "create", "catechesis_cohort", id);
    return jsonResponse({ ok: true, id }, 201, request);
  }

  const decision = path.match(/^\/api\/admin\/catechesis-platform\/applications\/([^/]+)\/(approve|reject)$/);
  if (decision && request.method === "POST") {
    const application = await env.DB.prepare(`SELECT id, cohort_id, email, status FROM catechesis_applications WHERE id = ?`).bind(decision[1]).first<{ id: string; cohort_id: string; email: string; status: string }>();
    if (!application || application.status !== "pending") return jsonResponse({ error: "Inscrição não está pendente." }, 409, request);
    const now = new Date().toISOString();
    if (decision[2] === "approve") {
      const enrollmentId = crypto.randomUUID();
      await env.DB.batch([
        env.DB.prepare(`UPDATE catechesis_applications SET status = 'approved', updated_at = ? WHERE id = ? AND status = 'pending'`).bind(now, application.id),
        env.DB.prepare(`INSERT INTO catechesis_enrollments (id, application_id, cohort_id, email, approved_by, approved_at) VALUES (?, ?, ?, ?, ?, ?)`).bind(enrollmentId, application.id, application.cohort_id, application.email, auth.email ?? auth.sub, now),
      ]);
    } else {
      await env.DB.prepare(`UPDATE catechesis_applications SET status = 'rejected', updated_at = ? WHERE id = ? AND status = 'pending'`).bind(now, application.id).run();
    }
    await audit(env, auth, decision[2], "catechesis_application", application.id);
    return jsonResponse({ ok: true }, 200, request);
  }

  const meeting = path.match(/^\/api\/admin\/catechesis-platform\/meetings\/([^/]+)$/);
  if (meeting && request.method === "PUT") {
    const body = await request.json() as Record<string, unknown>;
    const liveUrl = body.live_url === "" || body.live_url == null ? null : body.live_url;
    const recordingUid = body.recording_uid === "" || body.recording_uid == null ? null : body.recording_uid;
    const startsAt = typeof body.starts_at === "string" ? new Date(body.starts_at) : null;
    const endsAt = typeof body.ends_at === "string" ? new Date(body.ends_at) : null;
    if ((liveUrl !== null && (!boundedText(liveUrl, 1000) || !String(liveUrl).startsWith("https://"))) || (recordingUid !== null && !boundedText(recordingUid, 100)) || (startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime())) || (startsAt && endsAt && endsAt.getTime() <= startsAt.getTime())) return jsonResponse({ error: "Dados da aula inválidos." }, 400, request);
    const current = await env.DB.prepare(`SELECT recording_uid, recording_published_at, recording_expires_at FROM catechesis_meetings WHERE id = ?`)
      .bind(meeting[1]).first<{ recording_uid: string | null; recording_published_at: string | null; recording_expires_at: string | null }>();
    if (!current) return jsonResponse({ error: "Aula não encontrada." }, 404, request);
    const publication = recordingPublication({
      uid: current.recording_uid,
      publishedAt: current.recording_published_at,
      expiresAt: current.recording_expires_at,
    }, recordingUid === null ? null : String(recordingUid));
    if (recordingUid && publication.changed) {
      try {
        const allowedOrigin = new URL(env.CATECHESIS_WEB_ORIGIN ?? "https://sao-jorge.oliceu.com").host;
        await env.STREAM.video(String(recordingUid)).update({ requireSignedURLs: true, allowedOrigins: [allowedOrigin] });
      } catch (error) {
        console.error("[catechesis-admin] stream protection failed", { meeting_id: meeting[1], error: error instanceof Error ? error.message : "unknown" });
        return jsonResponse({ error: "A gravação não foi encontrada ou não pôde ser protegida no Cloudflare Stream." }, 502, request);
      }
    }
    await env.DB.prepare(`UPDATE catechesis_meetings SET live_url = ?, recording_uid = ?, recording_published_at = ?, recording_expires_at = ?, starts_at = COALESCE(?, starts_at), ends_at = COALESCE(?, ends_at), updated_at = ? WHERE id = ?`)
      .bind(liveUrl, recordingUid, publication.publishedAt, publication.expiresAt, startsAt?.toISOString() ?? null, endsAt?.toISOString() ?? null, new Date().toISOString(), meeting[1]).run();
    await audit(env, auth, "update", "catechesis_meeting", meeting[1], { has_live_url: Boolean(liveUrl), has_recording: Boolean(recordingUid) });
    return jsonResponse({ ok: true, recording_expires_at: publication.expiresAt }, 200, request);
  }

  return null;
}
