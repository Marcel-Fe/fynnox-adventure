import { FOREST_LEVEL, type LevelDef } from './level'
import type { DecorKind } from '../world/themes'
import type { SaveData } from '../save/save'

// ---------------------------------------------------------------------------
// Wald 1-2 — „Die Schaukelbrücke"
// Schwerpunkt: bewegliche Plattformen. Kürzer als 1-1, dafür rhythmischer:
// feste Insel → Mover → feste Insel. Der Boden bleibt überall begehbar, ein
// Fehlsprung kostet also nie ein Leben (familienfreundlich).
// ---------------------------------------------------------------------------
const WALD_2: LevelDef = {
  id: 'wald-2',
  name: 'Wald 1-2',
  world: 'forest',
  startX: -4,
  goalX: 104,
  platforms: [
    { x: 5, y: 1.8, w: 4, h: 0.6 },
    { x: 12, y: 3.2, w: 3.5, h: 0.6 },
    { x: 24, y: 3.6, w: 4, h: 0.6 },
    { x: 36, y: 2.4, w: 4, h: 0.6 },
    { x: 48, y: 4.6, w: 3.5, h: 0.6 },
    { x: 60, y: 3.0, w: 4, h: 0.6 },
    { x: 72, y: 5.2, w: 3.5, h: 0.6 },
    { x: 84, y: 3.4, w: 4, h: 0.6 },
    { x: 94, y: 5.0, w: 3.5, h: 0.6 },
  ],
  movers: [
    { x: 18, y: 3.4, w: 3, h: 0.5, axis: 'x', range: 3.0, speed: 0.9 },
    { x: 30, y: 3.0, w: 3, h: 0.5, axis: 'y', range: 1.6, speed: 1.2, phase: 0.4 },
    { x: 42, y: 3.6, w: 3, h: 0.5, axis: 'x', range: 3.2, speed: 1.0, phase: 1.6 },
    { x: 54, y: 4.2, w: 3, h: 0.5, axis: 'y', range: 2.0, speed: 0.9, phase: 0.9 },
    { x: 66, y: 4.4, w: 3, h: 0.5, axis: 'x', range: 3.4, speed: 0.85, phase: 2.2 },
    { x: 78, y: 4.6, w: 3, h: 0.5, axis: 'y', range: 2.2, speed: 1.1, phase: 0.3 },
    { x: 90, y: 4.4, w: 3, h: 0.5, axis: 'x', range: 3.0, speed: 0.95, phase: 1.1 },
  ],
  coins: [
    { x: -1, y: 1.1 }, { x: 2, y: 1.1 }, { x: 6.5, y: 3.1 }, { x: 9, y: 1.1 },
    { x: 13.5, y: 4.3 }, { x: 16, y: 1.1 }, { x: 19.5, y: 4.5 }, { x: 25.5, y: 4.7 },
    { x: 28, y: 1.1 }, { x: 31.5, y: 4.1 }, { x: 37.5, y: 3.5 }, { x: 40, y: 1.1 },
    { x: 43.5, y: 4.7 }, { x: 49.5, y: 5.7 }, { x: 52, y: 1.1 }, { x: 55.5, y: 5.3 },
    { x: 61.5, y: 4.1 }, { x: 64, y: 1.1 }, { x: 67.5, y: 5.5 }, { x: 73.5, y: 6.3 },
    { x: 76, y: 1.1 }, { x: 79.5, y: 5.7 }, { x: 85.5, y: 4.5 }, { x: 88, y: 1.1 },
    { x: 91.5, y: 5.5 }, { x: 95.5, y: 6.1 },
  ],
  gems: [
    { x: 19.5, y: 7.6 }, { x: 49.5, y: 8.0 }, { x: 79.5, y: 8.2 },
  ],
  stars: [
    { x: 20, y: 8.8 }, { x: 56, y: 9.0 }, { x: 88, y: 8.8 },
  ],
  springs: [
    { x: 20, y: 0.35 }, { x: 56, y: 0.35 }, { x: 88, y: 0.35 },
  ],
  key: { x: 78, y: 8.8 },
  chest: { x: 100, y: 0, gems: 3 },
  // Dieses Level belohnt Erkunden und Reden statt reines Sammeln.
  goals: [
    { kind: 'finish', label: 'Erreiche die Ziel-Flagge' },
    { kind: 'stars', label: 'Finde alle 3 versteckten Sterne' },
    { kind: 'talk', label: 'Sprich mit beiden Waldbewohnern' },
  ],
  checkpoints: [34, 68],
  npcs: [
    {
      x: 22, sprite: 'art/npc/bo_front.webp', height: 2.5,
      lines: ['Die Holzplattformen schaukeln! 🪵', 'Warte den richtigen Moment ab.', 'Ich halte dir die Daumen, Fynnox!'],
    },
    {
      x: 70, tint: '#8f7bd4', scale: 0.86,
      lines: ['Der Schlüssel schwebt über der wandernden Plattform. 🔑', 'Fahr mit ihr nach oben und spring!'],
    },
  ],
  bg: 'art/bg/wald/far.webp',
  quest: {
    npcX: 1,
    npcTint: '#9fb6d6',
    ask: 'Die Brücke schaukelt heute! Sammle die Pfotenmünzen 🐾 auf dem Weg.',
    ready: 'Alle Münzen — stark! Komm zu mir zurück. 🐾',
    thanks: 'Danke, Fynnox! Der Wald ist ein Stück heller. ✨',
  },
}

// ---------------------------------------------------------------------------
// Wald 1-3 — „Zum Kristallhain"
// Schwerpunkt: Höhe. Treppen hinauf, Sprungfedern zu den Sternen, die dickste
// Truhe des Waldes am Ende.
// ---------------------------------------------------------------------------
const WALD_3: LevelDef = {
  id: 'wald-3',
  name: 'Wald 1-3',
  world: 'forest',
  startX: -4,
  goalX: 96,
  platforms: [
    { x: 6, y: 2.0, w: 4, h: 0.6 },
    { x: 14, y: 3.6, w: 3.5, h: 0.6 },
    { x: 21, y: 5.2, w: 3, h: 0.6 },
    { x: 28, y: 6.6, w: 3, h: 0.6 },
    { x: 38, y: 4.0, w: 4, h: 0.6 },
    { x: 50, y: 2.6, w: 4, h: 0.6 },
    { x: 58, y: 4.2, w: 3.5, h: 0.6 },
    { x: 70, y: 6.0, w: 3.5, h: 0.6 },
    { x: 80, y: 4.4, w: 4, h: 0.6 },
    { x: 88, y: 6.2, w: 3.5, h: 0.6 },
  ],
  movers: [
    { x: 33, y: 5.6, w: 3, h: 0.5, axis: 'y', range: 2.4, speed: 1.0 },
    { x: 44, y: 3.4, w: 3, h: 0.5, axis: 'x', range: 3.0, speed: 1.1, phase: 0.8 },
    { x: 64, y: 5.2, w: 3, h: 0.5, axis: 'y', range: 2.6, speed: 0.85, phase: 1.4 },
    { x: 75, y: 5.4, w: 3, h: 0.5, axis: 'x', range: 2.6, speed: 1.15, phase: 2.0 },
  ],
  coins: [
    { x: -1, y: 1.1 }, { x: 2, y: 1.1 }, { x: 7.5, y: 3.1 }, { x: 10, y: 1.1 },
    { x: 15.5, y: 4.7 }, { x: 18, y: 1.1 }, { x: 22.5, y: 6.3 }, { x: 29.5, y: 7.7 },
    { x: 32, y: 1.1 }, { x: 34.5, y: 6.7 }, { x: 39.5, y: 5.1 }, { x: 42, y: 1.1 },
    { x: 45.5, y: 4.5 }, { x: 51.5, y: 3.7 }, { x: 54, y: 1.1 }, { x: 59.5, y: 5.3 },
    { x: 65.5, y: 6.3 }, { x: 68, y: 1.1 }, { x: 71.5, y: 7.1 }, { x: 76.5, y: 6.5 },
    { x: 78, y: 1.1 }, { x: 81.5, y: 5.5 }, { x: 89.5, y: 7.3 }, { x: 93, y: 1.1 },
  ],
  gems: [
    { x: 29.5, y: 8.2 }, { x: 46, y: 5.6 }, { x: 65.5, y: 8.6 }, { x: 89.5, y: 8.0 },
  ],
  stars: [
    { x: 24, y: 9.0 }, { x: 54, y: 9.2 }, { x: 84, y: 9.0 },
  ],
  springs: [
    { x: 24, y: 0.35 }, { x: 54, y: 0.35 }, { x: 84, y: 0.35 },
  ],
  key: { x: 64, y: 9.4 },
  chest: { x: 92, y: 0, gems: 4 },
  // Kristallhain: hier zählen die Kristalle und die Aufgabe des Auftraggebers.
  goals: [
    { kind: 'finish', label: 'Erreiche die Ziel-Flagge' },
    { kind: 'gems', label: 'Sammle alle Kristalle (auch die in der Truhe)' },
    { kind: 'quest', label: 'Bring die Aufgabe zu Ende' },
  ],
  checkpoints: [36, 68],
  npcs: [
    {
      x: 20, tint: '#d99a5c', scale: 0.9,
      lines: ['Hier oben glitzert es überall! 💎', 'Die Federn bringen dich zu den Sternen. ⭐'],
    },
    {
      x: 62, sprite: 'art/npc/bo_front.webp', height: 2.5,
      lines: ['Der Kristallhain liegt gleich dahinter! 🐻', 'Die große Truhe wartet am Ende. 🧰'],
    },
  ],
  bg: 'art/bg/wald/far.webp',
  quest: {
    npcX: 1,
    npcTint: '#7fbf8f',
    ask: 'Im Kristallhain fehlen Münzen 🐾. Bringst du sie zurück?',
    ready: 'Du hast alle gefunden! Komm her. 🐾',
    thanks: 'Wunderbar! Jetzt leuchtet der Hain wieder. 💎',
  },
}

// ---------------------------------------------------------------------------
// Zuckerwirbel 2-1 — die zweite Welt.
// Noch OHNE gemalten Hintergrund (Artwork folgt vom Nutzer) → die prozeduralen
// Hügel bleiben an und bekommen die rosa Palette aus world/stage.ts.
// ---------------------------------------------------------------------------
const CANDY_1: LevelDef = {
  id: 'candy-1',
  name: 'Zuckerwirbel 2-1',
  world: 'candy',
  startX: -4,
  goalX: 100,
  platforms: [
    { x: 6, y: 1.8, w: 4, h: 0.6 },
    { x: 14, y: 3.2, w: 3.5, h: 0.6 },
    { x: 22, y: 4.8, w: 3.5, h: 0.6 },
    { x: 32, y: 3.0, w: 4, h: 0.6 },
    { x: 44, y: 4.4, w: 3.5, h: 0.6 },
    { x: 56, y: 2.8, w: 4, h: 0.6 },
    { x: 66, y: 5.0, w: 3.5, h: 0.6 },
    { x: 76, y: 3.4, w: 4, h: 0.6 },
    { x: 86, y: 5.4, w: 3.5, h: 0.6 },
    { x: 94, y: 3.6, w: 4, h: 0.6 },
  ],
  movers: [
    { x: 27, y: 4.2, w: 3, h: 0.5, axis: 'x', range: 2.8, speed: 0.95 },
    { x: 38, y: 3.8, w: 3, h: 0.5, axis: 'y', range: 2.0, speed: 1.05, phase: 0.7 },
    { x: 50, y: 3.8, w: 3, h: 0.5, axis: 'x', range: 3.0, speed: 0.9, phase: 1.5 },
    { x: 71, y: 4.4, w: 3, h: 0.5, axis: 'y', range: 2.4, speed: 1.0, phase: 2.1 },
    { x: 82, y: 4.6, w: 3, h: 0.5, axis: 'x', range: 2.6, speed: 1.1, phase: 0.5 },
  ],
  coins: [
    { x: -1, y: 1.1 }, { x: 2, y: 1.1 }, { x: 7.5, y: 2.9 }, { x: 10, y: 1.1 },
    { x: 15.5, y: 4.3 }, { x: 18, y: 1.1 }, { x: 23.5, y: 5.9 }, { x: 28.5, y: 5.3 },
    { x: 30, y: 1.1 }, { x: 33.5, y: 4.1 }, { x: 39.5, y: 4.9 }, { x: 42, y: 1.1 },
    { x: 45.5, y: 5.5 }, { x: 51.5, y: 4.9 }, { x: 54, y: 1.1 }, { x: 57.5, y: 3.9 },
    { x: 62, y: 1.1 }, { x: 67.5, y: 6.1 }, { x: 72.5, y: 5.5 }, { x: 74, y: 1.1 },
    { x: 77.5, y: 4.5 }, { x: 83.5, y: 5.7 }, { x: 87.5, y: 6.5 }, { x: 90, y: 1.1 },
    { x: 95.5, y: 4.7 }, { x: 98, y: 1.1 },
  ],
  gems: [
    { x: 23.5, y: 7.4 }, { x: 45.5, y: 7.0 }, { x: 67.5, y: 7.8 }, { x: 87.5, y: 8.0 },
  ],
  stars: [
    { x: 18, y: 9.0 }, { x: 48, y: 9.2 }, { x: 80, y: 9.0 },
  ],
  springs: [
    { x: 18, y: 0.35 }, { x: 48, y: 0.35 }, { x: 80, y: 0.35 },
  ],
  key: { x: 71, y: 9.0 },
  chest: { x: 95.5, y: 4.2, gems: 3 },
  checkpoints: [30, 62],
  npcs: [
    {
      x: 26, tint: '#ff9ecd', scale: 0.84,
      lines: ['Willkommen im Zuckerwirbel! 🍬', 'Alles hier ist weich und klebrig.', 'Pass auf die wandernden Waffeln auf!'],
    },
    {
      x: 68, tint: '#b9e8ff', scale: 0.9,
      lines: ['Der Schlüssel schwebt über der Zucker-Plattform. 🔑', 'Die Truhe steht ganz am Ende. 🧰'],
    },
  ],
  quest: {
    npcX: 1,
    npcTint: '#ffd6f2',
    ask: 'Hallo Fynnox! Im Zuckerwirbel sind Pfotenmünzen 🐾 verstreut.',
    ready: 'Alle beisammen! Komm kurz zurück. 🐾',
    thanks: 'Danke! Jetzt schmeckt der Wirbel wieder süß. 🍬',
  },
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------
export const LEVELS: Record<string, LevelDef> = {
  'wald-1': FOREST_LEVEL,
  'wald-2': WALD_2,
  'wald-3': WALD_3,
  'candy-1': CANDY_1,
}

export function getLevel(id: string): LevelDef {
  return LEVELS[id] ?? FOREST_LEVEL
}

export interface WorldGroup {
  key: DecorKind
  name: string
  levels: string[]
}

// Reihenfolge der Welten und ihrer Level. Daraus ergibt sich auch die
// Freischaltung: Level N+1 öffnet, sobald N abgeschlossen ist.
// Aktuell ausgebaute Welten. `candy-1` bleibt als Level erhalten (siehe LEVELS), taucht
// hier aber nicht mehr auf: das Konzept-Artwork des Nutzers vom 19.07. definiert die
// Welten neu (Sonnenwald, Küstenbucht, Lavahöhle, Winterwald, Vergessene Stadt,
// Kristallhöhlen) — „Zuckerwirbel" war aus dem Kart-Projekt geerbt und kommt darin nicht
// vor. Das Level wird wieder eingehängt, sobald es eine passende Welt hat.
export const WORLD_GROUPS: WorldGroup[] = [
  { key: 'forest', name: 'Sonnenwald', levels: ['wald-1', 'wald-2', 'wald-3'] },
]

// Alle Level in Spielreihenfolge.
export const LEVEL_ORDER: string[] = WORLD_GROUPS.flatMap((w) => w.levels)

export function isUnlocked(levelId: string, save: SaveData): boolean {
  const i = LEVEL_ORDER.indexOf(levelId)
  if (i <= 0) return true // erstes Level (und Unbekanntes) immer offen
  return save.done[LEVEL_ORDER[i - 1]] === true
}

// Nächstes Level in der Reihenfolge — für „Weiter" nach dem Ziel.
export function nextLevelId(levelId: string): string | null {
  const i = LEVEL_ORDER.indexOf(levelId)
  if (i < 0 || i + 1 >= LEVEL_ORDER.length) return null
  return LEVEL_ORDER[i + 1]
}
