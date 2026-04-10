FROM node:22-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

FROM base AS deps
COPY web/package.json web/package-lock.json ./
RUN npm ci

FROM base AS builder
ARG APP_BASE_URL=http://localhost:3000
ARG ASSET_BASE_URL=http://localhost:3000
ARG DATABASE_PROVIDER=sqlite
ARG SQLITE_DATABASE_PATH=.data/community.sqlite
ARG SESSION_COOKIE_SECRET=build-only-secret
ARG SESSION_COOKIE_SECURE=false
ENV APP_BASE_URL=${APP_BASE_URL}
ENV ASSET_BASE_URL=${ASSET_BASE_URL}
ENV DATABASE_PROVIDER=${DATABASE_PROVIDER}
ENV SQLITE_DATABASE_PATH=${SQLITE_DATABASE_PATH}
ENV SESSION_COOKIE_SECRET=${SESSION_COOKIE_SECRET}
ENV SESSION_COOKIE_SECURE=${SESSION_COOKIE_SECURE}
COPY --from=deps /app/node_modules ./node_modules
COPY web .
RUN npm run build

FROM node:22-bookworm-slim AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
WORKDIR /app

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN mkdir -p /app/.data && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then((res) => process.exit(res.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
