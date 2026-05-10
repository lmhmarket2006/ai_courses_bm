# Next.js 15 — وضع standalone (يُطابق next.config.ts) لنشر موثوق على Railway
# https://nextjs.org/docs/app/api-reference/config/next-config-js/output

FROM node:20-bookworm-slim AS base
WORKDIR /app

# ─── التبعيات ───
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci

# ─── البناء ───
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ─── التشغيل ───
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
