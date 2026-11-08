import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useStore } from '@/store'
import { Card } from './ui/Card'
import { Switch } from './ui/Switch'
import { Segmented } from './ui/Segmented'

const inputCls =
  'w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 outline-none transition-colors placeholder:text-zinc-600 focus:border-violet-400/60'

function Field(props: { label: string; hint?: string; children: ReactNode }): JSX.Element {
  return (
    <div className="space-y-1.5">
      <div>
        <p className="text-sm font-medium text-zinc-100">{props.label}</p>
        {props.hint && <p className="text-xs text-zinc-500">{props.hint}</p>}
      </div>
      {props.children}
    </div>
  )
}

function Row(props: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-zinc-100">{props.label}</p>
        {props.desc && <p className="text-xs text-zinc-500">{props.desc}</p>}
      </div>
      <Switch checked={props.checked} onCheckedChange={props.onChange} />
    </div>
  )
}

function Title({ children }: { children: ReactNode }): JSX.Element {
  return <p className="px-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{children}</p>
}

export function SettingsPanel(): JSX.Element | null {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.update)
  const [state, setState] = useState('')
  const [clientId, setClientId] = useState('')

  useEffect(() => {
    if (settings) {
      setState(settings.stateText)
      setClientId(settings.clientId)
    }
  }, [settings?.stateText, settings?.clientId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!settings) return null

  return (
    <>
      <div className="space-y-2">
        <Title>Exibição</Title>
        <Card className="space-y-4">
          <Field label="Título" hint="Linha principal do card">
            <Segmented
              id="details"
              value={settings.detailsMode}
              onChange={(v) => update({ detailsMode: v })}
              options={[
                { value: 'project', label: 'Nome do projeto' },
                { value: 'app', label: 'Só o app' }
              ]}
            />
          </Field>

          <Field label="Atividade" hint="Dinâmica usa a extensão (camada, comp, página...)">
            <Segmented
              id="state"
              value={settings.stateMode}
              onChange={(v) => update({ stateMode: v })}
              options={[
                { value: 'dynamic', label: 'Dinâmica' },
                { value: 'custom', label: 'Texto fixo' },
                { value: 'none', label: 'Nenhuma' }
              ]}
            />
            {settings.stateMode !== 'none' && (
              <input
                className={inputCls}
                value={state}
                maxLength={128}
                placeholder="Texto fixo (ou fallback sem extensão)"
                onChange={(e) => setState(e.target.value)}
                onBlur={() => state !== settings.stateText && update({ stateText: state })}
                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
              />
            )}
          </Field>

          <Field label="Timer" hint="Por projeto reinicia ao trocar de arquivo">
            <Segmented
              id="timer"
              value={settings.timerMode}
              onChange={(v) => update({ timerMode: v })}
              options={[
                { value: 'app', label: 'Por app' },
                { value: 'project', label: 'Por projeto' },
                { value: 'off', label: 'Oculto' }
              ]}
            />
          </Field>

          <Row
            label="Ocultar extensão do arquivo"
            desc="arte-final.psd vira arte-final"
            checked={settings.hideExtension}
            onChange={(v) => update({ hideExtension: v })}
          />
          <Row
            label="Modo privado"
            desc="Esconde nome do projeto e atividade"
            checked={settings.privateMode}
            onChange={(v) => update({ privateMode: v })}
          />
        </Card>
      </div>

      <div className="space-y-2">
        <Title>Sistema</Title>
        <Card className="space-y-4">
          <Row label="Iniciar com o Windows" checked={settings.autoLaunch} onChange={(v) => update({ autoLaunch: v })} />
          <Row
            label="Iniciar minimizado"
            checked={settings.startMinimized}
            onChange={(v) => update({ startMinimized: v })}
          />
          <Field label="Client ID do Discord">
            <input
              className={inputCls}
              value={clientId}
              inputMode="numeric"
              placeholder="Application ID"
              onChange={(e) => setClientId(e.target.value.replace(/\D/g, ''))}
              onBlur={() => clientId !== settings.clientId && update({ clientId })}
              onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            />
            {!settings.clientId.trim() && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-400/20 bg-amber-400/10 p-2 text-xs text-amber-300">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Informe o Client ID para conectar ao Discord.
              </div>
            )}
          </Field>
        </Card>
      </div>
    </>
  )
}
