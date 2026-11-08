import Store from 'electron-store'
import { randomBytes } from 'node:crypto'
import { ALL_KEYS } from '@shared/apps'
import type { Settings } from '@shared/types'

const defaults: Settings = {
  clientId: '',
  detailsMode: 'project',
  stateMode: 'dynamic',
  stateText: 'Criando algo incrível',
  timerMode: 'project',
  hideExtension: false,
  privateMode: false,
  monitored: [...ALL_KEYS],
  autoLaunch: false,
  startMinimized: false,
  enabled: true
}

const store = new Store<Settings>({ defaults })
const secrets = new Store<{ bridgeToken: string }>({ name: 'bridge', defaults: { bridgeToken: '' } })

export function getSettings(): Settings {
  return { ...defaults, ...store.store }
}

export function patchSettings(patch: Partial<Settings>): Settings {
  for (const key of Object.keys(defaults) as (keyof Settings)[]) {
    const value = patch[key]
    if (value !== undefined) store.set(key, value as never)
  }
  return getSettings()
}

export function getBridgeToken(): string {
  let token = secrets.get('bridgeToken')
  if (!token) {
    token = randomBytes(16).toString('hex')
    secrets.set('bridgeToken', token)
  }
  return token
}
