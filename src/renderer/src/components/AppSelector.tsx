import { motion } from 'framer-motion'
import { APP_DEFS, type AppKey } from '@/lib/apps'
import { useStore } from '@/store'
import { Checkbox } from './ui/Checkbox'

export function AppSelector(): JSX.Element | null {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.update)
  if (!settings) return null

  const toggle = (key: AppKey): void => {
    const has = settings.monitored.includes(key)
    update({ monitored: has ? settings.monitored.filter((k) => k !== key) : [...settings.monitored, key] })
  }

  return (
    <div className="space-y-2">
      <p className="px-1 text-xs font-medium uppercase tracking-wider text-zinc-500">Apps monitorados</p>
      <div className="grid grid-cols-2 gap-2">
        {APP_DEFS.map((d) => {
          const on = settings.monitored.includes(d.key)
          return (
            <motion.button
              key={d.key}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => toggle(d.key)}
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors"
              style={{
                borderColor: on ? `${d.color}66` : 'rgba(255,255,255,0.1)',
                backgroundColor: on ? `${d.color}14` : 'rgba(255,255,255,0.03)',
                opacity: on ? 1 : 0.55
              }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold"
                style={{ color: d.color, backgroundColor: `${d.color}26` }}
              >
                {d.abbr}
              </span>
              <span className="flex-1 truncate text-sm font-medium text-zinc-100">{d.name}</span>
              <Checkbox checked={on} onCheckedChange={() => toggle(d.key)} color={d.color} />
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
