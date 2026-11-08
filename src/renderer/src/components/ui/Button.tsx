import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Props extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'ghost'
}

export function Button({ className, variant = 'ghost', ...props }: Props): JSX.Element {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
        variant === 'primary'
          ? 'bg-violet-500 text-white hover:bg-violet-400'
          : 'text-zinc-300 hover:bg-white/10',
        className
      )}
      {...props}
    />
  )
}
