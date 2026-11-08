import Store from 'electron-store'
import { randomBytes } from 'node:crypto'
import type { Settings } from '@shared/types'

// Fixed Discord Application ID — hardcoded, not configurable, not exposed.
export const DISCORD_CLIENT_ID = '1568795175990460426'

interface Schema {
  settings: Settings
  bridgeToken: string
}

const DEFAULT_SETTINGS: Settings = {
  clientId: DISCORD_CLIENT_ID,
  detailsMode: 'project',
  stateMode: 'dynamic',
  stateText: '',
  timerMode: 'app',
  hideExtension: false,
  privateMode: false,
  monitored: ['photoshop', 'illustrator', 'premiere', 'aftereffects', 'indesign'],
  autoLaunch: true,
  startMinimized: true,
  enabled: true
}

const store = new Store<Schema>({
  name: 'config',
  defaults: {
    settings: DEFAULT_SETTINGS,
    bridgeToken: randomBytes(24).toString('hex')
  }
})

function normalize(s: Settings): Settings {
  // Force the fixed clientId — even if the on-disk config has a different one
  return { ...DEFAULT_SETTINGS, ...s, clientId: DISCORD_CLIENT_ID }
}

export function getSettings(): Settings {
  const raw = store.get('settings') as Settings
  const normalized = normalize(raw)
  // Persist correction if the on-disk value was wrong
  if (raw.clientId !== DISCORD_CLIENT_ID) {
    store.set('settings', normalized)
  }
  return normalized
}

export function patchSettings(patch: Partial<Settings>): Settings {
  // Strip clientId from any patch — it must never be changed
  const { clientId: _ignored, ...safe } = patch
  const current = getSettings()
  const next = normalize({ ...current, ...safe })
  store.set('settings', next)
  return next
}

export function getBridgeToken(): string {
  return store.get('bridgeToken')
}