FROM node:22-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build
FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/scripts/init-db.mjs ./scripts/init-db.mjs
COPY --from=builder --chown=nextjs:nodejs /app/infrastructure/schema.sql ./infrastructure/schema.sql
COPY --from=builder --chown=nextjs:nodejs /app/data/seed.json ./data/seed.json
COPY --from=builder --chown=nextjs:nodejs /app/scripts/check-provider.mjs ./scripts/check-provider.mjs
COPY --from=builder --chown=nextjs:nodejs /app/lib/provider-models.mjs ./scripts/provider-models.mjs
COPY --from=builder --chown=nextjs:nodejs /app/lib/provider-transport.mjs ./scripts/provider-transport.mjs
USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["sh","-c","node scripts/init-db.mjs && node server.js"]
