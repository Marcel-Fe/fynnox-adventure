// Welt-Themen — übernommen aus dem Kart-Projekt (kart-pets/src/data/tracks.ts).
// Jede der fünf Adventure-Welten teilt sich ein Thema mit dem Racer:
// Wald, Zuckerwirbel, Vulkanpfad, Gletschergleiter, Neon-Nachtstadt.

// 'coast' ist die zweite ausgebaute Welt (Küstenbucht) und stammt aus dem Konzept-Artwork
// des Nutzers vom 19.07.; die übrigen Einträge sind aus dem Kart-Projekt geerbt.
export type DecorKind = 'forest' | 'coast' | 'candy' | 'volcano' | 'city' | 'ice'
export type GroundKind = 'grass' | 'sand' | 'candy' | 'rock' | 'city' | 'ice'
export type SkyKind = 'day' | 'sunset' | 'night'

export interface WorldTheme {
  id: string
  name: string
  sky: SkyKind
  fog: string
  ground: string // Basis-Tönung des Bodens
  groundTex: GroundKind
  decor: DecorKind
  envPreset: 'park' | 'sunset' | 'night' | 'dawn' | 'city'
  ambient: number
  hemiSky: string
  hemiGround: string
}

export const THEMES: Record<DecorKind, WorldTheme> = {
  forest: {
    id: 'wald', name: 'Wald-Abenteuer',
    sky: 'day', fog: '#bcd6f0', ground: '#6fa04e', groundTex: 'grass',
    decor: 'forest', envPreset: 'park', ambient: 0.25, hemiSky: '#bfe3ff', hemiGround: '#3a7a48',
  },
  coast: {
    id: 'kuestenbucht', name: 'Küstenbucht',
    sky: 'day', fog: '#cfeaf7', ground: '#e8d29a', groundTex: 'sand',
    decor: 'coast', envPreset: 'park', ambient: 0.3, hemiSky: '#bfeaff', hemiGround: '#d9bf8a',
  },
  candy: {
    id: 'zuckerwirbel', name: 'Zuckerwirbel',
    sky: 'day', fog: '#ffd9ef', ground: '#ffc8e6', groundTex: 'candy',
    decor: 'candy', envPreset: 'dawn', ambient: 0.4, hemiSky: '#ffd6f2', hemiGround: '#ff8fc4',
  },
  volcano: {
    id: 'vulkanpfad', name: 'Vulkanpfad',
    sky: 'sunset', fog: '#5a2a22', ground: '#4a3a36', groundTex: 'rock',
    decor: 'volcano', envPreset: 'sunset', ambient: 0.3, hemiSky: '#ff8a4a', hemiGround: '#2a1410',
  },
  ice: {
    id: 'gletschergleiter', name: 'Gletschergleiter',
    sky: 'day', fog: '#cfe9ff', ground: '#eaf6ff', groundTex: 'ice',
    decor: 'ice', envPreset: 'dawn', ambient: 0.35, hemiSky: '#dff1ff', hemiGround: '#9fc6e6',
  },
  city: {
    id: 'neon-nachtstadt', name: 'Neon-Nachtstadt',
    sky: 'night', fog: '#0c0824', ground: '#161033', groundTex: 'city',
    decor: 'city', envPreset: 'night', ambient: 0.22, hemiSky: '#3a2a7a', hemiGround: '#070411',
  },
}
