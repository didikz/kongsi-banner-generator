import { Hono } from 'hono'

type Env = {
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Env }>()

// no-transform stops Cloudflare from injecting its Web Analytics beacon into our HTML,
// which keeps the strict CSP in index.html error-free.
const HTML_CACHE = 'public, max-age=0, must-revalidate, no-transform'

async function shell(env: Env, requestUrl: string) {
  const url = new URL(requestUrl)
  url.pathname = '/index.html'
  const res = await env.ASSETS.fetch(url.toString())
  const out = new Response(res.body, res)
  out.headers.set('Cache-Control', HTML_CACHE)
  return out
}

app.get('/api/health', (c) =>
  c.json({ ok: true, service: 'kongsi-banner-generator', version: '1.0.0' }),
)

// Missing static assets get a real 404 instead of the SPA shell.
app.get('/assets/*', (c) => c.text('not found', 404))

// The worker serves the HTML shell (see run_worker_first in wrangler.toml) and the SPA fallback.
app.get('/', (c) => shell(c.env, c.req.url))
app.get('/index.html', (c) => shell(c.env, c.req.url))
app.get('*', (c) => shell(c.env, c.req.url))

export default app
