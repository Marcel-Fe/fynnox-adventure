// Rein lokales Savegame über localStorage — datensparsam, offline.
const KEY = 'fynnox-adventure-save-v1'

export interface SaveData {
  totalCoins: number
  bestStars: Record<string, number> // levelId -> beste Sterne (0..3)
}

const EMPTY: SaveData = { totalCoins: 0, bestStars: {} }

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const data = JSON.parse(raw) as Partial<SaveData>
    return { totalCoins: data.totalCoins ?? 0, bestStars: data.bestStars ?? {} }
  } catch {
    return { ...EMPTY }
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Speicher voll/blockiert — Spiel läuft weiter, nur ohne Persistenz.
  }
}
