const api = process.env.SMOKE_API_URL;
const accessJwt = process.env.SMOKE_ACCESS_JWT;
if (!api) throw new Error("SMOKE_API_URL is required");

async function check(path, init = {}, expected = 200) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    redirect: "manual",
    headers: { Accept: "application/json", ...(accessJwt ? { "Cf-Access-Jwt-Assertion": accessJwt } : {}), ...(init.headers ?? {}) },
  });
  const accepted = Array.isArray(expected) ? expected : [expected];
  if (!accepted.includes(response.status)) throw new Error(`${path}: expected ${accepted.join(" or ")}, got ${response.status}`);
  return response;
}

await check("/api/health");
await check("/api/services");
// A staging database may intentionally have no liturgical fixture for today's
// date; 404 proves the route is reachable without fabricating calendar data.
await check("/api/day/today", {}, [200, 404]);
await check("/api/blog?limit=999", {}, 200);
const modulesResponse = await check("/api/catechesis-platform/modules");
const modules = await modulesResponse.json();
if (!Array.isArray(modules.data) || modules.data.length !== 3 || modules.data.some((module) => !Array.isArray(module.topics) || module.topics.length !== 8)) {
  throw new Error("catechesis modules: expected 3 modules with 8 topics each");
}
const cohortsResponse = await check("/api/catechesis-platform/cohorts/open");
const cohorts = await cohortsResponse.json();
if (!Array.isArray(cohorts.data)) throw new Error("open cohorts: expected an array");
await check("/api/catechesis-platform/auth/request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "invalid" }),
}, 400);
await check("/api/catechesis-platform/me", {}, 401);
await check("/api/catechesis-signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ unit_slug: "", full_name: "fixture", email: "invalid", agreed_to_terms: true }),
}, 400);
await check("/api/admin/catechesis-signups", {}, accessJwt ? 200 : 302);
console.log("staging smoke checks passed");
