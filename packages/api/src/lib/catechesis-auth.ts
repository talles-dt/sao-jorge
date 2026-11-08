import type { Env } from "./types";

const encoder = new TextEncoder();

export function randomToken(bytes = 32): string {
  const value = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...value)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function cookieValue(request: Request, name: string): string | null {
  const cookies = request.headers.get("Cookie")?.split(";") ?? [];
  const entry = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.slice(name.length + 1)) : null;
}

export async function sessionEmail(request: Request, env: Env): Promise<string | null> {
  const token = cookieValue(request, "SJ_CatechesisSession");
  if (!token) return null;
  const hash = await sha256(token);
  const session = await env.DB.prepare(`SELECT email FROM catechesis_sessions WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > ? LIMIT 1`)
    .bind(hash, new Date().toISOString()).first<{ email: string }>();
  return session?.email ?? null;
}

export function sessionCookie(token: string, maxAgeSeconds: number): string {
  return `SJ_CatechesisSession=${encodeURIComponent(token)}; Max-Age=${maxAgeSeconds}; Path=/; Secure; HttpOnly; SameSite=Lax`;
}

export async function sendMagicLink(env: Env, email: string, link: string): Promise<boolean> {
  if (!env.RESEND_KEY || !env.CATECHESIS_FROM_EMAIL) {
    if (env.ENVIRONMENT !== "production") console.info("[catechesis-auth] development magic link", { email, link });
    return env.ENVIRONMENT !== "production";
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.CATECHESIS_FROM_EMAIL,
      to: [email],
      subject: "Acesso à Catequese São Jorge",
      text: `Use este link para entrar na área da catequese. Ele expira em 15 minutos e só pode ser usado uma vez:\n\n${link}`,
    }),
  });
  if (!response.ok) console.error("[catechesis-auth] email delivery failed", { status: response.status });
  return response.ok;
}
