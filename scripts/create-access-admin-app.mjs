#!/usr/bin/env node

// Idempotent setup for the second Access application needed by the admin UI.
// It deliberately requires an existing reusable allow policy: no broad
// allow-everyone rule is ever created by this script.
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const token = process.env.CLOUDFLARE_API_TOKEN;
const policyId = process.env.CF_ACCESS_POLICY_ID;
const hostname = process.env.CF_ACCESS_ADMIN_HOSTNAME ?? "sao-jorge-api.talles-f1e.workers.dev";
const domain = `${hostname}/admin/*`;

if (!accountId || !token || !policyId) {
  console.error("Required: CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, CF_ACCESS_POLICY_ID");
  process.exit(2);
}

const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/access/apps`;
const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
const existingResponse = await fetch(endpoint, { headers });
const existing = await existingResponse.json();
if (!existingResponse.ok || !existing.success) throw new Error(JSON.stringify(existing.errors ?? existing));
const match = existing.result?.find((app) => app.domain === domain);
if (match) {
  console.log(JSON.stringify({ id: match.id, domain: match.domain, aud: match.aud, created: false }));
  process.exit(0);
}

const response = await fetch(endpoint, {
  method: "POST",
  headers,
  body: JSON.stringify({
    name: "São Jorge — Admin UI",
    domain,
    type: "self_hosted",
    session_duration: "24h",
    policies: [{ id: policyId, precedence: 1 }],
  }),
});
const result = await response.json();
if (!response.ok || !result.success) throw new Error(JSON.stringify(result.errors ?? result));
console.log(JSON.stringify({ id: result.result.id, domain: result.result.domain, aud: result.result.aud, created: true }));
