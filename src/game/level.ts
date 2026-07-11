import type { Platform } from './physics'

// Einfaches Level-Format für die erste spielbare Version. Plattformen sind Boxen
// (x,y = untere-linke Ecke). Münzen sind Punkte in der Ebene. Später: Loader für
// mehrere Level je Welt (siehe PLAN.md).
export interface Coin {
  x: number
  y: number
}

export interface LevelDef {
  id: string
  name: string
  startX: number
  goalX: number
  platforms: Platform[]
  coins: Coin[]
}

// Wald-Testlevel: eine kleine Treppe aus schwebenden Plattformen mit Münzen.
export const FOREST_LEVEL: LevelDef = {
  id: 'wald-1',
  name: 'Wald-Abenteuer 1',
  startX: -6,
  goalX: 34,
  platforms: [
    { x: 3, y: 1.4, w: 4, h: 0.6 },
    { x: 9.5, y: 3.0, w: 3.5, h: 0.6 },
    { x: 15, y: 4.4, w: 3.5, h: 0.6 },
    { x: 21, y: 3.0, w: 4, h: 0.6 },
    { x: 27, y: 1.6, w: 4, h: 0.6 },
  ],
  coins: [
    { x: -2, y: 1.1 },
    { x: 5, y: 2.6 },
    { x: 11.2, y: 4.2 },
    { x: 16.7, y: 5.6 },
    { x: 23, y: 4.2 },
    { x: 29, y: 2.8 },
    { x: 33, y: 1.1 },
  ],
}
