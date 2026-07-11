import { create } from 'zustand'

// Nur seltene Zustände (HUD) — pro Frame ändert sich hier nichts, daher keine
// Re-Render-Last. Spielerposition läuft bewusst über playerState (kein React).
interface GameState {
  coins: number
  addCoin: () => void
  reset: () => void
}

export const useGameStore = create<GameState>((set) => ({
  coins: 0,
  addCoin: () => set((s) => ({ coins: s.coins + 1 })),
  reset: () => set({ coins: 0 }),
}))
