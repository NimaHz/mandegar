ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS base
ARG NPM_REGISTRY=https://registry.npmjs.org/
ENV COREPACK_HOME=/opt/corepack \
    COREPACK_NPM_REGISTRY=${NPM_REGISTRY} \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    pnpm_config_registry=${NPM_REGISTRY} \
    NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY package.json ./
RUN addgroup -S -g 1001 mandegar \
    && adduser -S -D -u 1001 -G mandegar mandegar \
    && corepack enable \
    && corepack install \
    && chown -R mandegar:mandegar "$COREPACK_HOME"

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=mandegar-pnpm-store,target=/pnpm-store \
    pnpm install --frozen-lockfile --store-dir /pnpm-store

FROM base AS tools
ENV NODE_ENV=production \
    UPLOAD_DIR=/app/uploads
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src ./src
RUN mkdir -p /app/uploads && chown mandegar:mandegar /app/uploads
USER mandegar
CMD ["pnpm", "db:migrate"]

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL
ENV NODE_ENV=production \
    NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=secret,id=database_url,required=true \
    --mount=type=secret,id=session_secret,required=true \
    test -n "$NEXT_PUBLIC_SITE_URL" \
    && DATABASE_URL="$(cat /run/secrets/database_url)" \
       SESSION_SECRET="$(cat /run/secrets/session_secret)" \
       pnpm build

FROM ${NODE_IMAGE} AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    UPLOAD_DIR=/app/uploads
WORKDIR /app
RUN addgroup -S -g 1001 mandegar \
    && adduser -S -D -H -u 1001 -G mandegar mandegar \
    && mkdir -p /app/uploads \
    && chown mandegar:mandegar /app/uploads
COPY --from=builder --chown=mandegar:mandegar /app/public ./public
COPY --from=builder --chown=mandegar:mandegar /app/.next/standalone ./
COPY --from=builder --chown=mandegar:mandegar /app/.next/static ./.next/static
USER mandegar
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
