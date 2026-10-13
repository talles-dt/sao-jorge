const api = process.env.SMOKE_API_URL;
const accessJwt = process.env.SMOKE_ACCESS_JWT;
if (!api) throw new Error("SMOKE_API_URL is required");

async function check(path, init = {}, expected = 200) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(accessJwt ? { "Cf-Access-Jwt-Assertion": accessJwt } : {}), ...(init.headers ?? {}) },
  });
  if (response.status !== expected) throw new Error(`${path}: expected ${expected}, got ${response.status}`);
  return response;
}

await check("/api/health");
await check("/api/services");
await check("/api/day/today", {}, 200);
await check("/api/admin/catechesis-signups", {}, accessJwt ? 200 : 401);
console.log("staging smoke checks passed");
