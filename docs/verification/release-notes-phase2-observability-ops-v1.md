# Release Notes — Phase 2 Observability & Ops V1

- Date: `2026-04-19`
- Topic: `Phase 2 — Observability & Ops V1`
- Companion entry in `RELEASE_NOTES.md`: section "2026-04-19 — Phase 2 §3.8 Observability & Ops V1"

## Outward-facing summary

This increment is internal-quality only; no user-visible behaviour changed.

Operators / on-call developers now have:
- a stable per-request `x-trace-id` header + structured JSON server logs
- a unified server-side error shape (`{ error: { code, message, traceId } }`)
- a guarded internal `GET /api/metrics` (token-protected; returns 404 when disabled)
- explicit `observability` and `backup` namespaces under `/api/health`
- two CLI scripts (`backup-sqlite.mjs` / `restore-sqlite.mjs`) for cold disaster recovery on the single-instance SQLite database

## What downstream Phase 2 slices can now rely on

- §3.1 (managed Postgres / object storage migration) can use `wrapServerAction` and `MetricsRegistry` boundaries to verify regression-free slot-in.
- §3.2 (ops back-office V1) can build on top of `AppError`, structured logs, and `/api/metrics` for an audit-log-friendly substrate.
- §3.3 (threaded messaging) can reuse `wrapRouteHandler` and metric helpers without writing its own observability primitives.

## Out of scope for V1

- Real Sentry SDK and remote APM
- Dashboards / alerts / SLO tracking
- Audit logs (will land with §3.2)
- Auto-scheduled cron for backup script
- Remote log aggregation (Loki / OpenSearch / SLS)
