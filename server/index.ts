// Local dev server. Node + Hono + better-sqlite3. Runs on http://localhost:8787.
// Same route shape as the Cloudflare Pages Functions handler in `functions/api/`,
// so the Vue app doesn't care which backend it is talking to.
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import Database from 'better-sqlite3'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '..', '.data')
fs.mkdirSync(DATA_DIR, { recursive: true })
const DB_PATH = path.resolve(process.env.STUDIO_DATABASE_PATH || path.join(DATA_DIR, 'waxum-studio.sqlite'))
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('busy_timeout = 5000')
db.exec(`CREATE TABLE IF NOT EXISTS flows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  graph TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
)`)

const WAXUM_API_BASE = process.env.WAXUM_API_BASE || 'https://waxum.imtaqin.id'

const app = new Hono().basePath('/api')

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

app.get('/health', (c) => {
  const result = db.prepare('SELECT 1 AS ok').get() as { ok: number }
  return c.json({ status: result.ok === 1 ? 'ok' : 'degraded', database: 'sqlite' })
})

app.get('/flows', (c) => {
  const rows = db
    .prepare('SELECT id, name, updated_at FROM flows ORDER BY updated_at DESC')
    .all()
  return c.json(rows)
})

app.post('/flows', async (c) => {
  const { name } = await c.req.json<{ name: string }>()
  if (!name || !name.trim()) return c.json({ error: 'name required' }, 400)
  const id = crypto.randomUUID()
  const now = Date.now()
  db.prepare(
    'INSERT INTO flows (id, name, graph, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  ).run(id, name.trim(), '{}', now, now)
  return c.json({ id, name: name.trim(), updated_at: now })
})

app.get('/flows/:id', (c) => {
  const id = c.req.param('id')
  const row = db
    .prepare('SELECT id, name, graph, updated_at FROM flows WHERE id = ?')
    .get(id) as { id: string; name: string; graph: string; updated_at: number } | undefined
  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json({
    id: row.id,
    name: row.name,
    graph: JSON.parse(row.graph || '{}'),
    updated_at: row.updated_at,
  })
})

app.put('/flows/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json<{ name?: string; graph?: unknown }>()
  const patches: string[] = []
  const values: unknown[] = []
  if (body.name !== undefined) {
    patches.push('name = ?')
    values.push(body.name)
  }
  if (body.graph !== undefined) {
    patches.push('graph = ?')
    values.push(JSON.stringify(body.graph))
  }
  if (!patches.length) return c.json({ ok: true })
  patches.push('updated_at = ?')
  values.push(Date.now())
  values.push(id)
  db.prepare(`UPDATE flows SET ${patches.join(', ')} WHERE id = ?`).run(...(values as any[]))
  return c.json({ ok: true })
})

app.delete('/flows/:id', (c) => {
  const id = c.req.param('id')
  db.prepare('DELETE FROM flows WHERE id = ?').run(id)
  return c.json({ ok: true })
})

app.post('/waxum/call', async (c) => {
  const { token, path: apiPath, method, body } = await c.req.json<{
    token: string
    path: string
    method?: string
    body?: unknown
  }>()
  const url = new URL(apiPath, WAXUM_API_BASE).toString()
  const res = await fetch(url, {
    method: method || 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const text = await res.text()
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  })
})

const PORT = Number(process.env.PORT || 8787)
serve({ fetch: app.fetch, port: PORT })
console.log(`[waxum-studio api] listening on http://localhost:${PORT}`)
console.log(`[waxum-studio api] db: ${DB_PATH}`)
