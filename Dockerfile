# ─────────────────────────────────────────────
# TaskBoard - Multi-Stage Production Container Specification
# https://github.com/red-shadows-rs/taskboard
# ─────────────────────────────────────────────

# ── Base Runtime Environment ──
FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 TZ=UTC
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      ca-certificates build-essential python3 curl \
 && rm -rf /var/lib/apt/lists/*

# ── Dependencies ──
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm install --include=dev

# ── Build ──
FROM deps AS build
ENV NODE_ENV=production \
    SESSION_SECRET=0000000000000000000000000000000000000000000000000000000000000000
COPY . .
RUN npm run build

# ── Production Runner ──
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=build /app/node_modules/bindings ./node_modules/bindings
COPY --from=build /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

RUN mkdir -p /app/data /app/uploads && chown -R node:node /app
USER node
EXPOSE 3000
CMD ["node", "server.js"]
