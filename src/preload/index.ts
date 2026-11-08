import { contextBridge, ipcRenderer } from 'electron'
import { IPC, type Api, type RpcStatus } from '../shared/types'

const api: Api = {
  getSettings: () => ipcRenderer.invoke(IPC.settingsGet),
  setSettings: (patch) => ipcRenderer.invoke(IPC.settingsSet, patch),
  toggleRpc: () => ipcRenderer.invoke(IPC.rpcToggle),
  getStatus: () => ipcRenderer.invoke(IPC.statusGet),
  minimize: () => ipcRenderer.send(IPC.minimize),
  close: () => ipcRenderer.send(IPC.close),
  installExtension: () => ipcRenderer.invoke(IPC.extInstall),
  extensionInfo: () => ipcRenderer.invoke(IPC.extInfo),
  openExtensionFolder: () => ipcRenderer.send(IPC.extOpen),
  onStatus: (cb) => {
    const handler = (_e: unknown, s: RpcStatus): void => cb(s)
    ipcRenderer.on(IPC.status, handler)
    return () => {
      ipcRenderer.removeListener(IPC.status, handler)
    }
  }
}

contextBridge.exposeInMainWorld('api', api)
