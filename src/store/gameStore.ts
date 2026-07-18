import { create } from 'zustand'
import { loadSave, writeSave, type SaveData } from '../save/save'

export type Screen = 'menu' | 'play' | 'result'

export interface RunResult {
  levelId: string
  stars: number
  coins: number
  totalCoins: number // Münzen im Level insgesamt (für Anzeige „x / y")
  gems?: number
  totalGems?: number
  foundStars?: number // gefundene versteckte Sterne
  totalStars?: number
}

interface GameState {
  screen: Screen
  levelId: string
  runId: number // erhöht sich bei jedem Start → erzwingt frischen Canvas/Level
  coins: number // im aktuellen Lauf gesammelt
  gems: number // wertvolle Kristalle im aktuellen Lauf
  stars: number // gefundene versteckte Sterne (max. 3)
  questDone: boolean // Aufgabe des Level-NPCs erfüllt (bei NPC abgegeben)
  result: RunResult | null
  save: SaveData

  start: (levelId: string) => void
  addCoin: () => void
  addGem: () => void
  addStar: () => void
  completeQuest: () => void
  finish: (r: RunResult) => void
  toMenu: () => void
}

// Nur seltene Zustände (HUD/Screens). Spielerposition läuft über playerState
// (kein React) → keine Re-Renders pro Frame.
export const useGameStore = create<GameState>((set) => ({
  screen: 'menu',
  levelId: 'wald-1',
  runId: 0,
  coins: 0,
  gems: 0,
  stars: 0,
  questDone: false,
  result: null,
  save: loadSave(),

  start: (levelId) =>
    set((s) => ({ screen: 'play', levelId, coins: 0, gems: 0, stars: 0, questDone: false, result: null, runId: s.runId + 1 })),

  addCoin: () => set((s) => ({ coins: s.coins + 1 })),

  addGem: () => set((s) => ({ gems: s.gems + 1 })),

  addStar: () => set((s) => ({ stars: s.stars + 1 })),

  completeQuest: () => set({ questDone: true }),

  finish: (r) =>
    set((s) => {
      const prevBest = s.save.bestStars[r.levelId] ?? 0
      const save: SaveData = {
        totalCoins: s.save.totalCoins + r.coins,
        bestStars: { ...s.save.bestStars, [r.levelId]: Math.max(prevBest, r.stars) },
      }
      writeSave(save)
      return { screen: 'result', result: r, save }
    }),

  toMenu: () => set({ screen: 'menu', result: null }),
}))

// Dev-Hilfe: Store im Browser inspizierbar (für automatisierte Tests).
if (typeof window !== 'undefined') {
  ;(window as unknown as { __game?: typeof useGameStore }).__game = useGameStore
}
