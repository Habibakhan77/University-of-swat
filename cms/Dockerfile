# syntax=docker/dockerfile:1.7
# University of Swat CMS: Strapi v5 production image (compiled admin + server, non-root).
#
#   docker build -t uswat-cms .
#
# Targets:
#   runner  (default)  the production server: compiled dist/ + production node_modules only
#   builder            full source + dev dependencies; used once to run the seed script
#                      (docker compose --profile seed run --rm cms-seed)

ARG NODE_IMAGE=node:22-alpine

# ---------- 1. All dependencies (for building) ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /opt/app
# Toolchain only in build stages, in case a native module has no prebuilt binary for musl.
RUN apk add --no-cache libc6-compat build-base python3
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---------- 2. Production dependencies only ----------
FROM ${NODE_IMAGE} AS prod-deps
WORKDIR /opt/app
RUN apk add --no-cache libc6-compat build-base python3
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --no-audit --no-fund

# ---------- 3. Build: TypeScript server code + admin panel into dist/ ----------
FROM ${NODE_IMAGE} AS builder
WORKDIR /opt/app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true
COPY --from=deps /opt/app/node_modules ./node_modules
COPY . .
# types/generated is not in git: generate it from the content-type schemas first, or the TypeScript
# build fails. Strapi only needs placeholder settings for this; it does not connect to a database.
# (These build-only values are not kept in the image; real secrets are set at runtime.)
RUN DATABASE_CLIENT=postgres DATABASE_HOST=127.0.0.1 DATABASE_PORT=1 \
    APP_KEYS=build-only ADMIN_JWT_SECRET=build-only API_TOKEN_SALT=build-only \
    TRANSFER_TOKEN_SALT=build-only JWT_SECRET=build-only ENCRYPTION_KEY=build-only \
    npm run typegen \
 && npm run build \
 && mkdir -p public/uploads .seed-cache \
 && chown -R node:node /opt/app/public/uploads /opt/app/.seed-cache /opt/app/dist
USER node

# ---------- 4. Runtime ----------
FROM ${NODE_IMAGE} AS runner
WORKDIR /opt/app
# sharp (Strapi's image library) ships its own prebuilt libvips for musl, so no system vips is needed.
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
    STRAPI_TELEMETRY_DISABLED=true \
    HOST=0.0.0.0 \
    PORT=1337
COPY --from=prod-deps --chown=node:node /opt/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /opt/app/dist ./dist
COPY --chown=node:node package.json tsconfig.json favicon.png ./
COPY --chown=node:node public ./public
COPY --chown=node:node database ./database
# The uploads folder is a volume; create it owned by "node" so a fresh volume inherits that owner.
RUN mkdir -p public/uploads && chown -R node:node public/uploads
USER node
EXPOSE 1337
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:1337/_health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
# Run Strapi directly (not through npm) so it receives SIGTERM and shuts down cleanly.
CMD ["./node_modules/.bin/strapi", "start"]
