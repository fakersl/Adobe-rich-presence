import { app, ipcMain, Menu, nativeImage, Tray } from 'electron'
import { join } from 'node:path'
import { IPC, type RpcStatus, type Settings } from '@shared/types'
import { getSettings, patchSettings } from './store'
import { getStatus, onBridgeUpdate, refresh, startRpc, stopRpc } from './rpc'
import { installExtension, ensureExtensionInstalled } from './extension'
import { startBridge, stopBridge } from './bridge'
import { setAutoLaunch } from './autolaunch'

let tray: Tray | null = null
let quitting = false

function iconPath(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'icon.ico')
    : join(__dirname, '../../resources/icon.ico')
}

function buildTrayMenu(): Menu {
  const enabled = getSettings().enabled
  return Menu.buildFromTemplate([
    {
      label: enabled ? '● Rich Presence: ON' : '○ Rich Presence: OFF',
      click: () => void applyPatch({ enabled: !getSettings().enabled })
    },
    {
      label: getSettings().privateMode ? '● Modo privado' : '○ Modo privado',
      click: () => void applyPatch({ privateMode: !getSettings().privateMode })
    },
    { type: 'separator' },
    { label: 'Reinstalar extensão nos apps Adobe', click: () => void installExtension() },
    { type: 'separator' },
    {
      label: 'Sair (desliga o RPC)',
      click: () => {
        quitting = true
        app.quit()
      }
    }
  ])
}

function createTray(): void {
  let image = nativeImage.createFromPath(iconPath())
  // Reduz para 16x16 pra ficar discreto
  if (!image.isEmpty()) image = image.resize({ width: 16, height: 16 })
  else image = nativeImage.createEmpty()
  tray = new Tray(image)
  tray.setToolTip('Adobe RPC (rodando em segundo plano)')
  tray.setContextMenu(buildTrayMenu())
}

function onStatus(status: RpcStatus): void {
  tray?.setToolTip(
    status.app
      ? `Adobe RPC — ${status.app.name}${status.project ? ` · ${status.project}` : ''}`
      : status.connected
        ? 'Adobe RPC — Discord conectado'
        : 'Adobe RPC — Discord desconectado'
  )
  tray?.setContextMenu(buildTrayMenu())
}

async function applyPatch(patch: Partial<Settings>): Promise<Settings> {
  const next = patchSettings(patch)
  if ('autoLaunch' in patch) await setAutoLaunch(next.autoLaunch)
  await refresh()
  return next
}

function registerIpc(): void {
  ipcMain.handle(IPC.settingsGet, () => getSettings())
  ipcMain.handle(IPC.settingsSet, (_e, patch: Partial<Settings>) => applyPatch(patch ?? {}))
  ipcMain.handle(IPC.rpcToggle, () => applyPatch({ enabled: !getSettings().enabled }))
  ipcMain.handle(IPC.statusGet, () => getStatus())
  ipcMain.handle(IPC.extInstall, () => installExtension())
  ipcMain.on(IPC.extOpen, () => {})
  ipcMain.on(IPC.minimize, () => {})
  ipcMain.on(IPC.close, () => {})
}

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  app.on('window-all-closed', () => {
  })
  app.on('before-quit', () => {
    quitting = true
  })
  app.on('will-quit', () => {
    stopBridge()
    void stopRpc()
  })

  void app.whenReady().then(async () => {
    registerIpc()
    createTray()
    await setAutoLaunch(getSettings().autoLaunch)
    startBridge(onBridgeUpdate, installExtension) 
    startRpc(onStatus)
    await ensureExtensionInstalled()
  })
}