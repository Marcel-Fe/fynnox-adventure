// Rein lokales Savegame über localStorage — datensparsam, offline.
const KEY = 'fynnox-adventure-save-v1'

export interface SaveData {
  totalCoins: number
  bestStars: Record<string, number> // levelId -> beste Sterne (0..3)
  done: Record<string, boolean> // levelId -> abgeschlossen (schaltet das nächste frei)
  seenStory: Record<string, boolean> // Story-Schlüssel -> schon gezeigt
}

const EMPTY: SaveData = { totalCoins: 0, bestStars: {}, done: {}, seenStory: {} }

// Bewusst feldweise mit Defaults gelesen: ältere Savegames (v1 hatte nur totalCoins
// und bestStars) laden dadurch unverändert weiter.
export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...EMPTY }
    const data = JSON.parse(raw) as Partial<SaveData>
    const bestStars = data.bestStars ?? {}
    // Rückwärtskompatibel: wer ein Level schon mit Sternen abgeschlossen hat, hat es
    // auch geschafft — sonst wäre nach dem Update alles wieder gesperrt.
    const done: Record<string, boolean> = { ...(data.done ?? {}) }
    for (const [id, stars] of Object.entries(bestStars)) if (stars > 0) done[id] = true
    return { totalCoins: data.totalCoins ?? 0, bestStars, done, seenStory: data.seenStory ?? {} }
  } catch {
    return { ...EMPTY }
  }
}

export function emptySave(): SaveData {
  return { totalCoins: 0, bestStars: {}, done: {}, seenStory: {} }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // Speicher voll/blockiert — Spiel läuft weiter, nur ohne Persistenz.
  }
}
