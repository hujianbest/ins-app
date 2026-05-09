# Lens Archive v1.0.0

**English** · [简体中文](./README.zh-CN.md)

![Lens Archive](https://img.shields.io/badge/version-1.0.0-green)
![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

> **High-fit discovery**: help the right people keep discovering your work, instead of chasing broader exposure.

Lens Archive is a creator-community platform built around the dual primary identities **photographer** and **model**. Version 1.0.0 establishes a production-ready baseline with intelligent creator/work recommendations, persistent messaging, and operational tooling.

## 🚀 Core Features

### Creator Platform
- ✅ **Real Authentication** — Email/password registration replacing demo cookies
- ✅ **Portfolio Management** — Publish works, manage drafts, control visibility
- ✅ **Public Profiles** — Customizable photographer/model pages (city, focus, context)
- ✅ **Collaboration Posts** — Publish opportunities to connect with collaborators
- ✅ **Private Messaging** — Persistent threads with unified inbox

### Social & Discovery
- ✅ **Smart Recommendations** — Rule-based related creators/works (P95 < 0.05ms)
- ✅ **Social Interactions** — Follow creators, comment on works, like/favorite
- ✅ **Unified Inbox** — Direct messages + system notifications (30s auto-refresh)
- ✅ **Content Search** — Keyword search across works, creators, opportunities

### Operations Console
- ✅ **Curation Management** — Admin tools for homepage/discovery featured slots
- ✅ **Content Moderation** — Hide/restore works with full audit logging
- ✅ **Access Control** — Email-based admin allowlist (fail-closed by default)

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| Frontend | Next.js 16 + React 19 | App Router + Server Components |
| Types | TypeScript 5 | Full type coverage |
| Styling | Tailwind CSS v4 | Editorial-dark visual system |
| Database | node:sqlite (built-in) | Single-instance, PostgreSQL-ready |
| Testing | Vitest 4 + Playwright | Unit/Component/E2E coverage |
| Container | Multi-stage Dockerfile | Standalone + healthcheck |

## 📦 Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/hujianbest/ins-app.git
cd ins-app

# Build image
docker build -t lens-archive:v1.0.0 .

# Run container
docker run --rm -p 3000:3000 \
  -e APP_BASE_URL=http://localhost:3000 \
  -e SESSION_COOKIE_SECRET=your-secret-here \
  -e ADMIN_ACCOUNT_EMAILS=admin@example.com \
  -v $PWD/data:/app/.data \
  lens-archive:v1.0.0
```

Visit http://localhost:3000

### Local Development

```bash
# Requires Node.js 22+
cd web
npm ci
npm run dev    # Dev server at http://localhost:3000
npm run verify # lint + test + build all-in-one
```

## 🔧 Environment Variables

```bash
# Core
APP_BASE_URL=http://localhost:3000
SESSION_COOKIE_SECRET=<generate-secret>
SESSION_COOKIE_SECURE=true

# Database (default SQLite)
DATABASE_PROVIDER=sqlite
SQLITE_DATABASE_PATH=/app/.data/community.sqlite

# Observability
OBSERVABILITY_LOG_LEVEL=info
OBSERVABILITY_METRICS_ENABLED=true
OBSERVABILITY_METRICS_TOKEN=<generate-token>
ERROR_REPORTER_PROVIDER=console
SQLITE_BACKUP_DIR=/app/.data/backups

# Admin
ADMIN_ACCOUNT_EMAILS=admin1@example.com,admin2@example.com

# Features
HEALTHCHECK_ENABLED=true
RECOMMENDATIONS_RELATED_ENABLED=true
```

## 📊 Quality Assurance

**v1.0.0 Release Status:**
- ✅ 69 tasks completed, all quality gates passed
- ✅ 338 test cases passing
- ✅ All performance budgets met (30-99% headroom)
- ✅ All code/test/traceability reviews passed

**Performance Benchmarks:**
- API health check: 3.1ms (38% headroom under 5ms budget)
- Recommendation engine: <0.05ms (99.8% headroom under 30ms budget)
- Admin operations: <0.03ms (99.96% headroom under 80ms budget)
- Inbox loading: 8.1ms (93% headroom under 120ms budget)

## 🎯 Feature Checklist

| Module | Status | Description |
|--------|--------|-------------|
| 🔐 Authentication | ✅ Done | Real email/password, secure cookie sessions |
| 👤 Profiles | ✅ Done | Photographer/model pages with discoverability fields |
| 🖼️ Works | ✅ Done | Publish/draft/revert, complete state machine |
| 💬 Social | ✅ Done | Follow, comment, like, favorite |
| 📨 Messaging | ✅ Done | Persistent threads, unified inbox, notifications |
| 🎯 Recommendations | ✅ Done | Related creators/works, rule-based algorithms |
| 🔍 Search | ✅ Done | Keyword search across works/creators/opportunities |
| 🛡️ Admin Console | ✅ Done | Curation, moderation, audit logging |
| 📊 Observability | ✅ Done | Structured logging, metrics, health checks |
| 💾 Backup | ✅ Done | SQLite backup/restore CLI tools |

## 🏗️ Repository Structure

```
.
├── Dockerfile                  # Multi-stage production image
├── RELEASE_NOTES.md            # Version changelog
├── docs/                       # Technical documentation
│   ├── specs/                  # Feature specifications
│   ├── designs/                # Technical designs
│   ├── tasks/                  # Task breakdowns
│   ├── reviews/                # Review records
│   └── verification/           # Verification evidence
├── web/                        # Next.js application
│   ├── src/app/                # Routes and pages
│   ├── src/features/           # Feature modules
│   └── e2e/                    # E2E tests
└── docs/release-v1.0.0/        # v1.0.0 release pack
```

## 🗺️ Roadmap

### v1.1.0 (Planned)
- [ ] PostgreSQL migration (managed database)
- [ ] Object storage integration (image uploads)
- [ ] Collaboration fulfillment state machine
- [ ] Message attachments

### v1.2.0 (Planned)
- [ ] SSE/WebSocket real-time messaging
- [ ] Group messaging
- [ ] Notification preferences
- [ ] Email digests

### v2.0.0 (Long-term)
- [ ] Payments/orders/memberships
- [ ] ML-powered recommendations
- [ ] Advanced faceted search
- [ ] Internationalization & accessibility
- [ ] Native app support

## 📋 Known Limitations

1. **Single-instance deployment** — Currently SQLite-only, single instance (PostgreSQL in v1.1)
2. **Local storage** — Image assets stored locally (object storage in v1.1)
3. **Polling refresh** — Messaging uses 30s polling (SSE in v1.2)

## 🔗 Links

- 📦 [v1.0.0 Release Pack](./docs/release-v1.0.0/release-pack.md)
- 📝 [Changelog](./RELEASE_NOTES.md)
- 🗺️ [Roadmap](./docs/ROADMAP.md)
- 🐛 [Issue Tracker](https://github.com/hujianbest/ins-app/issues)

## 📄 License

MIT License — see [LICENSE](./LICENSE)

---

**Lens Archive v1.0.0** — Help the right people discover your work

*Built: 2026-05-10 | Version: 1.0.0*
