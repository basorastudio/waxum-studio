// Cloudflare Pages Functions entrypoint. Hono handles everything under /api/*.
// D1 binding `DB` stores flows. `WAXUM_API_BASE` is the upstream Waxum core URL.
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { handle } from 'hono/cloudflare-pages'

type Env = {
  DB: D1Database
  WAXUM_API_BASE: string
}

const app = new Hono<{ Bindings: Env }>().basePath('/api')

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'] }))

app.get('/health', async (c) => {
  const row = await c.env.DB.prepare('SELECT 1 AS ok').first<{ ok: number }>()
  return c.json({ status: row?.ok === 1 ? 'ok' : 'degraded', database: 'd1-sqlite' })
})

// Ensure the flows table exists on first hit — cheap enough for a tiny app.
async function ensureSchema(db: D1Database) {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS flows (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        graph TEXT NOT NULL DEFAULT '{}',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )`,
    )
    .run()
}

app.get('/flows', async (c) => {
  await ensureSchema(c.env.DB)
  const { results } = await c.env.DB.prepare(
    'SELECT id, name, updated_at FROM flows ORDER BY updated_at DESC',
  ).all()
  return c.json(results ?? [])
})

app.post('/flows', async (c) => {
  await ensureSchema(c.env.DB)
  const { name } = await c.req.json<{ name: string }>()
  if (!name || !name.trim()) return c.json({ error: 'name required' }, 400)
  const id = crypto.randomUUID()
  const now = Date.now()
  await c.env.DB.prepare(
    'INSERT INTO flows (id, name, graph, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
  )
    .bind(id, name.trim(), '{}', now, now)
    .run()
  return c.json({ id, name: name.trim(), updated_at: now })
})

app.get('/flows/:id', async (c) => {
  await ensureSchema(c.env.DB)
  const id = c.req.param('id')
  const row = await c.env.DB.prepare(
    'SELECT id, name, graph, updated_at FROM flows WHERE id = ?',
  )
    .bind(id)
    .first<{ id: string; name: string; graph: string; updated_at: number }>()
  if (!row) return c.json({ error: 'not found' }, 404)
  return c.json({
    id: row.id,
    name: row.name,
    graph: JSON.parse(row.graph || '{}'),
    updated_at: row.updated_at,
  })
})

app.put('/flows/:id', async (c) => {
  await ensureSchema(c.env.DB)
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
  await c.env.DB.prepare(`UPDATE flows SET ${patches.join(', ')} WHERE id = ?`).bind(...values).run()
  return c.json({ ok: true })
})

app.delete('/flows/:id', async (c) => {
  await ensureSchema(c.env.DB)
  const id = c.req.param('id')
  await c.env.DB.prepare('DELETE FROM flows WHERE id = ?').bind(id).run()
  return c.json({ ok: true })
})

// Thin passthrough to Waxum core — the client sends { token, path, method, body },
// we call the upstream API without CORS pain. Only used from server-side later.
app.post('/waxum/call', async (c) => {
  const { token, path, method, body } = await c.req.json<{
    token: string
    path: string
    method?: string
    body?: unknown
  }>()
  const url = new URL(path, c.env.WAXUM_API_BASE).toString()
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

export const onRequest = handle(app)
