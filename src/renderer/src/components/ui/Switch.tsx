import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  disabled?: boolean
}

export function Switch({ checked, onCheckedChange, disabled }: Props): JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors disabled:opacity-50',
        checked ? 'justify-end bg-violet-500' : 'justify-start bg-white/15'
      )}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 35 }}
        className="h-5 w-5 rounded-full bg-white shadow"
      />
    </button>
  )
}
