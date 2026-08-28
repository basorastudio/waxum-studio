FROM node:20-bookworm-slim

WORKDIR /app

# python3/make/g++ are needed to build better-sqlite3's native addon.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

ENV SERVE_STATIC=true
ENV PORT=8787
ENV STUDIO_DATABASE_PATH=/app/.data/waxum-studio.sqlite

EXPOSE 8787
VOLUME ["/app/.data"]

CMD ["npx", "tsx", "server/index.ts"]
