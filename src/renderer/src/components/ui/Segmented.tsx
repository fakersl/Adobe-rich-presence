import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props<T extends string> {
  id: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

export function Segmented<T extends string>({ id, value, options, onChange }: Props<T>): JSX.Element {
  return (
    <div className="flex rounded-xl border border-white/10 bg-white/5 p-0.5">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'relative flex-1 rounded-[10px] px-2 py-1.5 text-xs font-medium transition-colors',
              active ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-[10px] bg-violet-500/80"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
