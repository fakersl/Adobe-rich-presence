import { Client } from '@xhayper/discord-rpc'
import { buildPresence } from '@shared/presence'
import type { DetectedApp, RpcStatus } from '@shared/types'
import { detect } from './detector'
import { connectedKeys, getExt } from './bridge'
import { getSettings } from './store'

const DETECT_MS = 5000
const RECONNECT_MS = 10000
const MIN_UPDATE_MS = 15000

let client: Client | null = null
let activeClientId = ''
let connected = false
let connecting = false
let busy = false
let rerun = false
let app: DetectedApp | null = null
let startedAt: number | null = null
let lastApp: string | null = null
let lastProject: string | null = null
let lastPayload: string | null = null
let lastSentAt = 0
let lastError: string | undefined
let listener: ((s: RpcStatus) => void) | null = null
let detectTimer: NodeJS.Timeout | null = null
let connectTimer: NodeJS.Timeout | null = null

function resolve(): { project: string | null; activity: string | null } {
  if (!app) return { project: null, activity: null }
  const ext = getExt(app.key)
  return { project: ext?.project ?? app.file, activity: ext?.activity ?? null }
}

export function getStatus(): RpcStatus {
  const { project, activity } = resolve()
  return {
    connected,
    enabled: getSettings().enabled,
    app,
    project,
    activity,
    startedAt,
    extensions: connectedKeys(),
    error: lastError
  }
}

function emit(): void {
  listener?.(getStatus())
}

function updateTimer(): void {
  if (!app) {
    lastApp = null
    lastProject = null
    startedAt = null
    return
  }
  const { project } = resolve()
  const appChanged = app.key !== lastApp
  const projectChanged = getSettings().timerMode === 'project' && project !== lastProject
  if (appChanged || projectChanged) startedAt = Date.now()
  lastApp = app.key
  lastProject = project
}

async function destroyClient(): Promise<void> {
  const c = client
  client = null
  connected = false
  lastPayload = null
  if (c) {
    try {
      c.removeAllListeners()
      await c.destroy()
    } catch {
      /* ignore */
    }
  }
}

async function connect(): Promise<void> {
  const s = getSettings()
  const id = s.clientId.trim()
  if (!s.enabled || !id || connected || connecting) return
  connecting = true
  activeClientId = id
  const c = new Client({ clientId: id })
  client = c
  c.on('ready', () => {
    if (client !== c) return
    connected = true
    lastPayload = null
    lastError = undefined
    emit()
  })
  c.on('disconnected', () => {
    if (client !== c) return
    void destroyClient().then(emit)
  })
  try {
    await c.login()
    if (client === c && !connected) {
      connected = true
      lastError = undefined
      emit()
    }
  } catch {
    if (client === c) {
      lastError = 'Discord fechado ou Client ID inválido'
      await destroyClient()
    }
    emit()
  } finally {
    connecting = false
  }
}

async function pushActivity(): Promise<void> {
  const s = getSettings()
  const c = client
  if (!c || !connected || !c.user) return

  try {
    if (!s.enabled || !app) {
      if (lastPayload !== null) {
        await c.user.clearActivity()
        lastPayload = null
      }
      return
    }

    const { project, activity } = resolve()
    const p = buildPresence({ appName: app.name, project, activity }, s)
    const payload = {
      details: p.details,
      state: p.state,
      startTimestamp: s.timerMode !== 'off' && startedAt ? startedAt : undefined,
      largeImageKey: app.key,
      largeImageText: app.name
    }
    const key = JSON.stringify(payload)
    if (key === lastPayload) return
    if (Date.now() - lastSentAt < MIN_UPDATE_MS) return

    await c.user.setActivity(payload)
    lastPayload = key
    lastSentAt = Date.now()
  } catch {
    lastError = 'Falha ao atualizar a presença'
    await destroyClient()
    emit()
  }
}

async function tick(): Promise<void> {
  if (busy) {
    rerun = true
    return
  }
  busy = true
  try {
    const s = getSettings()
    app = s.enabled ? await detect(s.monitored) : null
    updateTimer()
    emit()
    await pushActivity()
  } catch {
    /* ignore */
  } finally {
    busy = false
    if (rerun) {
      rerun = false
      void tick()
    }
  }
}

export function onBridgeUpdate(): void {
  if (!app) return
  updateTimer()
  emit()
  void pushActivity()
}

export async function refresh(): Promise<void> {
  const s = getSettings()
  if (client && (!s.enabled || activeClientId !== s.clientId.trim())) {
    await destroyClient()
  }
  emit()
  void tick()
  void connect()
}

export function startRpc(onStatus: (s: RpcStatus) => void): void {
  listener = onStatus
  void connect()
  void tick()
  detectTimer = setInterval(() => void tick(), DETECT_MS)
  connectTimer = setInterval(() => void connect(), RECONNECT_MS)
}

export async function stopRpc(): Promise<void> {
  if (detectTimer) clearInterval(detectTimer)
  if (connectTimer) clearInterval(connectTimer)
  detectTimer = null
  connectTimer = null
  await destroyClient()
}
