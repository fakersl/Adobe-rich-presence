import type { Settings } from './types'

export interface PresenceInput {
  appName: string
  project: string | null
  activity: string | null
}

export interface Presence {
  details: string
  state?: string
}

function clamp(text: string | null | undefined): string | undefined {
  if (!text) return undefined
  const t = text.trim().slice(0, 128)
  return t.length >= 2 ? t : undefined
}

export function buildPresence(input: PresenceInput, s: Settings): Presence {
  const fallback = `Usando ${input.appName}`

  let details = fallback
  if (s.detailsMode === 'project') {
    if (s.privateMode) details = 'Projeto privado'
    else if (input.project) {
      details = s.hideExtension ? input.project.replace(/\.[A-Za-z][A-Za-z0-9]{1,5}$/, '') : input.project
    }
  }

  let state: string | undefined
  if (s.stateMode === 'dynamic') {
    state = !s.privateMode && input.activity ? input.activity : s.stateText
  } else if (s.stateMode === 'custom') {
    state = s.stateText
  }

  return { details: clamp(details) ?? fallback, state: clamp(state) }
}
