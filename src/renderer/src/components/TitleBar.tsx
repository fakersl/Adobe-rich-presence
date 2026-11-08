import type { CSSProperties } from 'react'
import { Minus, X } from 'lucide-react'

const drag = { WebkitAppRegion: 'drag' } as unknown as CSSProperties
const noDrag = { WebkitAppRegion: 'no-drag' } as unknown as CSSProperties

export function TitleBar(): JSX.Element {
  return (
    <div className="flex h-9 shrink-0 items-center justify-between pl-4 pr-1" style={drag}>
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
        <span className="h-2 w-2 rounded-full bg-violet-400" />
        Adobe RPC
      </div>
      <div className="flex" style={noDrag}>
        <button
          onClick={() => window.api.minimize()}
          className="flex h-8 w-10 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Minimizar"
        >
          <Minus className="h-4 w-4" />
        </button>
        <button
          onClick={() => window.api.close()}
          className="flex h-8 w-10 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-red-500/80 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
