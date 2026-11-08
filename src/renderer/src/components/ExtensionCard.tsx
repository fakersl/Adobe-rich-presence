import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FolderOpen, Puzzle } from 'lucide-react'
import type { ExtInfo } from '@shared/types'
import { APP_DEFS } from '@/lib/apps'
import { useStore } from '@/store'
import { Card } from './ui/Card'
import { Button } from './ui/Button'

const SUPPORTED = ['photoshop', 'illustrator', 'premiere', 'aftereffects', 'indesign']

export function ExtensionCard(): JSX.Element {
  const connected = useStore((s) => s.status.extensions)
  const [info, setInfo] = useState<ExtInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    void window.api.extensionInfo().then(setInfo)
  }, [])

  const install = async (): Promise<void> => {
    setBusy(true)
    const r = await window.api.installExtension()
    setMsg({ ok: r.ok, text: r.message })
    setInfo(await window.api.extensionInfo())
    setBusy(false)
  }

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Extensão Adobe</p>
      <Card className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
            <Puzzle className="h-5 w-5" />
          </div>
          <p className="text-xs leading-relaxed text-zinc-400">
            Lê o projeto aberto e o que você está fazendo (camada, ferramenta, comp, sequência, página) direto
            do app Adobe.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {APP_DEFS.filter((d) => SUPPORTED.includes(d.key)).map((d) => {
            const on = connected.includes(d.key)
            return (
              <span
                key={d.key}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-zinc-300"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${on ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                {d.abbr}
              </span>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" onClick={() => void install()} disabled={busy} className="flex-1">
            {busy ? 'Instalando...' : info?.installed ? 'Reinstalar extensão' : 'Instalar extensão'}
          </Button>
          <Button onClick={() => window.api.openExtensionFolder()} aria-label="Abrir pasta">
            <FolderOpen className="h-4 w-4" />
          </Button>
        </div>

        {msg && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs ${msg.ok ? 'text-emerald-300' : 'text-red-400'}`}
          >
            {msg.text}
          </motion.p>
        )}
        <p className="text-[11px] text-zinc-500">
          Lightroom e Acrobat usam só o título da janela. No Photoshop recente o menu pode se chamar
          "Extensões (legado)".
        </p>
      </Card>
    </div>
  )
}
