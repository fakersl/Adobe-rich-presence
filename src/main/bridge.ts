import http from 'node:http'
import { ALL_KEYS, type AppKey } from '@shared/apps'
import { getBridgeToken, getSettings, patchSettings } from './store'

export const BRIDGE_PORT = 47321
const FRESH_MS = 10000

interface Snap {
  project: string | null
  activity: string | null
  ts: number
}

const snaps = new Map<AppKey, Snap>()
let server: http.Server | null = null
let onChangeCb: (() => void) | null = null
let installCb: (() => Promise<unknown>) | null = null

const clean = (v: unknown): string | null =>
  typeof v === 'string' && v.trim() ? v.trim().slice(0, 200) : null

export function getExt(key: AppKey): Snap | null {
  const s = snaps.get(key)
  return s && Date.now() - s.ts <= FRESH_MS ? s : null
}

export function connectedKeys(): AppKey[] {
  return ALL_KEYS.filter((k) => getExt(k) !== null)
}

function cors(res: http.ServerResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk: Buffer) => {
      body += chunk
      if (body.length > 32768) req.destroy()
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function json(res: http.ServerResponse, code: number, data: unknown): void {
  res.writeHead(code, { 'Content-Type': 'application/json' }).end(JSON.stringify(data))
}

// Public settings that the Adobe panel is allowed to READ
function publicSettings() {
  const s = getSettings()
  return {
    enabled: s.enabled,
    privateMode: s.privateMode,
    timerMode: s.timerMode,
    detailsMode: s.detailsMode,
    stateMode: s.stateMode,
    stateText: s.stateText,
    monitored: s.monitored,
    hideExtension: s.hideExtension
  }
}

// Public settings that the Adobe panel is allowed to WRITE (whitelist)
const WRITABLE = new Set([
  'enabled',
  'privateMode',
  'timerMode',
  'detailsMode',
  'stateMode',
  'stateText',
  'hideExtension'
])

/**
 * Starts the local HTTP server.
 * @param onChange called when snapshots or config change
 * @param onInstall called when the panel requests extension reinstall
 */
export function startBridge(
  onChange: () => void,
  onInstall: () => Promise<unknown>
): void {
  onChangeCb = onChange
  installCb = onInstall

  server = http.createServer(async (req, res) => {
    cors(res)

    if (req.method === 'OPTIONS') {
      res.writeHead(204).end()
      return
    }

    const url = req.url ? new URL(req.url, 'http://127.0.0.1') : null

    // ---------- POST /ext : extension sends snapshot ----------
    if (req.method === 'POST' && url?.pathname === '/ext') {
      const body = await readBody(req).catch(() => '')
      try {
        const d = JSON.parse(body) as Record<string, unknown>
        if (d.token !== getBridgeToken()) return json(res, 401, { error: 'token' })
        const key = d.host as AppKey
        if (!ALL_KEYS.includes(key)) return json(res, 200, {})
        const prev = snaps.get(key)
        const next: Snap = { project: clean(d.project), activity: clean(d.activity), ts: Date.now() }
        snaps.set(key, next)
        json(res, 200, { ok: true })
        const stale = !prev || next.ts - prev.ts > FRESH_MS
        if (stale || prev.project !== next.project || prev.activity !== next.activity) onChangeCb?.()
      } catch {
        res.writeHead(400).end()
      }
      return
    }

    // ---------- GET /config : panel reads config ----------
    if (req.method === 'GET' && url?.pathname === '/config') {
      if (url.searchParams.get('token') !== getBridgeToken()) return json(res, 401, { error: 'token' })
      return json(res, 200, publicSettings())
    }

    // ---------- POST /config : panel writes config ----------
    if (req.method === 'POST' && url?.pathname === '/config') {
      if (url.searchParams.get('token') !== getBridgeToken()) return json(res, 401, { error: 'token' })
      const body = await readBody(req).catch(() => '{}')
      try {
        const patch = JSON.parse(body) as Record<string, unknown>
        const safe: Record<string, unknown> = {}
        for (const k of Object.keys(patch)) {
          if (WRITABLE.has(k)) safe[k] = patch[k]
        }
        if (Object.keys(safe).length === 0) return json(res, 200, publicSettings())
        patchSettings(safe as never)
        onChangeCb?.()
        return json(res, 200, publicSettings())
      } catch {
        return json(res, 400, { error: 'json' })
      }
    }

    // ---------- POST /ext-install : panel requests reinstall ----------
    if (req.method === 'POST' && url?.pathname === '/ext-install') {
      if (url.searchParams.get('token') !== getBridgeToken()) return json(res, 401, { error: 'token' })
      try {
        const result = await installCb?.()
        return json(res, 200, result ?? { ok: false, message: 'install handler missing' })
      } catch (e) {
        return json(res, 500, { ok: false, message: e instanceof Error ? e.message : String(e) })
      }
    }

    // ---------- GET /health : panel checks if app is alive ----------
    if (req.method === 'GET' && url?.pathname === '/health') {
      return json(res, 200, { ok: true, version: 1 })
    }

    res.writeHead(404).end()
  })

  server.on('error', (e) => console.error('bridge:', e))
  server.listen(BRIDGE_PORT, '127.0.0.1')
}

export function stopBridge(): void {
  server?.close()
  server = null
}