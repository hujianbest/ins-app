# Release Notes

## 2026-04-05

- Localized the homepage baseline into Chinese, including the root `lang`, homepage discovery copy, and homepage-facing card labels, so the site now starts from a Chinese-first entry experience.
- Added the first branded homepage for the photography showcase site, replacing the default Next.js starter screen with a full-screen hero and curated entry points for portfolios and opportunities.
- Updated the site-wide metadata and global visual tokens so the experience now carries a consistent Lens Archive brand baseline beyond the homepage alone.
- Added public photographer and model profile pages with role-specific showcase sections, contact entry points, and static sample routes for the first browsing flow.
- Added public work detail pages plus profile-to-work navigation, so visitors can move from a creator showcase into individual work stories and back to the owner profile.
- Added public opportunities list and detail pages, allowing visitors to browse city/time booking requests and jump into the poster's profile or contact entry point.
- Added first-pass authentication entry pages and a protected `studio` landing route, giving photographers and models a role-specific sign-in/register path for future creator workflows.
- Added first-pass studio profile and works management pages, so signed-in creators can review editable profile fields and manage the showcase items tied to their public presence.
- Added a first-pass studio opportunities management page, so signed-in creators can draft booking requests with city/time fields and review the active requests currently shown to visitors.
- Added login-gated work likes and profile favorites backed by demo cookies, so signed-in visitors can toggle engagement state while guests are routed through the login entry point.
- Added in-site contact actions plus a protected `inbox`, so signed-in users can start message threads from profiles, works, and opportunities and then review those threads inside the app.
- Added homepage discovery sections for featured works, profiles, and opportunities, so visitors can move from the cinematic hero into curated public content without losing the landing page visual hierarchy.

## 2026-04-08

- Added the first community domain and repository contract baseline behind the scenes, including draft-safe public work filtering, explicit `home` / `discover` curation guards, and test-backed in-memory repository bundle fixtures that prepare the app for upcoming SQLite-backed community flows.

## 2026-04-09

- Added a shared session and access-control baseline for the community workflow, so photographer and model accounts now resolve through the same `SessionContext`, `CreatorCapabilityPolicy`, and `StudioGuard` instead of scattered `studio`-page checks.
- Unified the existing `studio` landing, profile, works, and opportunities routes behind the shared guard while preserving compatibility for neighboring login-gated surfaces that still consume `getSessionRole()`.
- Migrated the homepage, `/discover`, creator profiles, work details, `studio/profile`, and `studio/works` onto repository-backed community read/write paths, including draft-safe public visibility, publish/revert flows, and server-action-based creator editing.
- Added the first community relationship and interaction loops, so signed-in members can now follow creators into the discover `关注中` feed and leave validated latest-first comments on public work detail pages.
- Preserved model pages, opportunities, and contact threads as secondary collaboration paths while keeping the homepage narrative centered on the community discovery flow, and closed the migration with fresh `test + lint + build` evidence.
- Rebased the app onto the Hybrid Platform Relaunch scope, adding Docker-ready runtime config, a healthcheck route, and real email/password authentication so the site now has a credible cloud deployment baseline instead of demo-only entry points.
- Redesigned the main public surfaces around the editorial-dark system, including `/`, `/discover`, `/search`, creator profiles, work details, and the `studio` shell, so browsing, publishing, interaction, and collaboration now read as one coherent product experience.
- Replaced the old engineering-style sample copy with licensed seed visuals plus traceable source notes, and documented the Phase 1 launch boundary so operations tooling, threaded messaging, payments, memberships, and advanced search remain explicitly deferred to Phase 2.

## 2026-04-19 — Phase 2 §3.8 Observability & Ops V1

First independently shippable slice of Phase 2: a self-contained observability + ops baseline that does not change any user-facing behaviour but makes the production runtime debuggable, measurable, and recoverable. No new runtime npm dependencies; everything is built on Node 22 built-ins.

- Added a structured request-scoped trace id in `web/src/proxy.ts` (Next 16 file convention) plus an `AsyncLocalStorage`-based trace context in `web/src/features/observability/trace.ts`, propagated through every wrapped route handler / server action via the inbound and response `x-trace-id` header.
- Added a JSON-mode structured logger with controlled-key whitelist (19 keys), 8 KiB single-record cap, and trace id auto-injection at `web/src/features/observability/logger.ts`.
- Added `AppError` + `normalizeError` + `appErrorToHttpBody` so every server-side failure crystallises into `{ code, message, traceId }` without ever leaking internal stacks or paths.
- Added an `ErrorReporter` abstraction with `noop` (default), `console`, and `sentry` providers; the `sentry` provider is a placeholder in V1 and degrades safely to `noop` on missing DSN or unbundled SDK.
- Added an in-memory `MetricsRegistry` (counter / gauge / histogram across `http`, `sqlite`, `business` namespaces) plus a token-protected internal `GET /api/metrics` route handler that returns 404 when disabled (per CON-002), 401 on unauth, and a JSON snapshot when authorised.
- Wrapped every existing server action (`auth/login|register|logout`, `community/saveStudioProfile|saveStudioWork`, `contact/startContactThread`, `engagement/toggleWorkLike|toggleProfileFavorite`, `social/toggleProfileFollow|addWorkComment`) and every existing route handler (`/api/health`, `/api/discovery-events`) with the boundary decorator. Business behaviour is unchanged: framework-control errors (`redirect`, `notFound`, …) flow through untouched via a `digest='NEXT_*'` bypass.
- Extended `web/src/config/env.ts` with `OBSERVABILITY_LOG_LEVEL` / `OBSERVABILITY_METRICS_ENABLED` / `OBSERVABILITY_METRICS_TOKEN` / `OBSERVABILITY_SLOW_QUERY_MS` / `ERROR_REPORTER_PROVIDER` / `SENTRY_DSN` / `SQLITE_BACKUP_DIR`. All invalid values degrade with a startup warning except the single hard-stop: `OBSERVABILITY_METRICS_ENABLED=true` without a token refuses to start (avoids exposing `/api/metrics` un-authed).
- Extended `GET /api/health` with a non-breaking `observability` namespace (`loggerEnabled` / `metricsEnabled` / `errorReporter`) and a `backup` namespace (`ready` / `lastBackupAt`), where `lastBackupAt` reflects the newest `community-*.sqlite` mtime under `SQLITE_BACKUP_DIR` with a 5 s in-memory cache to absorb 1 Hz health probes.
- Added `web/scripts/backup-sqlite.mjs` and `web/scripts/restore-sqlite.mjs` as self-contained `.mjs` CLIs. Backup uses the module-level `node:sqlite` `backup(srcDb, destPath, { rate })` Online Backup API on the primary path and falls back automatically to `PRAGMA wal_checkpoint(TRUNCATE) + fs.copyFile` if the API is missing. Restore is atomic (`copyFile` to `.restore-tmp` + `rename`). Missing or non-existent `SQLITE_BACKUP_DIR` exits non-zero.
- Performance: P95 of `/api/health` end-to-end (with the wrapper, ALS, logger, and metrics enabled) measured at 3.099 ms over 1000 sequential requests, well under the 5 ms NFR-001 budget for the entire request — see `/opt/cursor/artifacts/increment-regression-perf-evidence.md`.
- Out of scope for V1 (deferred to later Phase 2 slices): managed Postgres / object storage migration (§3.1), real Sentry SDK integration, dashboards, alerting, audit log, and dedicated search service.

## 2026-04-19 — Phase 2 §3.6 Discovery Intelligence V1

Second independently shippable slice of Phase 2: rule-based **Related Creators** and **Related Works** modules attached to the public creator profile and work-detail pages, with a new event type and metrics namespace as the baseline for later A/B and ML-ranking work. Pure TypeScript; no vector retrieval, no ML runtime, no new SQL tables, no new API routes, no new runtime npm dependencies.

- Added a new `web/src/features/recommendations/` module: `scoring.ts` (pure-function scoring core for `scoreCreator` / `scoreWork` / `rankCandidates` with deterministic `score desc → updatedAt desc → targetKey asc` ordering), `signals.ts` (hard-coded weight tables `RELATED_CREATORS_WEIGHTS = { city: 0.6, shootingFocus: 0.4 }` and `RELATED_WORKS_WEIGHTS = { sameOwner: 0.55, ownerCity: 0.3, category: 0.15 }` enforcing the SRS §8.3 invariants `weight(city) >= weight(shootingFocus)` and `weight(sameOwner) > weight(ownerCity) >= weight(category)`), `related-creators.ts` / `related-works.ts` (orchestration: single repository read per call, candidate filter, scoring, metrics + logger writes, soft-fail rendering on repository exceptions), and `RelatedCreatorsSection` / `RelatedWorksSection` async server components.
- Mounted `<RelatedCreatorsSection seed={{ role, slug }} />` at the bottom of the public creator profile (`/photographers/[slug]`, `/models/[slug]`) and `<RelatedWorksSection seed={{ workId }} />` directly above the comments section on `/works/[workId]`. Each card is a regular `EditorialCard` linking to the candidate's public page; up to 4 cards per surface.
- Added a single new env flag `RECOMMENDATIONS_RELATED_ENABLED` (default `true`, invalid values degrade to `true` with a startup warning, explicit `"false"` hides both sections from the SSR DOM and stops emitting events / metrics — flag-disabled and stable empty state are deliberately distinct in DOM).
- Extended `DiscoveryEventType` with a new `"related_card_view"` value, widened the `view-beacon.tsx` `eventType` type union to the full `DiscoveryEventType`, and widened `web/src/app/api/discovery-events/route.ts` `DiscoveryEventRequestBody.eventType` to the full union (FR-005 #5 TypeScript exhaustiveness). The server-side schema and SQLite table are unchanged; the new event type rides on the existing `POST /api/discovery-events` endpoint.
- Extended `MetricsSnapshot` with a purely additive top-level `recommendations` namespace covering `related_creators.cards_rendered / .empty` and `related_works.cards_rendered / .empty`. Existing `http` / `sqlite` / `business` / `gauges` / `labels` fields are unchanged for current `/api/metrics` consumers.
- Performance: orchestration-layer micro-benchmark over 1000 iterations on a 100-creator candidate pool reports P95 = 0.05 ms for `getRelatedCreators` and P95 = 0.04 ms for `getRelatedWorks` (200 works + 50 owner profiles), about 600× under the 30 ms NFR-001 budget. Run via `RUN_PERF=1 npx vitest run --reporter=verbose src/features/recommendations/perf.bench.test.ts`.
- Quality gates: `cd web && npm run typecheck && npm run lint && npm run build` all green at the same baseline as Observability & Ops V1; Vitest grew from 144 → 209 tests with no new failures and no regressions in the existing Phase 1 / Discovery Quality / Observability suites.
- Out of scope for V1 (deferred to later §3.6 slices): vector retrieval / pgvector / ML ranking, A/B framework with traffic bucketing, personalised recommendations consuming `discovery_events`, related sections on the home / discover / search pages, cross-role recommendations, dwell-time / scroll-depth event extensions, and a "why this was recommended" explanation panel.
