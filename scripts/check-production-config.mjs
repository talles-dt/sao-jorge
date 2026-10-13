import { readFile } from "node:fs/promises";

const config = await readFile(new URL("../packages/api/wrangler.toml", import.meta.url), "utf8");
const required = [
  ["ACCESS_TEAM_DOMAIN", "talles-f1e.cloudflareaccess.com"],
  ["ACCESS_AUDIENCE", "SET_IN_ENVIRONMENT"],
  ["ACCESS_ADMIN_EMAILS", "talles@oliceu.com"],
];

const missing = required.filter(([key, value]) => {
  const match = config.match(new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, "m"));
  return !match || !match[1] || (key === "ACCESS_AUDIENCE" && match[1] === value);
});

if (missing.length) {
  console.error(`Production configuration is incomplete: ${missing.map(([key]) => key).join(", ")}`);
  process.exit(1);
}

console.log("Production Cloudflare Access configuration is complete.");
