// Bewegliche Plattformen — die reine Rechnung, ohne three und ohne React.
//
// Warum eine eigene Datei? Die Mitnahme („Fynnox fährt mit der Plattform") saß bisher
// mitten im `useFrame` von `MovingPlatforms.tsx`. Dort ist sie nur im laufenden Browser
// prüfbar — und genau daran ist die Verifikation gescheitert (headless rendert zu wenige
// Frames). Wie `physics.ts` ist dieses Modul deshalb bewusst importfrei und damit in
// Node direkt testbar: `scripts/test-movers.mjs`.
//
// Das Verhalten ist unverändert übernommen.

import { PW, type Platform, type PlayerState } from './physics'
import type { MoverDef } from './level'

// Wie weit Fynnox über der Steh-Linie noch als „steht drauf" gilt. Kleine Toleranz,
// weil der Physik-Schritt ihn exakt auf `top` setzt und Rundung bleibt.
const STAND_EPS = 0.14

// Weltposition eines Movers zum Zeitpunkt t.
export function offsetAt(d: MoverDef, t: number): number {
  return Math.sin(t * d.speed + (d.phase ?? 0)) * d.range
}

// Erzeugt die lebenden Plattform-Objekte (Startposition = Position bei t = 0,
// damit im ersten Frame nichts springt).
export function buildMovers(defs: MoverDef[]): Platform[] {
  return defs.map((d) => {
    const off = offsetAt(d, 0)
    return { x: d.x + (d.axis === 'x' ? off : 0), y: d.y + (d.axis === 'y' ? off : 0), w: d.w, h: d.h }
  })
}

// Steht der Spieler (Stand aus dem letzten Physik-Schritt) oben auf dieser Plattform?
export function standsOn(p: PlayerState, plat: Platform, x: number, y: number): boolean {
  return (
    p.onGround &&
    Math.abs(p.y - (y + plat.h)) < STAND_EPS &&
    p.x + PW > x &&
    p.x - PW < x + plat.w
  )
}

// Setzt alle Mover auf den Zeitpunkt t und trägt den Spieler mit.
//
// MUSS VOR dem Physik-Schritt laufen (in `MovingPlatforms` über useFrame-Priorität -2).
// Sonst sähe der Spieler eine Plattform, die erst danach wegfährt — er würde durchfallen.
export function stepMovers(defs: MoverDef[], live: Platform[], p: PlayerState, t: number): void {
  for (let i = 0; i < defs.length; i++) {
    const d = defs[i]
    const plat = live[i]
    if (!plat) continue

    const prevX = plat.x
    const prevY = plat.y
    const off = offsetAt(d, t)
    if (d.axis === 'x') plat.x = d.x + off
    else plat.y = d.y + off

    if (standsOn(p, plat, prevX, prevY)) {
      p.x += plat.x - prevX
      p.y += plat.y - prevY
    }
  }
}
