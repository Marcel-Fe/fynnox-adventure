// Seitenscroller-Physik auf einer Ebene (X = laufen, Y = springen; Z fest = 0).
// Bewusst als reine Funktion (keine three-Importe) — leicht testbar.

export const GRAVITY = -60 // Einheiten/s^2
export const MOVE_SPEED = 8 // Einheiten/s
export const JUMP_V = 20 // Absprung-Geschwindigkeit → Sprunghöhe ~3,3
export const DASH_SPEED = 17 // Tempo während des Dash
export const DASH_TIME = 0.22 // Dauer eines Dash (s)
export const DASH_CD = 0.55 // Abklingzeit (s)

// Kollisionsbox von Fynnox (Füße bei y, Kopf bei y+PH).
export const PW = 0.45
export const PH = 2.0

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
  dashTime: number
  dashCd: number
  checkpointX: number
}

export interface Input {
  left: boolean
  right: boolean
  jump: boolean
  dash: boolean
}

// Ein Physik-Schritt. Mutiert `p`.
// Plattformen sind „Einweg-Ebenen": Fynnox landet nur von OBEN darauf (kein
// seitliches Blockieren), das gibt ein faires, klassisches Jump-&-Run-Gefühl.
export function stepPlayer(p: PlayerState, input: Input, platforms: Platform[], dt: number): void {
  const dir = (input.right ? 1 : 0) - (input.left ? 1 : 0)
  if (dir !== 0) p.facing = dir === 1 ? 1 : -1

  // Dash: kurzer, schneller Vorstoß in Blickrichtung (Flanke + Abklingzeit).
  p.dashCd = Math.max(0, p.dashCd - dt)
  if (input.dash && p.dashCd <= 0 && p.dashTime <= 0) {
    p.dashTime = DASH_TIME
    p.dashCd = DASH_CD
  }
  if (p.dashTime > 0) {
    p.dashTime -= dt
    p.vx = p.facing * DASH_SPEED
  } else {
    p.vx = dir * MOVE_SPEED
  }

  if (input.jump && p.onGround) {
    p.vy = JUMP_V
    p.onGround = false
  }

  p.vy += GRAVITY * dt

  p.x += p.vx * dt

  const prevFeet = p.y
  p.y += p.vy * dt
  p.onGround = false

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

  if (p.y <= 0) {
    p.y = 0
    p.vy = 0
    p.onGround = true
  }
}
