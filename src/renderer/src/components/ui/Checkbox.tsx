import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  checked: boolean
  onCheckedChange: (v: boolean) => void
  color?: string
}

export function Checkbox({ checked, onCheckedChange, color = '#8b5cf6' }: Props): JSX.Element {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex h-4 w-4 items-center justify-center rounded border transition-colors',
        checked ? 'border-transparent' : 'border-white/20 bg-transparent'
      )}
      style={checked ? { backgroundColor: color } : undefined}
    >
      {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
    </button>
  )
}
