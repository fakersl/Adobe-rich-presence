import type { AppKey } from './apps'

export type DetailsMode = 'project' | 'app'
export type StateMode = 'dynamic' | 'custom' | 'none'
export type TimerMode = 'app' | 'project' | 'off'

export interface Settings {
  clientId: string
  detailsMode: DetailsMode
  stateMode: StateMode
  stateText: string
  timerMode: TimerMode
  hideExtension: boolean
  privateMode: boolean
  monitored: AppKey[]
  autoLaunch: boolean
  startMinimized: boolean
  enabled: boolean
}

export interface DetectedApp {
  key: AppKey
  name: string
  file: string | null
}

export interface RpcStatus {
  connected: boolean
  enabled: boolean
  app: DetectedApp | null
  project: string | null
  activity: string | null
  startedAt: number | null
  extensions: AppKey[]
  error?: string
}

export interface ExtInstallResult {
  ok: boolean
  message: string
}

export interface ExtInfo {
  installed: boolean
  path: string
}

export const IPC = {
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  rpcToggle: 'rpc:toggle',
  statusGet: 'status:get',
  status: 'status:update',
  minimize: 'window:minimize',
  close: 'window:close',
  extInstall: 'ext:install',
  extInfo: 'ext:info',
  extOpen: 'ext:open'
} as const

export interface Api {
  getSettings: () => Promise<Settings>
  setSettings: (patch: Partial<Settings>) => Promise<Settings>
  toggleRpc: () => Promise<Settings>
  getStatus: () => Promise<RpcStatus>
  onStatus: (cb: (s: RpcStatus) => void) => () => void
  minimize: () => void
  close: () => void
  installExtension: () => Promise<ExtInstallResult>
  extensionInfo: () => Promise<ExtInfo>
  openExtensionFolder: () => void
}