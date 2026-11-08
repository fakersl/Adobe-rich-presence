export type AppKey =
  | 'photoshop'
  | 'illustrator'
  | 'premiere'
  | 'aftereffects'
  | 'indesign'
  | 'lightroom'
  | 'acrobat'

export interface AppDef {
  key: AppKey
  name: string
  process: string
  abbr: string
  color: string
}

export const APP_DEFS: AppDef[] = [
  { key: 'photoshop', name: 'Photoshop', process: 'Photoshop', abbr: 'Ps', color: '#31A8FF' },
  { key: 'illustrator', name: 'Illustrator', process: 'Illustrator', abbr: 'Ai', color: '#FF9A00' },
  { key: 'premiere', name: 'Premiere Pro', process: 'Adobe Premiere Pro', abbr: 'Pr', color: '#A855F7' },
  { key: 'aftereffects', name: 'After Effects', process: 'AfterFX', abbr: 'Ae', color: '#818CF8' },
  { key: 'indesign', name: 'InDesign', process: 'InDesign', abbr: 'Id', color: '#FF3F87' },
  { key: 'lightroom', name: 'Lightroom', process: 'Lightroom', abbr: 'Lr', color: '#7DD3FC' },
  { key: 'acrobat', name: 'Acrobat', process: 'Acrobat', abbr: 'Ac', color: '#EF4444' }
]

export const ALL_KEYS: AppKey[] = APP_DEFS.map((a) => a.key)

export function getDef(key: AppKey): AppDef {
  return APP_DEFS.find((a) => a.key === key) ?? APP_DEFS[0]
}
