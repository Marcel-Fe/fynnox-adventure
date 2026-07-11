// Seitenscroller-Physik auf einer Ebene (X = laufen, Y = springen; Z fest = 0).
// Bewusst als reine Funktion (keine three-Importe) — leicht testbar.

export const GRAVITY = -60 // Einheiten/s^2
export const MOVE_SPEED = 8 // Einheiten/s
export const JUMP_V = 20 // Absprung-Geschwindigkeit → Sprunghöhe ~3,3

// Kollisionsbox von Fynnox (Füße bei y, Kopf bei y+PH).
export const PW = 0.45 // halbe Breite
export const PH = 2.0 // Höhe

// Plattform als Box; (x, y) ist die untere-linke Ecke.
export interface Platform {
  x: number
  y: number
  w: number
  h: number
}

export interface PlayerState {
  x: number
  y: number
  vx: number
  vy: number
  onGround: boolean
  facing: 1 | -1
}

export interface Input {
  left: boolean
  right: boolean
  jump: boolean
}

// Ein Physik-Schritt. Mutiert `p`.
// Plattformen sind bewusst „Einweg-Ebenen": Fynnox landet nur von OBEN darauf
// (kein seitliches Blockieren, kein Kopf-Anstoßen). Das gibt ein faires, klassisches
// Jump-&-Run-Gefühl und verhindert das Hängenbleiben an Plattform-Kanten.
export function stepPlayer(p: PlayerState, input: Input, platforms: Platform[], dt: number): void {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  p.vx = dir * MOVE_SPEED
  if (dir !== 0) p.facing = dir === 1 ? 1 : -1

  if (input.jump && p.onGround) {
    p.vy = JUMP_V
    p.onGround = false
  }

  p.vy += GRAVITY * dt

  p.x += p.vx * dt

  const prevFeet = p.y
  p.y += p.vy * dt
  p.onGround = false

  // Nur beim Fallen von oben auf einer Plattform-Oberkante landen.
  if (p.vy <= 0) {
    for (const f of platforms) {
      const top = f.y + f.h
      const withinX = p.x + PW > f.x && p.x - PW < f.x + f.w
      if (withinX && prevFeet >= top - 0.01 && p.y <= top) {
        p.y = top
        p.vy = 0
        p.onGround = true
      }
    }
  }

  // Boden (y = 0)
  if (p.y <= 0) {
    p.y = 0
    p.vy = 0
    p.onGround = true
  }
}
