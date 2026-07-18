// Effekt-Zustand ohne React (wie playerState/controls): ein fester Partikel-Pool, der
// je Frame vom Renderer gelesen wird. Kein Speicher-Nachschub im Spielbetrieb, keine
// Re-Renders — dadurch auch auf dem Handy flüssig.

export const MAX_PARTICLES = 260

export interface Particle {
  x: number; y: number; z: number
  vx: number; vy: number; vz: number
  life: number; maxLife: number
  size: number
  r: number; g: number; b: number
  gravity: number
}

function make(): Particle {
  return { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, maxLife: 1, size: 0.2, r: 1, g: 1, b: 1, gravity: -9 }
}

export const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, make)
let cursor = 0

// Leichter Kamera-Rüttler (wird von der Kamera je Frame ausgelesen und klingt ab).
export const shake = { amount: 0 }
export function addShake(v: number) {
  shake.amount = Math.min(0.55, shake.amount + v)
}

export type FxKind = 'coin' | 'gem' | 'star' | 'jump' | 'land' | 'run' | 'spring'

interface Preset {
  count: number
  speed: [number, number]
  up: number // zusätzlicher Aufwärts-Schub
  size: [number, number]
  life: [number, number]
  gravity: number
  colors: [number, number, number][]
  spread: number // seitliche Streuung
}

const PRESETS: Record<FxKind, Preset> = {
  // Münze: goldene Funken, sprudeln nach oben
  coin: { count: 16, speed: [1.8, 4.6], up: 3.0, size: [0.18, 0.42], life: [0.5, 0.95], gravity: -9,
    colors: [[1, 0.82, 0.25], [1, 0.95, 0.6], [1, 0.66, 0.15]], spread: 1 },
  // Kristall: kühle, glitzernde Splitter
  gem: { count: 24, speed: [2.2, 5.4], up: 3.4, size: [0.2, 0.48], life: [0.6, 1.15], gravity: -8,
    colors: [[0.45, 0.85, 1], [0.8, 0.95, 1], [0.3, 0.65, 1]], spread: 1 },
  // Stern: große, warme Feier
  star: { count: 34, speed: [2.6, 6.4], up: 4.0, size: [0.24, 0.6], life: [0.8, 1.5], gravity: -7,
    colors: [[1, 0.9, 0.35], [1, 1, 0.85], [1, 0.7, 0.2]], spread: 1.2 },
  // Absprung-Staub
  jump: { count: 10, speed: [1.0, 2.6], up: 0.8, size: [0.26, 0.55], life: [0.35, 0.65], gravity: -3.5,
    colors: [[0.92, 0.94, 0.88], [0.82, 0.86, 0.76]], spread: 1.6 },
  // Lande-Staub: breit, flach
  land: { count: 16, speed: [1.6, 3.8], up: 0.5, size: [0.3, 0.66], life: [0.4, 0.75], gravity: -3,
    colors: [[0.95, 0.96, 0.9], [0.84, 0.88, 0.78]], spread: 2.4 },
  // Laufstaub: sparsam, klein
  run: { count: 3, speed: [0.6, 1.6], up: 0.4, size: [0.18, 0.34], life: [0.3, 0.5], gravity: -3,
    colors: [[0.93, 0.95, 0.9]], spread: 1.4 },
  // Sprungfeder: kräftiger Schub nach oben
  spring: { count: 22, speed: [1.8, 4.4], up: 5.6, size: [0.22, 0.5], life: [0.5, 0.95], gravity: -8,
    colors: [[1, 1, 1], [0.7, 0.9, 1], [1, 0.85, 0.4]], spread: 1.1 },
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

export function burst(kind: FxKind, x: number, y: number, z = 0.25) {
  const p = PRESETS[kind]
  for (let i = 0; i < p.count; i++) {
    const q = particles[cursor]
    cursor = (cursor + 1) % MAX_PARTICLES // Ringpuffer: älteste Partikel weichen
    const a = Math.random() * Math.PI * 2
    const sp = rnd(p.speed[0], p.speed[1])
    q.x = x + (Math.random() - 0.5) * 0.3
    q.y = y + (Math.random() - 0.5) * 0.2
    q.z = z + (Math.random() - 0.5) * 0.3
    q.vx = Math.cos(a) * sp * p.spread
    q.vy = Math.abs(Math.sin(a)) * sp + p.up
    q.vz = (Math.random() - 0.5) * sp * 0.5
    q.maxLife = rnd(p.life[0], p.life[1])
    q.life = q.maxLife
    q.size = rnd(p.size[0], p.size[1])
    const c = p.colors[(Math.random() * p.colors.length) | 0]
    q.r = c[0]; q.g = c[1]; q.b = c[2]
    q.gravity = p.gravity
  }
}
