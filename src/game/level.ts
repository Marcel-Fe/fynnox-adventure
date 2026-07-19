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

// Bewegliche Plattform: pendelt auf einer Achse um ihre Ausgangsposition.
// Aus jeder Definition entsteht zur Laufzeit ein echtes `Platform`-Objekt, dessen x/y
// je Frame VOR dem Physik-Schritt mutiert wird — die Physik selbst bleibt unverändert.
export interface MoverDef {
  x: number
  y: number
  w: number
  h: number
  axis: 'x' | 'y'
  range: number // Ausschlag in Einheiten (± range um die Ausgangsposition)
  speed: number // Winkelgeschwindigkeit (rad/s); 1.0 ≈ ein Hin-und-Zurück in ~6 s
  phase?: number // Startpunkt der Pendelbewegung (rad) — versetzt mehrere Plattformen
}

// Schatztruhe: öffnet sich erst mit dem Schlüssel und schüttet Kristalle aus.
export interface ChestDef {
  x: number
  y: number
  gems: number // Belohnung; zählt in die Kristall-Gesamtzahl des Levels mit
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

// Level-Ziele — der Kern von „Punkte nicht nur durchs Springen".
// Statt die Sterne allein an der Münz-Quote festzumachen, bekommt jedes Level drei
// Ziele, die unterschiedliche Spielweisen belohnen: Erkunden (versteckte Sterne),
// Sammeln (Kristalle), Reden (alle Figuren), Rätsel (Schlüssel → Truhe).
// Bewusst DATEN statt Funktionen, damit Level-Definitionen einfache Objekte bleiben.
export type GoalKind =
  | 'finish' // Ziel-Flagge erreichen
  | 'coins' // alle Pfotenmünzen
  | 'gems' // alle Kristalle (inkl. Truhen-Inhalt)
  | 'stars' // alle versteckten Sterne
  | 'chest' // Truhe mit dem Schlüssel öffnen
  | 'talk' // mit allen Figuren im Level sprechen
  | 'quest' // Aufgabe des Auftraggebers abgeben

export interface LevelGoal {
  kind: GoalKind
  label: string
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
  movers?: MoverDef[] // bewegliche Plattformen
  key?: Pickup // Schlüssel zur Truhe
  chest?: ChestDef // Schatztruhe (braucht den Schlüssel)
  goals?: LevelGoal[] // bis zu 3; je erfülltes Ziel gibt es einen Stern
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
  // Bewegliche Holz-Plattformen als bequeme Zweitwege über die drei Senken.
  // Bewusst zusätzlich zu den festen Plattformen — die Balance bleibt unverändert.
  movers: [
    { x: 71.5, y: 3.2, w: 3, h: 0.5, axis: 'y', range: 1.8, speed: 1.1 },
    { x: 99.5, y: 6.0, w: 3, h: 0.5, axis: 'x', range: 3.5, speed: 0.8, phase: 1.2 },
    { x: 132.5, y: 5.0, w: 3, h: 0.5, axis: 'y', range: 2.2, speed: 0.9, phase: 0.6 },
  ],
  // Schlüssel hängt über der beweglichen Plattform bei x 71,5 — man muss sie also
  // hochfahren lassen und im höchsten Punkt abspringen. Belohnung ist die Truhe kurz
  // vor der Ziel-Flagge.
  key: { x: 71.5, y: 6.6 },
  chest: { x: 135, y: 0, gems: 3 },
  // Ziele: ankommen, alles einsammeln — und als Rätsel den Schlüssel über der
  // beweglichen Plattform holen, um die Truhe zu öffnen.
  goals: [
    { kind: 'finish', label: 'Erreiche die Ziel-Flagge' },
    { kind: 'coins', label: 'Sammle alle 35 Pfotenmünzen' },
    { kind: 'chest', label: 'Finde den Schlüssel und öffne die Truhe' },
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

// Kristalle insgesamt: frei liegende + die in der Truhe. So bleibt die Anzeige „x / y"
// ehrlich, auch wenn ein Teil der Kristalle erst aus der Truhe kommt.
export function totalGemCount(level: LevelDef): number {
  return (level.gems?.length ?? 0) + (level.chest?.gems ?? 0)
}

// Fortschritt eines Laufs, so weit die Ziel-Auswertung ihn braucht.
export interface RunProgress {
  coins: number
  gems: number
  stars: number
  chestOpen: boolean
  questDone: boolean
  talkedCount: number
}

// Fällt ein Level ohne eigene Ziele an, gilt diese Standard-Vorgabe — so bleiben
// ältere Level-Definitionen ohne Anpassung spielbar.
const DEFAULT_GOALS: LevelGoal[] = [
  { kind: 'finish', label: 'Erreiche die Ziel-Flagge' },
  { kind: 'coins', label: 'Sammle alle Pfotenmünzen' },
  { kind: 'stars', label: 'Finde alle versteckten Sterne' },
]

export function goalsOf(level: LevelDef): LevelGoal[] {
  return level.goals ?? DEFAULT_GOALS
}

// Ist ein einzelnes Ziel erfüllt? `finish` gilt beim Auswerten immer als erfüllt —
// ausgewertet wird erst, wenn Fynnox die Flagge erreicht hat.
export function goalDone(goal: LevelGoal, level: LevelDef, p: RunProgress): boolean {
  switch (goal.kind) {
    case 'finish':
      return true
    case 'coins':
      return level.coins.length > 0 && p.coins >= level.coins.length
    case 'gems': {
      const total = totalGemCount(level)
      return total > 0 && p.gems >= total
    }
    case 'stars': {
      const total = level.stars?.length ?? 0
      return total > 0 && p.stars >= total
    }
    case 'chest':
      return p.chestOpen
    case 'talk': {
      const total = level.npcs?.length ?? 0
      return total > 0 && p.talkedCount >= total
    }
    case 'quest':
      return p.questDone
  }
}

// Sterne = Anzahl erfüllter Level-Ziele (1..3). Ersetzt die reine Münz-Quote:
// Erkunden, Sammeln und Reden zählen jetzt genauso wie Sprung-Geschick.
export function computeStars(level: LevelDef, p: RunProgress): number {
  const goals = goalsOf(level)
  const done = goals.filter((g) => goalDone(g, level, p)).length
  return Math.max(1, Math.min(3, done))
}
