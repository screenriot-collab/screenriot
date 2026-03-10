# Build from repo root: docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.14.2 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
RUN pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
ENV DATABASE_URL="postgresql://local:local@postgres:5432/screenriot"
RUN pnpm db:generate
RUN pnpm --filter @screenriot/api run build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY --from=builder /app/apps/api/dist ./apps/api/dist
RUN pnpm install --ignore-scripts
RUN pnpm db:generate
WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/main.js"]
