import { app, shell } from 'electron'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ExtInfo, ExtInstallResult } from '@shared/types'
import { BRIDGE_PORT } from './bridge'
import { getBridgeToken } from './store'

const run = promisify(execFile)

function srcDir(): string {
  return app.isPackaged
    ? join(process.resourcesPath, 'extension')
    : join(__dirname, '../../resources/extension')
}

export function extensionDir(): string {
  const base = process.env.APPDATA ?? join(app.getPath('home'), 'AppData', 'Roaming')
  return join(base, 'Adobe', 'CEP', 'extensions', 'com.adobe-rpc.panel')
}

export function extensionInfo(): ExtInfo {
  return { installed: existsSync(join(extensionDir(), 'CSXS', 'manifest.xml')), path: extensionDir() }
}

export async function installExtension(): Promise<ExtInstallResult> {
  if (process.platform !== 'win32') return { ok: false, message: 'Disponível só no Windows.' }
  try {
    if (!existsSync(srcDir())) return { ok: false, message: 'Pasta da extensão não encontrada.' }
    const dest = extensionDir()
    mkdirSync(dest, { recursive: true })
    cpSync(srcDir(), dest, { recursive: true, force: true })
    writeFileSync(
      join(dest, 'config.json'),
      JSON.stringify({ port: BRIDGE_PORT, token: getBridgeToken() })
    )

    await Promise.all(
      [6, 7, 8, 9, 10, 11, 12, 13].map((v) =>
        run(
          'reg',
          ['add', `HKCU\\Software\\Adobe\\CSXS.${v}`, '/v', 'PlayerDebugMode', '/t', 'REG_SZ', '/d', '1', '/f'],
          { windowsHide: true }
        ).catch(() => null)
      )
    )
    return {
      ok: true,
      message: 'Instalada. Reinicie o app Adobe e abra Janela → Extensões → Adobe RPC.'
    }
  } catch (e) {
    return { ok: false, message: 'Falha ao instalar: ' + (e instanceof Error ? e.message : String(e)) }
  }
}

export function openExtensionFolder(): void {
  void shell.openPath(extensionDir())
}

export async function ensureExtensionInstalled(): Promise<void> {
  if (!app.isPackaged) return
  if (!extensionInfo().installed) {
    await installExtension()
  } else {
    // Reinstala sempre que a versão do app mudar (upgrade)
    const marker = join(extensionDir(), '.version')
    const current = app.getVersion()
    if (!existsSync(marker)) {
      await installExtension()
      try {
        writeFileSync(marker, current)
      } catch {
        /* ignore */
      }
    }
  }
}