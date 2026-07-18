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

// Weitere Sammelobjekte neben den Pfotenmünzen (alle rein additiv).
export interface Pickup {
  x: number
  y: number
}

// Sprungfeder: echte Mechanik — Fynnox wird beim Auftreffen hoch katapultiert.
export interface Spring {
  x: number
  y: number
  power?: number // Sprungkraft (Standard 26)
}

// Eine Figur in der Welt. Ohne `model` dient das getönte Fynnox-Modell als Platzhalter.
export interface NpcDefData {
  x: number
  model?: string // 3D-Modell (GLB) unter public/models/
  sprite?: string // ODER freigestelltes Artwork-Billboard unter public/ (kein 3D nötig)
  height?: number // Welt-Höhe des Sprites (Fynnox ist 2,6)
  z?: number // Tiefe; 0 = auf der Spielachse
  tint?: string
  scale?: number
  lines: string[] // Sprüche, die die Figur bei Annäherung zeigt (wechseln durch)
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
  gems?: Pickup[] // wertvoller als Münzen
  stars?: Pickup[] // versteckte Sterne (3 pro Level, wie im klassischen Platformer)
  springs?: Spring[]
  npcs?: NpcDefData[] // weitere Figuren (reine Deko/Dialog, keine Quest)
  quest?: QuestDef
  bg?: string // gemalter Parallax-Hintergrund (Pfad unter public/); ersetzt die prozeduralen Hügel
}

// Wald 1-1: freundliche Treppe aus Einweg-Plattformen mit Münzen, zwei Checkpoints
// und Ziel-Flagge. Länge bewusst kurz und fair (siehe PLAN.md).
export const FOREST_LEVEL: LevelDef = {
  id: 'wald-1',
  name: 'Wald 1-1',
  world: 'forest',
  startX: -6,
  goalX: 138,
  platforms: [
    // Abschnitt 1 — sanfter Einstieg
    { x: 6, y: 1.6, w: 4, h: 0.6 },
    { x: 13, y: 3.0, w: 3.5, h: 0.6 },
    { x: 19, y: 4.4, w: 3.5, h: 0.6 },
    { x: 26, y: 3.0, w: 4, h: 0.6 },
    { x: 33, y: 1.8, w: 4, h: 0.6 },
    // Abschnitt 2 — Treppe hoch zum ersten Stern
    { x: 41, y: 2.6, w: 3.5, h: 0.6 },
    { x: 48, y: 4.0, w: 3.5, h: 0.6 },
    { x: 54, y: 5.6, w: 3, h: 0.6 },
    { x: 60, y: 7.0, w: 3, h: 0.6 },
    { x: 67, y: 4.6, w: 4, h: 0.6 },
    // Abschnitt 3 — weite Sprünge über die Senke (Sprungfedern helfen)
    { x: 75, y: 2.4, w: 3, h: 0.6 },
    { x: 82, y: 3.6, w: 3, h: 0.6 },
    { x: 89, y: 5.2, w: 3, h: 0.6 },
    { x: 96, y: 6.8, w: 3.5, h: 0.6 },
    // Abschnitt 4 — Finale
    { x: 104, y: 4.4, w: 4, h: 0.6 },
    { x: 112, y: 2.8, w: 4, h: 0.6 },
    { x: 120, y: 4.2, w: 3.5, h: 0.6 },
    { x: 128, y: 5.8, w: 3.5, h: 0.6 },
  ],
  coins: [
    { x: -3, y: 1.1 }, { x: 1, y: 1.1 }, { x: 3.5, y: 1.1 },
    { x: 7.5, y: 2.7 }, { x: 10, y: 1.1 }, { x: 14.5, y: 4.1 },
    { x: 17, y: 1.1 }, { x: 20.5, y: 5.5 }, { x: 23, y: 1.1 },
    { x: 27.5, y: 4.1 }, { x: 30, y: 1.1 }, { x: 34.5, y: 2.9 },
    { x: 37, y: 1.1 }, { x: 42.5, y: 3.7 }, { x: 45, y: 1.1 },
    { x: 49.5, y: 5.1 }, { x: 55.5, y: 6.7 }, { x: 61.5, y: 8.1 },
    { x: 64, y: 1.1 }, { x: 68.5, y: 5.7 }, { x: 71, y: 1.1 },
    { x: 76.5, y: 3.5 }, { x: 83.5, y: 4.7 }, { x: 86, y: 1.1 },
    { x: 90.5, y: 6.3 }, { x: 97.5, y: 7.9 }, { x: 100, y: 1.1 },
    { x: 105.5, y: 5.5 }, { x: 108, y: 1.1 }, { x: 113.5, y: 3.9 },
    { x: 116, y: 1.1 }, { x: 121.5, y: 5.3 }, { x: 124, y: 1.1 },
    { x: 129.5, y: 6.9 }, { x: 134, y: 1.1 },
  ],
  // Wertvolle Kristalle — abseits des direkten Wegs, laden zum Erkunden ein
  gems: [
    { x: 21, y: 7.2 }, { x: 61.5, y: 9.6 }, { x: 90.5, y: 8.4 }, { x: 129.5, y: 8.6 },
  ],
  // Drei versteckte Sterne (hoch oben — nur über die Sprungfedern erreichbar)
  stars: [
    { x: 30, y: 8.4 }, { x: 79, y: 8.8 }, { x: 118, y: 9.2 },
  ],
  // Sprungfedern: katapultieren Fynnox hoch zu den Sternen
  springs: [
    { x: 30, y: 0.35 }, { x: 79, y: 0.35 }, { x: 118, y: 0.35 },
  ],
  checkpoints: [40, 74, 110],
  // Bewohner der Welt. Noch Platzhalter (umgefärbtes/skaliertes Fynnox-Modell), bis
  // eigene Figuren-GLBs vorliegen — Pipeline: docs/npc-pipeline.md.
  npcs: [
    {
      x: 36, tint: '#8f7bd4', scale: 0.82,
      lines: ['Pass auf die Lücke auf!', 'Die Sprungfedern bringen dich ganz nach oben. ⭐', 'Hinter dem Hügel liegen Kristalle.'],
    },
    {
      // Bo, das Bärenjunge — echtes Artwork als freigestelltes Billboard
      x: 72, sprite: 'art/npc/bo_front.webp', height: 2.5,
      lines: ['Hallo Fynnox! Ich bin Bo. 🐻', 'Drei Sterne sind im Wald versteckt. ⭐', 'Ich hab einen oben glitzern sehen!'],
    },
    {
      x: 116, tint: '#d99a5c', scale: 0.9,
      lines: ['Nicht mehr weit bis zur Flagge! 🚩', 'Die Kristalle sind wertvoll — sammle sie ein. 💎', 'Du schaffst das, Fynnox!'],
    },
  ],
  bg: 'art/bg/wald/far.webp',
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
