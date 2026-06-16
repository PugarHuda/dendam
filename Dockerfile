# Full-stack deploy of Dendam (Next.js + API routes) to any Node host.
# Memory still lives on Walrus Mainnet via MemWal; this just hosts the agent.
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=optional || npm install --omit=optional

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Provide these at runtime (NOT baked into the image):
#   OPENROUTER_API_KEY or ANTHROPIC_API_KEY, DENDAM_MODEL,
#   MEMWAL_DELEGATE_KEY, MEMWAL_ACCOUNT_ID, MEMWAL_SERVER_URL
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs
EXPOSE 3000
CMD ["npm", "run", "start"]
