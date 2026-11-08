import { buildPresence } from '@shared/presence'
import { getDef } from '@/lib/apps'
import { formatElapsed, useElapsed } from '@/lib/utils'
import { useStore } from '@/store'
import { Card } from './ui/Card'

export function DiscordPreview(): JSX.Element | null {
  const status = useStore((s) => s.status)
  const settings = useStore((s) => s.settings)
  const elapsed = useElapsed(status.enabled && status.app ? status.startedAt : null)
  if (!settings) return null

  const live = status.enabled && status.app !== null
  const input =
    live && status.app
      ? { key: status.app.key, appName: status.app.name, project: status.project, activity: status.activity }
      : {
          key: 'photoshop' as const,
          appName: 'Photoshop',
          project: 'arte-final.psd',
          activity: 'Editando "Logo" · Pincel'
        }
  const def = getDef(input.key)
  const p = buildPresence(input, settings)

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
        Preview {live ? '' : '(exemplo)'}
      </p>
      <Card className={`bg-[#111214]/80 p-3 ${live ? '' : 'opacity-60'}`}>
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-zinc-400">Usando Adobe RPC</p>
        <div className="flex items-center gap-3">
          <div
            className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-lg text-xl font-bold"
            style={{ color: def.color, backgroundColor: `${def.color}26` }}
          >
            {def.abbr}
          </div>
          <div className="min-w-0 text-[13px] leading-snug">
            <p className="truncate font-semibold text-zinc-100">{def.name}</p>
            <p className="truncate text-zinc-300">{p.details}</p>
            {p.state && <p className="truncate text-zinc-300">{p.state}</p>}
            {settings.timerMode !== 'off' && (
              <p className="text-zinc-300">{formatElapsed(live ? elapsed : 754000)} decorrido</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
