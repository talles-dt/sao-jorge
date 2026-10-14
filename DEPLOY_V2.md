# São Jorge v2 deployment checklist

## Cloudflare Access

1. Protect the API origin’s `/api/admin/*` paths. A `workers.dev` hostname is valid; a custom domain is not required.
2. The administrative shell is proxied at the API origin’s `/admin/*` path so
   Access cookies and API requests remain first-party. The shell contains no
   parish records; every administrative read/write remains behind the
   `/api/admin/*` Access application.
3. Set `ACCESS_TEAM_DOMAIN` to the team domain without `https://`.
4. Set `ACCESS_AUDIENCE` to the Access application audience tag.
5. Add the administrator email to the Worker environment allowlist, or add the `parish-admin` role when the selected identity provider emits roles.
6. Verify that the Worker receives `Cf-Access-Jwt-Assertion`; the Worker independently verifies its signature, issuer, audience, expiry, and administrator identity.

The old `ADMIN_TOKEN` flow is not supported by v2 and must not be configured.
The canonical production panel is:
`https://sao-jorge-api.talles-f1e.workers.dev/admin`.

The Worker also protects `/admin/*`: an unauthenticated panel request is sent
through the existing Access-protected `/api/admin/*` route; after Access
validates the JWT, the Worker stores it in a short-lived HttpOnly cookie scoped
to `/admin`. Nested panel requests validate that JWT independently. No second
Access application or custom domain is required.

For the current staging setup, the protected path is:
`sao-jorge-api-staging.talles-f1e.workers.dev/api/admin/*`.
Production must use its own Access application audience (or an explicitly
expanded application) before the production Worker is deployed.

## Environments

Production uses the default `packages/api/wrangler.toml` bindings. Staging uses
`wrangler deploy --env staging` and must have its own D1 database, KV namespace,
R2 bucket, Access application audience, and secrets. The staging cron is empty
by design; run scraper verification manually until the staging data path is
accepted.

```bash
cd packages/api
npx wrangler d1 execute sao-jorge-db-staging --env staging --remote --file=migrations/001_schema.sql
npx wrangler deploy --env staging
npx wrangler deploy
```

Never substitute production resource IDs into the staging placeholders.

## API and database

```bash
cd packages/api
npm ci
npm run type-check
npm run db:migrate
npm run deploy
```

Apply migrations in order. Migration `005_catechesis_privacy.sql` creates governed signup storage; migration `006_signup_rate_limits.sql` creates atomic D1 rate-limit counters; migration `007_admin_audit_events.sql` creates administrator audit history.

## Web build

```bash
cd packages/web
npm ci
npm run type-check
npm run lint
npm run build
```

Set `NEXT_PUBLIC_API_URL` to the deployed API origin. v2 uses server rendering for dynamic blog and liturgical content; do not deploy it as a static export if live updates are required. The repository’s `deploy:web` command intentionally performs only the verified production build; the Cloudflare SSR adapter must be selected and validated in the target account before adding a provider-specific publish command.

## Staging acceptance

The currently deployed staging Worker is
`https://sao-jorge-api-staging.talles-f1e.workers.dev`. Its D1/KV/R2 bindings
are isolated in the `staging` Wrangler environment. The staging database also
contains a clearly marked `Fixture de staging` liturgical row so the public
freshness path can be smoke-tested before the real scraper/content process is
connected.

- Access login reaches `/admin` and unauthenticated API mutations return `401`.
- A liturgical correction is visible through the public API immediately after save.
- Signup creates consent/retention metadata and is visible only to authenticated administrators.
- Signup rate limits remain correct under concurrent requests.
- Blog detail reflects the current published database record.
- `npm run type-check`, `npm run lint`, and `npm run build` complete before production promotion.

Run the unauthenticated/authenticated smoke checks against staging:

```bash
SMOKE_API_URL=https://staging-api.example.com npm run smoke:staging
SMOKE_API_URL=https://staging-api.example.com SMOKE_ACCESS_JWT="$CF_ACCESS_JWT" npm run smoke:staging
```
