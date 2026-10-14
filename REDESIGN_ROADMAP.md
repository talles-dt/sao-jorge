# São Jorge website redesign — decision-complete roadmap

## Product direction

São Jorge should answer the parishioner's immediate practical question first:
what is celebrated today, how can I prepare, and where do I go next? The public
site remains readable on a phone, low-bandwidth tolerant, and useful without an
account. Administrative identity and pastoral records stay behind Cloudflare
Access and are never mixed with public content responses.

## Information architecture

The primary navigation is:

1. **Início** — today's liturgy, next services, current announcements, and
   clear actions for preparation, catechesis, and contact.
2. **Dia litúrgico** — date navigation, today action, readings, feast, fast,
   source, last update, and correction/freshness state.
3. **Serviços** — service-text catalogue with Portuguese/Arabic presentation,
   transliteration where available, reading controls, and preparation notes.
4. **Catequese** — “comece aqui”, adult catechesis, curriculum progression,
   pastoral expectations, and the governed intake form.
5. **Avisos** — parish announcements and bulletins with publication and expiry.
6. **Blog** — editorial articles, categories, provenance, and real API-backed
   detail pages.
7. **Podcast** — episodes, player, transcript/summary, and external source.
8. **Paróquia / Contato** — address, map, schedule, attendance guidance,
   accessibility/contact options, and canonical parish identity.

Global navigation should expose no more than the most important six items on
mobile; secondary destinations belong in a labelled menu and footer.

## Primary journeys and completion criteria

| Question | Entry | Required answer | Completion action |
| --- | --- | --- | --- |
| What is today's liturgy? | Home or Dia litúrgico | Brasília date, feast, tone, fast, readings, source and freshness | Open full day or choose another date |
| How do I attend or prepare? | Home or Services | place/time, expected conduct, text and preparation guidance | View service/contact |
| What service text do I need? | Services | searchable catalogue, language/direction, readable text and provenance | Save/share/return to catalogue |
| How do I begin catechesis? | Catequese | explanation, eligibility, process, privacy notice and intake | Submit governed signup |
| What is happening at the parish? | Home or Avisos | current published notices, date and expiry | Open notice/contact |
| How do I contact the parish? | Contact/footer | canonical contact channels, location and schedule | Call, email, map or message |

Every journey has loading, empty, error, stale-data, and keyboard-complete
states. No public journey depends on an administrator session.

## Content governance

All liturgical and editorial records carry `source`, `created_at`, `updated_at`,
`status`, and a revision/correction reference. Liturgical records additionally
carry the source calendar/scraper identity and an approval identity/time.

- **Priest-approved liturgy:** scraper output is an input, not authority.
  `pending → approved → published` is explicit; manual correction records the
  authenticated actor and previous value in audit history.
- **Editorial content:** drafts are editable, published records are public,
  and corrections create a new revision or an auditable update.
- **Provenance:** external source, source date, import run, and manual notes
  are visible to administrators and summarized publicly where useful.
- **Correction history:** retain actor, timestamp, resource, old/new revision
  metadata, and reason; never accept `approved_by` from a browser payload.
- **Publication:** expiry and scheduling are data fields, not client-side
  conventions. Public endpoints return published records only.

## UX, accessibility, and language

- Mobile-first layouts use a readable measure, large touch targets, visible
  focus rings, skip links, semantic landmarks, labelled form controls, and
  keyboard-complete menus/dialogues.
- Portuguese uses normal left-to-right flow; Arabic fields and content use
  `dir="rtl"` at the content boundary rather than reversing the whole page.
- Liturgical typography prioritizes long-form reading, line height, contrast,
  and stable Arabic font fallback. Do not encode meaning by colour alone.
- Images have meaningful alternative text; decorative images are explicitly
  hidden from assistive technology. Links and media accept only safe schemes.
- Public pages show useful content before nonessential media, avoid blocking
  fonts/scripts, and provide bounded fallback data when the API is unavailable.
- Forms announce validation and save states through a live region and preserve
  user input after recoverable errors.

## Admin operations

The Access-protected panel is organized around operational queues:

1. **Review queue:** pending liturgical/editorial records, provenance, diff,
   approve/publish/reject actions, and required reason for correction.
2. **Liturgical editor:** Brasília date default, explicit date navigation,
   bounded fields, immediate cache purge, returned record, revision/source
   confirmation, and rollback to the previous revision.
3. **Content editor:** blog, bulletin, and service-text drafts with preview,
   scheduling, publication state, and safe shared rendering.
4. **Catechesis intake:** administrator-only records, consent/privacy version,
   retention deadline, deletion workflow, and access/deletion audit events.
5. **Audit history:** immutable actor/action/resource/time records with safe
   metadata and no secret or unnecessary personal data.
6. **Health indicators:** API health, last scraper run, cache purge failures,
   migration/schema version, queue age, and deployment version.

Roles should separate priest approval, editorial publication, pastoral intake,
and operational administration when the parish has enough administrators to
make that useful. Until then, the explicit allowlist is the fail-closed
baseline.

## Technical direction

- Keep the Worker/D1/KV/R2 architecture. Public API contracts use a standard
  error shape `{ error, code?, details? }`, bounded limits, validated request
  schemas, and response metadata (`updated_at`, `source`, `revision`, and
  `cache_status` where applicable).
- Cache public liturgical data for resilience only. Successful writes purge the
  date key and the relevant Brasília “today” key; the response returns the
  updated row. Public reads use short bounded fallback freshness.
- Keep production and staging resources, Access audiences, migrations, and
  smoke tests separate. Promotion requires schema verification, Access login,
  authenticated update, public refresh, signup privacy checks, and rollback
  readiness.
- Monitor structured errors, latency, cache-hit/miss, scraper/import failures,
  migration version, and Access denials. Logs exclude JWTs, raw emails,
  signup text, tokens, and full request bodies.
- Test the durable paths: public read, admin authenticate → mutate → reload,
  signup validate → persist → deduplicate/rate-limit, safe render, and mobile
  keyboard journeys. Keep unit, integration, staging, and production evidence
  explicitly separate.

## Phased delivery

### Foundation — release gate

Access/JWT authorization, CORS, schemas, structured errors, Brasília freshness,
cache invalidation, privacy/retention/audit migrations, reproducible CI, staging
smoke tests, and deploy rollback documentation.

### Usability — parishioner value

Home liturgical card, calendar navigation, today recovery, source/freshness
indicator, services reading controls, loading/error/empty states, responsive
navigation, contact page, and accessibility regression coverage.

### Content — editorial quality

Review queue, safe shared renderer, real blog detail, bulletin scheduling,
provenance/correction history, catechesis “start here”, and governed content
preview/publication workflow.

### Advanced parish operations

Role separation, rollback UI, retention automation, audit explorer, operational
health dashboard, podcast/transcript improvements, social distribution review,
and richer parish analytics that do not identify or profile visitors.

## Release decision record

The redesign is approved for staged implementation when the Foundation gate has
evidence in staging. Production release is blocked if Access identity, schema
version, cache freshness, signup privacy, or rollback cannot be demonstrated.
The public Vercel deployment remains the presentation layer; the Worker remains
the authoritative API and protected administrative data boundary.
