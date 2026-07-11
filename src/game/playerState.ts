import type { PlayerState } from './physics'

// Gemeinsamer, veränderlicher Spielerzustand. Kein React-State → keine Re-Renders
// pro Frame. Player mutiert ihn, Kamera/HUD lesen ihn in useFrame.
export const player: PlayerState = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  onGround: true,
  facing: 1,
}

export function resetPlayer(x = 0): void {
  player.x = x
  player.y = 0
  player.vx = 0
  player.vy = 0
  player.onGround = true
  player.facing = 1
}

// Dev-Hilfe: Spielerzustand im Browser inspizierbar (für automatisierte Tests).
if (typeof window !== 'undefined') {
  ;(window as unknown as { __player?: PlayerState }).__player = player
}
