import { THEMES, type DecorKind } from './themes'

// Bühnen-Look je Welt — Himmel, Nebel, Licht, Boden und Deko an EINER Stelle.
//
// Warum eine eigene Tabelle statt direkt THEMES?
// `THEMES` stammt aus dem Kart-Projekt und liefert die Grundstimmung. Der Wald ist hier
// aber über viele Sessions von Hand feinjustiert worden und weicht in Nuancen davon ab
// (z. B. Nebel `#bfe0e8` statt `#bcd6f0`). Der Wald-Eintrag enthält daher EXAKT die
// bisher verwendeten Werte — an Welt 1 ändert sich nichts. Neue Welten leiten aus THEMES ab.

export interface CrownLook {
  hue: number // Grundfarbton der Baumkronen (0..1)
  hueVar: number // Streuung des Farbtons je Baum
  sat: number
  light: number
}

// Ein Boden-Deko-Objekt (gemaltes Billboard aus public/art/deco/).
// `h` ist die Welt-Höhe (Fynnox ist 2,6 hoch), `weight` die relative Häufigkeit,
// `sway` markiert weiches Zeug, das sich im Wind wiegt und Fynnox ausweicht.
export interface DecoItem {
  name: string
  aspect: number
  h: number
  weight: number
  sway: boolean
}

export interface StageLook {
  name: string
  // Himmel
  skyTurbidity: number
  skyRayleigh: number
  sunPosition: [number, number, number]
  // Atmosphäre
  fog: string
  fogNear: number
  fogFar: number
  // Licht
  envPreset: 'park' | 'sunset' | 'night' | 'dawn' | 'city'
  envIntensity: number
  ambient: number
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  sunColor: string
  sunIntensity: number
  // Boden
  ground: string
  groundMap: 'grass' | 'sand' | 'sprinkles'
  // Plattform-Material. Die Seiten tragen eine gemalte Kachel, die Oberseite eine
  // prozedurale Draufsicht in `platformTop`. Ohne eigene Werte bleibt es beim Wald-Look
  // (Erde mit Grasnarbe) — am Strand wäre das falsch, dort gehören Sand und Holz hin.
  platformTile: string
  platformTopMap: 'grass' | 'sand'
  platformTop: string
  // Gemaltes Hintergrund-Panorama: Lage der Ebene. Jedes Panorama hat seinen Horizont an
  // einer anderen Stelle — mit den Wald-Werten säße ein anderes Bild schief zum 3D-Boden.
  bgY: number
  bgHeight: number
  bgFactor: number
  // Prozedurales Wasser. 'river' = Wald-Fluss mit Wasserfällen, 'none' = keins (etwa weil
  // das Panorama das Wasser bereits malt).
  water: 'none' | 'river'
  // Deko
  // Gemalte Baum-Billboards. Leer = keine Bäume. Es gibt bewusst KEINEN Rückfall auf
  // prozedurale Geometrie-Bäume — der Nutzer hat die Kugel-Kronen ausdrücklich abgelehnt.
  treeArt: { url: string; aspect: number }[]
  // Gemalte Boden-Deko. Leer = keine.
  deco: DecoItem[]
  // Gemalte Dorfhäuser als Billboards. Leer = keine.
  houseArt: { url: string; aspect: number }[]
  crown: CrownLook
  trunks: string[]
  tuft: string
  bush: string
  rock: string
  flowers: string[]
  hillNear: string
  hillFar: string
}

// Wald-Boden-Deko. Höhen von Hand gesetzt statt aus dem Artwork abgeleitet: auf dem
// Sammelblatt sind alle Objekte etwa gleich groß gemalt, im Spiel muss ein Pilz aber
// kleiner sein als ein Felsblock.
const FOREST_DECO: DecoItem[] = [
  { name: 'grass', aspect: 1.0955, h: 1.0, weight: 0.3, sway: true },
  { name: 'flowers', aspect: 0.6193, h: 0.85, weight: 0.16, sway: true },
  { name: 'pebble', aspect: 1.4605, h: 0.42, weight: 0.13, sway: false },
  { name: 'rock_mid', aspect: 1.3289, h: 0.95, weight: 0.1, sway: false },
  { name: 'stones', aspect: 1.9009, h: 0.55, weight: 0.1, sway: false },
  { name: 'mushrooms', aspect: 0.8883, h: 0.7, weight: 0.09, sway: true },
  { name: 'rock_big', aspect: 1.1557, h: 1.7, weight: 0.06, sway: false },
  { name: 'log', aspect: 1.8626, h: 1.0, weight: 0.06, sway: false },
]

// Strand-Deko: die Felsen und das Treibholz aus dem Wald-Blatt passen an eine Bucht,
// Gras/Blumen/Pilze nicht. Bewusst wiederverwendet, statt den Strand leer zu lassen —
// eigene Küsten-Objekte (Palme, Muschelfels, Steg) kommen später dazu.
const COAST_DECO: DecoItem[] = [
  { name: 'pebble', aspect: 1.4605, h: 0.45, weight: 0.3, sway: false },
  { name: 'stones', aspect: 1.9009, h: 0.6, weight: 0.25, sway: false },
  { name: 'rock_mid', aspect: 1.3289, h: 1.0, weight: 0.2, sway: false },
  { name: 'rock_big', aspect: 1.1557, h: 1.8, weight: 0.13, sway: false },
  { name: 'log', aspect: 1.8626, h: 1.0, weight: 0.12, sway: false },
]

export const STAGE: Record<DecorKind, StageLook> = {
  // --- Welt 1: Sonnenwald — handjustiert, NICHT verändern ---
  forest: {
    name: THEMES.forest.name,
    skyTurbidity: 3, skyRayleigh: 0.9, sunPosition: [80, 45, 60],
    fog: '#bfe0e8', fogNear: 42, fogFar: 120,
    envPreset: 'park', envIntensity: 0.55,
    ambient: 0.22, hemiSky: '#cdeaff', hemiGround: '#4d6b3f', hemiIntensity: 0.42,
    sunColor: '#fff2d6', sunIntensity: 2.1,
    ground: '#6fa855', groundMap: 'grass',
    platformTile: 'art/deco/platform_dirt.webp', platformTopMap: 'grass', platformTop: '#b6e86a',
    bgY: 10, bgHeight: 115, bgFactor: 0.85,
    water: 'river',
    treeArt: [
      { url: 'art/deco/tree_oak.webp', aspect: 0.6992 },
      { url: 'art/deco/tree_birch.webp', aspect: 0.5273 },
    ],
    deco: FOREST_DECO,
    houseArt: [{ url: 'art/deco/house_1.webp', aspect: 1.3984 }],
    crown: { hue: 0.31, hueVar: 0.05, sat: 0.68, light: 0.27 },
    trunks: ['#7a5230', '#6b4423', '#835a34', '#5f3d22'],
    tuft: '#3f9a52', bush: '#3d9c52', rock: '#9a9488',
    flowers: ['#ff5a7a', '#ffd23f', '#ffffff', '#ff8fc4', '#7ac8ff'],
    hillNear: '#5f9e57', hillFar: '#7fa6bf',
  },

  // --- Welt 2: Küstenbucht — helles Licht, Sandboden, das Meer malt das Panorama ---
  coast: {
    name: THEMES.coast.name,
    // Klare Seeluft: wenig Trübung, damit der Himmel kräftig blau bleibt.
    skyTurbidity: 2, skyRayleigh: 1.1, sunPosition: [70, 50, 55],
    // Warmer Strand-Dunst statt des blauen THEMES-Werts (#cfeaf7). Der Boden verschwindet
    // zum Horizont hin in der Nebelfarbe; mit Blau-Weiß entstand direkt unter dem
    // Panorama ein blasser Streifen — die sichtbare Kante quer durchs Bild. Gemessen:
    // gemalter Strand rgb(251,222,135) gegen fernen 3D-Sand rgb(211,224,226) — der
    // Sprung saß fast komplett im Blaukanal. Mit diesem Ton: rgb(238,214,158), nahtlos.
    fog: '#f2dda8', fogNear: 55, fogFar: 145,
    envPreset: THEMES.coast.envPreset, envIntensity: 0.75,
    ambient: THEMES.coast.ambient, hemiSky: THEMES.coast.hemiSky, hemiGround: THEMES.coast.hemiGround, hemiIntensity: 0.55,
    // Strandlicht ist heller und kälter als Waldlicht, der Sand reflektiert kräftig.
    sunColor: '#fff8e6', sunIntensity: 2.35,
    ground: '#e8cf98', groundMap: 'sand',
    // Strand-Plattformen: Sand-Draufsicht statt Grasnarbe. Eine grüne Narbe mitten in der
    // Bucht war der auffälligste Fehler im Bild. Die Seiten-Kachel ist noch die Wald-Erde
    // — sie wird durch eine gemalte Holzplanken-Kachel ersetzt, sobald das Artwork da ist.
    platformTile: 'art/deco/platform_dirt.webp', platformTopMap: 'sand', platformTop: '#efd9a4',
    // Eigene Backdrop-Lage. Entscheidend ist NICHT der Horizont, sondern welcher Teil des
    // Bildes unten an der Naht zum 3D-Boden sitzt: Der Boden verdeckt das Panorama bis zu
    // seiner eigenen Horizontlinie (Backdrop-Welt-y ≈ 1,9 bei dieser Kamera). Mit den
    // alten Werten lag dort das offene MEER — die gemalte Brandung und der goldene Strand
    // des Bildes blieben dauerhaft verdeckt, und Wasser stieß in einer schnurgeraden Linie
    // auf Sand. Bild etwas kleiner + höher gerückt: jetzt trifft gemalter Strand auf
    // 3D-Strand, und oben bleibt trotzdem Himmel im Bild.
    bgY: 35, bgHeight: 86, bgFactor: 0.85,
    // Kein 3D-Wasser: Meer, Brandung und Boote sind im Panorama gemalt. Eine zusätzliche
    // Wasserfläche würde davor schweben — derselbe Fehler wie früher die Wald-Wasserfälle.
    water: 'none',
    treeArt: [],
    deco: COAST_DECO,
    houseArt: [],
    crown: { hue: 0.28, hueVar: 0.06, sat: 0.55, light: 0.4 },
    trunks: ['#8a6a44', '#7a5a38', '#9a7a52'],
    tuft: '#9ec46a', bush: '#7fb35c', rock: '#c6b48c',
    flowers: ['#ffffff', '#ffd23f', '#ff8fc4'],
    hillNear: '#9fc4a8', hillFar: '#8fb8d6',
  },

  // --- Welten 3–6: aus THEMES vorbereitet, noch ohne Level und ohne Artwork ---
  candy: {
    name: THEMES.candy.name,
    skyTurbidity: 7, skyRayleigh: 2.4, sunPosition: [60, 30, 70],
    fog: THEMES.candy.fog, fogNear: 40, fogFar: 118,
    envPreset: THEMES.candy.envPreset, envIntensity: 0.7,
    ambient: THEMES.candy.ambient, hemiSky: THEMES.candy.hemiSky, hemiGround: THEMES.candy.hemiGround, hemiIntensity: 0.6,
    sunColor: '#ffe6f4', sunIntensity: 1.9,
    ground: '#f7bcdd', groundMap: 'sprinkles',
    platformTile: 'art/deco/platform_dirt.webp', platformTopMap: 'grass', platformTop: '#b6e86a',
    bgY: 10, bgHeight: 115, bgFactor: 0.85,
    water: 'none',
    treeArt: [], deco: [], houseArt: [],
    crown: { hue: 0.92, hueVar: 0.14, sat: 0.62, light: 0.66 },
    trunks: ['#fff3e0', '#ffe6f2', '#f6d9b0', '#ffd9c2'],
    tuft: '#7fd8b0', bush: '#ff9ecd', rock: '#e6d6ff',
    flowers: ['#fff3a8', '#ff9ecd', '#ffffff', '#b9e8ff', '#ffc9e8'],
    hillNear: '#ffb3dc', hillFar: '#d9b8f0',
  },
  volcano: {
    name: THEMES.volcano.name,
    skyTurbidity: 10, skyRayleigh: 2.0, sunPosition: [-60, 12, 40],
    fog: THEMES.volcano.fog, fogNear: 30, fogFar: 100,
    envPreset: THEMES.volcano.envPreset, envIntensity: 0.5,
    ambient: THEMES.volcano.ambient, hemiSky: THEMES.volcano.hemiSky, hemiGround: THEMES.volcano.hemiGround, hemiIntensity: 0.5,
    sunColor: '#ffb070', sunIntensity: 1.8,
    ground: '#5a453f', groundMap: 'sprinkles',
    platformTile: 'art/deco/platform_dirt.webp', platformTopMap: 'grass', platformTop: '#b6e86a',
    bgY: 10, bgHeight: 115, bgFactor: 0.85,
    water: 'none',
    treeArt: [], deco: [], houseArt: [],
    crown: { hue: 0.06, hueVar: 0.03, sat: 0.5, light: 0.22 },
    trunks: ['#3a2a24', '#2e211c', '#4a3630'],
    tuft: '#6b4a3a', bush: '#5a3a30', rock: '#4a4440',
    flowers: ['#ff7a3f', '#ffb03f', '#ff5a3a'],
    hillNear: '#4a3a36', hillFar: '#6a4038',
  },
  ice: {
    name: THEMES.ice.name,
    skyTurbidity: 2, skyRayleigh: 1.6, sunPosition: [70, 25, 60],
    fog: THEMES.ice.fog, fogNear: 38, fogFar: 115,
    envPreset: THEMES.ice.envPreset, envIntensity: 0.75,
    ambient: THEMES.ice.ambient, hemiSky: THEMES.ice.hemiSky, hemiGround: THEMES.ice.hemiGround, hemiIntensity: 0.6,
    sunColor: '#eaf6ff', sunIntensity: 2.0,
    ground: '#e6f4ff', groundMap: 'sprinkles',
    platformTile: 'art/deco/platform_dirt.webp', platformTopMap: 'grass', platformTop: '#b6e86a',
    bgY: 10, bgHeight: 115, bgFactor: 0.85,
    water: 'none',
    treeArt: [], deco: [], houseArt: [],
    crown: { hue: 0.52, hueVar: 0.06, sat: 0.3, light: 0.72 },
    trunks: ['#8fa8bc', '#7b93a8', '#a3b8c8'],
    tuft: '#bfe0f2', bush: '#d8eeff', rock: '#c2d4e0',
    flowers: ['#ffffff', '#bfe8ff', '#dcd0ff'],
    hillNear: '#cfe4f2', hillFar: '#9fc6e6',
  },
  city: {
    name: THEMES.city.name,
    skyTurbidity: 12, skyRayleigh: 0.2, sunPosition: [-40, -5, -60],
    fog: THEMES.city.fog, fogNear: 34, fogFar: 105,
    envPreset: THEMES.city.envPreset, envIntensity: 0.4,
    ambient: THEMES.city.ambient, hemiSky: THEMES.city.hemiSky, hemiGround: THEMES.city.hemiGround, hemiIntensity: 0.55,
    sunColor: '#9a8cff', sunIntensity: 1.2,
    ground: '#241a4a', groundMap: 'sprinkles',
    platformTile: 'art/deco/platform_dirt.webp', platformTopMap: 'grass', platformTop: '#b6e86a',
    bgY: 10, bgHeight: 115, bgFactor: 0.85,
    water: 'none',
    treeArt: [], deco: [], houseArt: [],
    crown: { hue: 0.75, hueVar: 0.16, sat: 0.7, light: 0.45 },
    trunks: ['#2a2444', '#1e1a36', '#3a3060'],
    tuft: '#3f6ad4', bush: '#5a3fb0', rock: '#2a2444',
    flowers: ['#ff4fd8', '#4fe8ff', '#ffe14f'],
    hillNear: '#2a2050', hillFar: '#151030',
  },
}

export function stageFor(world: DecorKind): StageLook {
  return STAGE[world] ?? STAGE.forest
}
