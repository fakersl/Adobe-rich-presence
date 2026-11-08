import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <div
      className={cn('rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl', className)}
      {...props}
    />
  )
}
