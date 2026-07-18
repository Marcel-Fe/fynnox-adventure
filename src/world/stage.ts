import { THEMES, type DecorKind } from './themes'

// Bühnen-Look je Welt — Himmel, Nebel, Licht, Boden und Deko-Farben an EINER Stelle.
//
// Warum eine eigene Tabelle statt direkt THEMES?
// `THEMES` stammt aus dem Kart-Projekt und liefert die Grundstimmung (Nebel-, Hemisphären-
// und Boden-Farbe, Environment-Preset). Der Wald ist hier aber über viele Sessions von Hand
// feinjustiert worden und weicht in Nuancen davon ab. Der Wald-Eintrag unten enthält daher
// EXAKT die bisher fest verdrahteten Werte aus AdventureScene/Trees3D/Scenery — Welt 1 sieht
// nach dem Umbau also unverändert aus. Die neuen Welten leiten sich aus `THEMES` ab.

export interface CrownLook {
  hue: number // Grundfarbton der Baumkronen (0..1)
  hueVar: number // Streuung des Farbtons je Baum
  sat: number
  light: number
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
  groundMap: 'grass' | 'sprinkles'
  // Deko
  crown: CrownLook
  trunks: string[]
  tuft: string
  bush: string
  rock: string
  flowers: string[]
  hillNear: string
  hillFar: string
  houses: boolean // Dorfhäuser im Hintergrund (nur im Wald sinnvoll)
}

export const STAGE: Record<DecorKind, StageLook> = {
  // --- Welt 1: Wald — 1:1 die bisherigen Werte, damit sich optisch NICHTS ändert ---
  forest: {
    name: THEMES.forest.name,
    skyTurbidity: 3, skyRayleigh: 0.9, sunPosition: [80, 45, 60],
    fog: '#bfe0e8', fogNear: 42, fogFar: 120,
    envPreset: 'park', envIntensity: 0.55,
    ambient: 0.22, hemiSky: '#cdeaff', hemiGround: '#4d6b3f', hemiIntensity: 0.42,
    sunColor: '#fff2d6', sunIntensity: 2.1,
    ground: '#5fb069', groundMap: 'grass',
    crown: { hue: 0.31, hueVar: 0.05, sat: 0.68, light: 0.27 },
    trunks: ['#7a5230', '#6b4423', '#835a34', '#5f3d22'],
    tuft: '#3f9a52', bush: '#3d9c52', rock: '#9a9488',
    flowers: ['#ff5a7a', '#ffd23f', '#ffffff', '#ff8fc4', '#7ac8ff'],
    hillNear: '#5f9e57', hillFar: '#7fa6bf',
    houses: true,
  },

  // --- Welt 2: Zuckerwirbel — rosa Zuckerguss, Lolli-Bäume, Streusel-Boden ---
  candy: {
    name: THEMES.candy.name,
    skyTurbidity: 7, skyRayleigh: 2.4, sunPosition: [60, 30, 70],
    fog: THEMES.candy.fog, fogNear: 40, fogFar: 118,
    envPreset: THEMES.candy.envPreset, envIntensity: 0.7,
    ambient: THEMES.candy.ambient, hemiSky: THEMES.candy.hemiSky, hemiGround: THEMES.candy.hemiGround, hemiIntensity: 0.6,
    sunColor: '#ffe6f4', sunIntensity: 1.9,
    ground: '#f7bcdd', groundMap: 'sprinkles',
    crown: { hue: 0.92, hueVar: 0.14, sat: 0.62, light: 0.66 },
    trunks: ['#fff3e0', '#ffe6f2', '#f6d9b0', '#ffd9c2'],
    tuft: '#7fd8b0', bush: '#ff9ecd', rock: '#e6d6ff',
    flowers: ['#fff3a8', '#ff9ecd', '#ffffff', '#b9e8ff', '#ffc9e8'],
    hillNear: '#ffb3dc', hillFar: '#d9b8f0',
    houses: false,
  },

  // --- Welten 3–5: aus THEMES vorbereitet, noch ohne eigene Level ---
  volcano: {
    name: THEMES.volcano.name,
    skyTurbidity: 10, skyRayleigh: 2.0, sunPosition: [-60, 12, 40],
    fog: THEMES.volcano.fog, fogNear: 30, fogFar: 100,
    envPreset: THEMES.volcano.envPreset, envIntensity: 0.5,
    ambient: THEMES.volcano.ambient, hemiSky: THEMES.volcano.hemiSky, hemiGround: THEMES.volcano.hemiGround, hemiIntensity: 0.5,
    sunColor: '#ffb070', sunIntensity: 1.8,
    ground: '#5a453f', groundMap: 'sprinkles',
    crown: { hue: 0.06, hueVar: 0.03, sat: 0.5, light: 0.22 },
    trunks: ['#3a2a24', '#2e211c', '#4a3630'],
    tuft: '#6b4a3a', bush: '#5a3a30', rock: '#4a4440',
    flowers: ['#ff7a3f', '#ffb03f', '#ff5a3a'],
    hillNear: '#4a3a36', hillFar: '#6a4038',
    houses: false,
  },
  ice: {
    name: THEMES.ice.name,
    skyTurbidity: 2, skyRayleigh: 1.6, sunPosition: [70, 25, 60],
    fog: THEMES.ice.fog, fogNear: 38, fogFar: 115,
    envPreset: THEMES.ice.envPreset, envIntensity: 0.75,
    ambient: THEMES.ice.ambient, hemiSky: THEMES.ice.hemiSky, hemiGround: THEMES.ice.hemiGround, hemiIntensity: 0.6,
    sunColor: '#eaf6ff', sunIntensity: 2.0,
    ground: '#e6f4ff', groundMap: 'sprinkles',
    crown: { hue: 0.52, hueVar: 0.06, sat: 0.3, light: 0.72 },
    trunks: ['#8fa8bc', '#7b93a8', '#a3b8c8'],
    tuft: '#bfe0f2', bush: '#d8eeff', rock: '#c2d4e0',
    flowers: ['#ffffff', '#bfe8ff', '#dcd0ff'],
    hillNear: '#cfe4f2', hillFar: '#9fc6e6',
    houses: false,
  },
  city: {
    name: THEMES.city.name,
    skyTurbidity: 12, skyRayleigh: 0.2, sunPosition: [-40, -5, -60],
    fog: THEMES.city.fog, fogNear: 34, fogFar: 105,
    envPreset: THEMES.city.envPreset, envIntensity: 0.4,
    ambient: THEMES.city.ambient, hemiSky: THEMES.city.hemiSky, hemiGround: THEMES.city.hemiGround, hemiIntensity: 0.55,
    sunColor: '#9a8cff', sunIntensity: 1.2,
    ground: '#241a4a', groundMap: 'sprinkles',
    crown: { hue: 0.75, hueVar: 0.16, sat: 0.7, light: 0.45 },
    trunks: ['#2a2444', '#1e1a36', '#3a3060'],
    tuft: '#3f6ad4', bush: '#5a3fb0', rock: '#2a2444',
    flowers: ['#ff4fd8', '#4fe8ff', '#ffe14f'],
    hillNear: '#2a2050', hillFar: '#151030',
    houses: false,
  },
}

export function stageFor(world: DecorKind): StageLook {
  return STAGE[world] ?? STAGE.forest
}
