import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { APP_DEFS, type AppKey } from '@shared/apps'
import type { DetectedApp } from '@shared/types'

const run = promisify(execFile)

const PROCESS_NAMES = APP_DEFS.map((a) => `'${a.process}'`).join(',')

const SCRIPT = `
[Console]::OutputEncoding=[System.Text.Encoding]::UTF8
$sig='[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow(); [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint p);'
Add-Type -MemberDefinition $sig -Name Win -Namespace Native
$fg=[uint32]0
[void][Native.Win]::GetWindowThreadProcessId([Native.Win]::GetForegroundWindow(),[ref]$fg)
$r=@(Get-Process -Name ${PROCESS_NAMES} -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle } | ForEach-Object { [pscustomobject]@{ n=$_.ProcessName; t=$_.MainWindowTitle; f=([uint32]$_.Id -eq $fg) } })
if ($r.Count -eq 0) { '[]' } else { ConvertTo-Json -InputObject $r -Compress }
`

const ENCODED = Buffer.from(SCRIPT, 'utf16le').toString('base64')

interface Row {
  n: string
  t: string
  f: boolean
}

export function parseFile(title: string): string | null {
  let t = title.trim()
  t = t.replace(/^Adobe\s[^-]*?\s-\s/, '') // "Adobe Premiere Pro 2024 - "
  t = t.replace(/\s+-\s+Adobe\s.*$/, '') // " - Adobe Acrobat Pro"
  t = t.replace(/\s*@\s*\d+(\.\d+)?%.*$/, '') // " @ 100% (RGB/8)"
  t = t.replace(/\s*\*+\s*$/, '').replace(/\*+$/, '') // "*"
  t = t.split(/[\\/]/).pop() ?? t
  t = t.trim()
  return t.length > 0 ? t : null
}

export async function detect(monitored: AppKey[]): Promise<DetectedApp | null> {
  if (process.platform !== 'win32') return null
  try {
    const { stdout } = await run(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', ENCODED],
      { timeout: 4000, windowsHide: true, maxBuffer: 1024 * 1024, encoding: 'utf8' }
    )
    const text = stdout.trim()
    if (!text) return null
    const parsed: unknown = JSON.parse(text)
    const rows: Row[] = Array.isArray(parsed) ? (parsed as Row[]) : [parsed as Row]

    const found = rows
      .map((row) => {
        const def = APP_DEFS.find((a) => a.process.toLowerCase() === String(row.n).toLowerCase())
        return def ? { def, row } : null
      })
      .filter((x): x is { def: (typeof APP_DEFS)[number]; row: Row } => x !== null)
      .filter((x) => monitored.includes(x.def.key))

    if (found.length === 0) return null
    const pick = found.find((x) => x.row.f) ?? found[0]
    return { key: pick.def.key, name: pick.def.name, file: parseFile(String(pick.row.t)) }
  } catch {
    return null
  }
}
