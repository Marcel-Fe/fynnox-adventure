import type { Platform } from './physics'
import type { DecorKind } from '../world/themes'

// Level-Format. Plattformen sind Boxen (x,y = untere-linke Ecke). Münzen/Checkpoints
// sind Punkte bzw. x-Marken in der Ebene. Ziel bei goalX.
export interface Coin {
  x: number
  y: number
}

// Optionale Quest-Definition: ein NPC gibt eine Aufgabe (alle Münzen sammeln) und
// reagiert bei Abgabe. Rein additiv — fehlt sie, läuft das Level wie bisher.
export interface QuestDef {
  npcX: number // Position des Auftraggeber-NPCs
  npcModel?: string // eigenes GLB (z. B. 'lumo.glb'); ohne Angabe → getöntes Fynnox-Modell
  npcTint?: string // Einfärbung des Platzhalter-Modells
  ask: string // Aufgabentext, solange noch nicht alle Münzen gesammelt sind
  ready: string // Text, wenn alles gesammelt ist → „komm zurück"
  thanks: string // Reaktion nach Abgabe beim NPC
}

export interface LevelDef {
  id: string
  name: string
  world: DecorKind
  startX: number
  goalX: number
  platforms: Platform[]
  coins: Coin[]
  checkpoints: number[] // x-Positionen der Checkpoint-Flaggen
  quest?: QuestDef
}

// Wald 1-1: freundliche Treppe aus Einweg-Plattformen mit Münzen, zwei Checkpoints
// und Ziel-Flagge. Länge bewusst kurz und fair (siehe PLAN.md).
export const FOREST_LEVEL: LevelDef = {
  id: 'wald-1',
  name: 'Wald 1-1',
  world: 'forest',
  startX: -6,
  goalX: 62,
  platforms: [
    { x: 6, y: 1.6, w: 4, h: 0.6 },
    { x: 13, y: 3.0, w: 3.5, h: 0.6 },
    { x: 19, y: 4.4, w: 3.5, h: 0.6 },
    { x: 26, y: 3.0, w: 4, h: 0.6 },
    { x: 33, y: 1.8, w: 4, h: 0.6 },
    { x: 41, y: 2.6, w: 3.5, h: 0.6 },
    { x: 48, y: 4.0, w: 3.5, h: 0.6 },
    { x: 55, y: 2.2, w: 4, h: 0.6 },
  ],
  coins: [
    { x: -3, y: 1.1 }, { x: 1, y: 1.1 },
    { x: 7.5, y: 2.7 }, { x: 14.5, y: 4.1 }, { x: 20.5, y: 5.5 },
    { x: 27.5, y: 4.1 }, { x: 30, y: 1.1 }, { x: 37, y: 1.1 },
    { x: 42.5, y: 3.7 }, { x: 49.5, y: 5.1 }, { x: 56.5, y: 3.3 },
    { x: 59, y: 1.1 },
  ],
  checkpoints: [20, 42],
  quest: {
    npcX: 2,
    npcTint: '#9fb6d6',
    ask: 'Hallo Fynnox! Sammle bitte alle Pfotenmünzen 🐾 im Wald.',
    ready: 'Toll — du hast alle! Komm zurück zu mir. 🐾',
    thanks: 'Danke, Fynnox! Du bist ein echter Held! 🎉',
  },
}

// Sternebewertung: 3 = alle Münzen, 2 = >= 60 %, 1 = Ziel erreicht.
export function computeStars(collected: number, total: number): number {
  if (total > 0 && collected >= total) return 3
  if (collected >= Math.ceil(total * 0.6)) return 2
  return 1
}
