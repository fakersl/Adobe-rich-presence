import { create } from 'zustand'
import type { RpcStatus, Settings } from '@shared/types'

interface State {
  settings: Settings | null
  status: RpcStatus
  init: () => Promise<void>
  update: (patch: Partial<Settings>) => void
  toggleRpc: () => void
}

let initialized = false

export const useStore = create<State>((set, get) => ({
  settings: null,
  status: { connected: false, enabled: true, app: null, project: null, activity: null, startedAt: null, extensions: [] },

  init: async () => {
    if (initialized) return
    initialized = true
    const [settings, status] = await Promise.all([window.api.getSettings(), window.api.getStatus()])
    set({ settings, status })
    window.api.onStatus((s) => set({ status: s }))
  },

  update: (patch) => {
    const current = get().settings
    if (!current) return
    set({ settings: { ...current, ...patch } })
    void window.api.setSettings(patch).then((s) => set({ settings: s }))
  },

  toggleRpc: () => {
    const { status } = get()
    set({ status: { ...status, enabled: !status.enabled } })
    void window.api.toggleRpc().then((s) => set({ settings: s }))
  }
}))
