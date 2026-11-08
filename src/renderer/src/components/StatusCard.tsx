import { AnimatePresence, motion } from 'framer-motion'
import { Clock, MonitorOff, Power } from 'lucide-react'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'
import { getDef } from '@/lib/apps'
import { formatElapsed, useElapsed } from '@/lib/utils'
import { useStore } from '@/store'

export function StatusCard(): JSX.Element {
  const status = useStore((s) => s.status)
  const app = status.enabled ? status.app : null
  const def = app ? getDef(app.key) : null
  const elapsed = useElapsed(app ? status.startedAt : null)
  const viaExt = app ? status.extensions.includes(app.key) : false

  return (
    <Card
      className="relative overflow-hidden transition-shadow duration-500"
      style={{
        boxShadow: def ? `0 0 48px -10px ${def.color}80` : undefined,
        borderColor: def ? `${def.color}40` : undefined
      }}
    >
      {def && (
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl"
          style={{ backgroundColor: `${def.color}30` }}
        />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={app?.key ?? (status.enabled ? 'idle' : 'off')}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="relative flex items-center gap-4"
        >
          {app && def ? (
            <>
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-2xl font-bold"
                style={{ color: def.color, backgroundColor: `${def.color}1f`, borderColor: `${def.color}66` }}
              >
                {def.abbr}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">{def.name}</p>
                  <Badge className={viaExt ? 'border-emerald-400/30 text-emerald-300' : ''}>
                    {viaExt ? 'extensão' : 'título da janela'}
                  </Badge>
                </div>
                <p className="truncate text-base font-semibold">{status.project ?? 'Sem projeto'}</p>
                {status.activity && <p className="truncate text-sm text-zinc-300">{status.activity}</p>}
                <p className="mt-1 flex items-center gap-1.5 font-mono text-sm text-zinc-300">
                  <Clock className="h-3.5 w-3.5" />
                  {formatElapsed(elapsed)}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-zinc-500">
                {status.enabled ? <MonitorOff className="h-7 w-7" /> : <Power className="h-7 w-7" />}
              </div>
              <div>
                <p className="text-base font-semibold text-zinc-200">
                  {status.enabled ? 'Nenhum app Adobe detectado' : 'RPC desligado'}
                </p>
                <p className="text-sm text-zinc-500">
                  {status.enabled ? 'Abra um app Adobe para começar' : 'Ligue o botão acima'}
                </p>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </Card>
  )
}
