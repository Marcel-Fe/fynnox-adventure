import { FOREST_LEVEL, type LevelDef } from './level'

// Level-Register. Aktuell nur Welt 1 (Wald); weitere Welten folgen.
export const LEVELS: Record<string, LevelDef> = {
  'wald-1': FOREST_LEVEL,
}

export function getLevel(id: string): LevelDef {
  return LEVELS[id] ?? FOREST_LEVEL
}
