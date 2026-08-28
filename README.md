<p align="center">
  <img src="https://waxum.imtaqin.id/img/logo.png" alt="Waxum Studio" width="140" />
</p>

<h1 align="center">Waxum Studio</h1>

<p align="center">
  Visual WhatsApp workflow builder. Drag, connect, ship.
</p>

<p align="center">
  <a href="https://studio.waxum.imtaqin.id">Live</a> ·
  <a href="https://waxum.imtaqin.id">Waxum core</a>
</p>

---

Node-graph editor for building WhatsApp automation pipelines on top of
[Waxum](https://github.com/imtaqin/waxum). Triggers, WhatsApp actions,
logic, and integrations wired together on a canvas.

## Stack

- Vue 3 + Vite + TypeScript
- Vue Flow (node-graph editor)
- Tailwind + Pinia + Vue Router
- Hono on Cloudflare Pages Functions (serverless backend)
- D1 (SQLite) for flow persistence

## Dev

```bash
pnpm install
pnpm dev
```

Backend routes live under `functions/api/`. Wrangler local dev:

```bash
pnpm build
pnpm wrangler:dev
```

Set the D1 database id in `wrangler.toml` after creating one:

```bash
wrangler d1 create waxum-studio
```

Local development persists flows in SQLite at `.data/waxum-studio.sqlite`.
Override it with `STUDIO_DATABASE_PATH=/absolute/path/studio.sqlite`. The
connection enables WAL mode, foreign keys, and a busy timeout for reliable
concurrent saves. Cloudflare deployments use D1, Cloudflare's SQLite database.

Database readiness is available at `GET /api/health` in both environments.

## Deploy

Push to `main`. GitHub Actions runs `pnpm build` then
`wrangler pages deploy dist`. Requires `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID` in repo secrets.

## Self-host (Docker Compose)

Skip Cloudflare entirely — the Node/Hono/`better-sqlite3` dev server also
serves the built frontend when `SERVE_STATIC=true`, so one container is the
whole app:

```bash
git clone https://github.com/imtaqin/waxum-studio.git
cd waxum-studio
docker compose up -d
```

Open `http://localhost:8787`. Flows persist in the `studio_data` volume.
Point it at your own Waxum instance with `WAXUM_API_BASE` (defaults to
`https://waxum.imtaqin.id`):

```bash
WAXUM_API_BASE=http://my-waxum-host:3451 docker compose up -d
```

## Roadmap

- Trigger sources: webhook, incoming message, cron
- WhatsApp actions: text, image, cta url, poll, template, react
- Logic: branch, delay, merge, loop
- Integrations: Slack, Discord, Google Sheets, OpenAI, Notion, HTTP
- Run history + retry queue on D1
- Team collab (multi-user cursors, permissions)

## License

MIT
