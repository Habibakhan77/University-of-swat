# syntax=docker/dockerfile:1.7
# University of Swat website: Next.js production image (standalone output, non-root).
#
#   docker build -t uswat-frontend \
#     --build-arg NEXT_PUBLIC_SITE_URL=https://uswat.edu.pk \
#     --build-arg NEXT_PUBLIC_STRAPI_URL=https://cms.uswat.edu.pk .
#
# NEXT_PUBLIC_* values are inlined into the JavaScript at build time, so they are build args.
# Server-only values (STRAPI_URL, REVALIDATE_SECRET, CONTACT_FORM_SECRET) are read at runtime.

ARG NODE_IMAGE=node:22-alpine

# ---------- 1. Dependencies (cached until package-lock.json changes) ----------
FROM ${NODE_IMAGE} AS deps
WORKDIR /app
# libc6-compat: some prebuilt native binaries (e.g. the SWC compiler fallback) expect glibc symbols.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---------- 2. Build ----------
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1 \
    BUILD_STANDALONE=1
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
# Used only while prerendering. The build does not need a running Strapi: pages that cannot reach
# it are built with empty data and a short cache life, then filled in from Strapi at runtime.
ARG STRAPI_URL=http://cms:1337
# next.config.ts is evaluated at build time, so the next/image settings are fixed here too:
# "1" only for a local stack whose Strapi media is on a private address (docker-compose.override.yml).
ARG IMAGES_ALLOW_LOCAL_IP=""
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_PUBLIC_STRAPI_URL=${NEXT_PUBLIC_STRAPI_URL} \
    STRAPI_URL=${STRAPI_URL} \
    IMAGES_ALLOW_LOCAL_IP=${IMAGES_ALLOW_LOCAL_IP}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 3. Runtime: only the standalone server, static assets and public/ ----------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
# Keep HOSTNAME=0.0.0.0. With a specific address (tested: 127.0.0.1) the standalone server treats
# next-intl's locale rewrite (/ -> /en) as an external URL: pages answer 307/500 behind Nginx.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    HOSTNAME=0.0.0.0 \
    PORT=3000
# The official Node image already has an unprivileged "node" user (uid 1000).
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
