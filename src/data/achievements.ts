import type { SaveData } from '../save/save'
import { LEVEL_ORDER } from '../game/levels'

// Erfolge — ausschließlich aus dem vorhandenen Spielstand abgeleitet, keine eigene
// Währung, keine Zeitfenster, keine Streaks (CLAUDE.md §4). Sie belohnen genau das,
// was das Spiel ohnehin belohnen soll: ankommen, alles finden, gründlich spielen.
//
// Jeder Erfolg liefert seinen eigenen Fortschritt (`have` / `need`), damit die
// Oberfläche „7 / 9" anzeigen kann statt nur „noch nicht geschafft".

export interface Achievement {
  id: string
  icon: string
  name: string
  hint: string
  have: number
  need: number
}

export function achievementsFor(save: SaveData): Achievement[] {
  const doneCount = LEVEL_ORDER.filter((id) => save.done[id]).length
  const starValues = LEVEL_ORDER.map((id) => save.bestStars[id] ?? 0)
  const totalStars = starValues.reduce((a, b) => a + b, 0)
  const maxStars = LEVEL_ORDER.length * 3
  const perfectLevels = starValues.filter((s) => s >= 3).length

  return [
    {
      id: 'first-steps',
      icon: '🐾',
      name: 'Erste Schritte',
      hint: 'Schließe dein erstes Level ab.',
      have: Math.min(doneCount, 1),
      need: 1,
    },
    {
      id: 'forest-walker',
      icon: '🌳',
      name: 'Waldläufer',
      hint: 'Schließe alle Level des Sonnenwalds ab.',
      have: doneCount,
      need: LEVEL_ORDER.length,
    },
    {
      id: 'first-perfect',
      icon: '⭐',
      name: 'Glanzleistung',
      hint: 'Hole in einem Level alle drei Sterne.',
      have: Math.min(perfectLevels, 1),
      need: 1,
    },
    {
      id: 'all-stars',
      icon: '🏆',
      name: 'Sternenjäger',
      hint: 'Sammle alle Sterne, die es gibt.',
      have: totalStars,
      need: maxStars,
    },
    {
      id: 'coins-100',
      icon: '🪙',
      name: 'Münzsammler',
      hint: 'Sammle insgesamt 100 Pfotenmünzen.',
      have: Math.min(save.totalCoins, 100),
      need: 100,
    },
    {
      id: 'coins-500',
      icon: '💰',
      name: 'Schatzmeister',
      hint: 'Sammle insgesamt 500 Pfotenmünzen.',
      have: Math.min(save.totalCoins, 500),
      need: 500,
    },
  ]
}

export function isUnlockedAchievement(a: Achievement): boolean {
  return a.have >= a.need
}
