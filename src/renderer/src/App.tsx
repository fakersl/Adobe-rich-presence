import { useEffect } from 'react'
import { useStore } from '@/store'
import { TitleBar } from '@/components/TitleBar'
import { StatusCard } from '@/components/StatusCard'
import { DiscordPreview } from '@/components/DiscordPreview'
import { SettingsPanel } from '@/components/SettingsPanel'
import { ExtensionCard } from '@/components/ExtensionCard'
import { AppSelector } from '@/components/AppSelector'
import { Switch } from '@/components/ui/Switch'

export default function App(): JSX.Element {
  const init = useStore((s) => s.init)
  const status = useStore((s) => s.status)
  const settings = useStore((s) => s.settings)
  const toggleRpc = useStore((s) => s.toggleRpc)

  useEffect(() => {
    void init()
  }, [init])

  const noId = settings !== null && !settings.clientId.trim()
  const label = !status.enabled
    ? 'Desligado'
    : noId
      ? 'Sem Client ID'
      : status.connected
        ? 'Conectado ao Discord'
        : 'Desconectado · reconectando'
  const ok = status.enabled && status.connected

  return (
    <div className="flex h-full flex-col">
      <TitleBar />
      <main className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-5 pb-5 pt-2">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Adobe RPC</h1>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-400">
              <span className="relative flex h-2.5 w-2.5">
                {ok && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                )}
                <span
                  className={`relative inline-flex h-2.5 w-2.5 rounded-full ${ok ? 'bg-emerald-400' : 'bg-red-500'}`}
                />
              </span>
              {label}
            </div>
          </div>
          <Switch checked={status.enabled} onCheckedChange={toggleRpc} />
        </header>

        <StatusCard />
        <DiscordPreview />
        <ExtensionCard />
        <SettingsPanel />
        <AppSelector />
      </main>
    </div>
  )
}
