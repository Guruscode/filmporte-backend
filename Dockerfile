# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source code and build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN yarn build

# ─── Production stage ─────────────────────────────────────────────────────────
FROM node:22-alpine

ENV NODE_ENV=production

RUN apk add --no-cache tini postgresql-client curl

WORKDIR /app

# Copy dependency manifests
COPY package.json yarn.lock ./

# Install ALL deps (including dev) so ts-node + typeorm CLI work for migrations
RUN yarn install --frozen-lockfile

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Copy scripts
COPY scripts ./scripts

RUN chmod +x scripts/start.sh

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "scripts/start.sh"]
