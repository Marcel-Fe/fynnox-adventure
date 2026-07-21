import { create } from 'zustand'
import { emptySave, loadSave, writeSave, type SaveData } from '../save/save'
import { storyFor, type StoryKind } from '../data/story'
import { nextLevelId, getLevel } from '../game/levels'
import { resetPlayer } from '../game/playerState'

export type Screen = 'menu' | 'play' | 'result' | 'story'

export interface RunResult {
  levelId: string
  stars: number
  coins: number
  totalCoins: number // Münzen im Level insgesamt (für Anzeige „x / y")
  gems?: number
  totalGems?: number
  foundStars?: number // gefundene versteckte Sterne
  totalStars?: number
  goalsDone?: boolean[] // je Level-Ziel: erfüllt? (gleiche Reihenfolge wie goalsOf)
}

interface GameState {
  screen: Screen
  levelId: string
  runId: number // erhöht sich bei jedem Start → erzwingt frischen Canvas/Level
  coins: number // im aktuellen Lauf gesammelt
  gems: number // wertvolle Kristalle im aktuellen Lauf
  stars: number // gefundene versteckte Sterne (max. 3)
  questDone: boolean // Aufgabe des Level-NPCs erfüllt (bei NPC abgegeben)
  hasKey: boolean // Schlüssel zur Schatztruhe gefunden
  chestOpen: boolean // Truhe bereits geöffnet
  talked: Record<number, boolean> // welche Figuren im Level schon angesprochen wurden
  result: RunResult | null
  save: SaveData
  pendingStory: { levelId: string; kind: StoryKind } | null

  start: (levelId: string) => void
  beginLevel: (levelId: string) => void // wie start, zeigt aber vorher das Story-Kapitel
  afterLevel: (levelId: string) => void // „Weiter" nach dem Ziel: Story → nächstes Level
  storyContinue: () => void
  addCoin: () => void
  addGem: () => void
  addStar: () => void
  takeKey: () => void
  openChest: () => void
  markTalked: (id: number) => void
  completeQuest: () => void
  finish: (r: RunResult) => void
  toMenu: () => void
  resetSave: () => void
}

// Nur seltene Zustände (HUD/Screens). Spielerposition läuft über playerState
// (kein React) → keine Re-Renders pro Frame.
export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  levelId: 'wald-1',
  runId: 0,
  coins: 0,
  gems: 0,
  stars: 0,
  questDone: false,
  hasKey: false,
  chestOpen: false,
  talked: {},
  result: null,
  save: loadSave(),
  pendingStory: null,

  start: (levelId) => {
    // Spieler SOFORT auf den Startpunkt setzen — nicht erst in Player.tsx. Player hängt
    // hinter dem GLB-Suspense: solange das 2,4-MB-Modell lädt, stünde der Spieler sonst
    // bei x=0, die Kamera zielte daneben und schwenkte danach sichtbar nach. Ergebnis war
    // ein „leerer" Start ohne zentrierten Fynnox. Hier läuft es synchron beim Level-Start.
    resetPlayer(getLevel(levelId).startX)
    set((s) => ({ screen: 'play', levelId, coins: 0, gems: 0, stars: 0, questDone: false, hasKey: false, chestOpen: false, talked: {}, result: null, pendingStory: null, runId: s.runId + 1 }))
  },

  // Einstieg über das Menü: erst das Story-Kapitel (falls es eines gibt und es noch
  // nicht gezeigt wurde), dann das Level. Beim Wiederholen kommt kein Panel mehr.
  beginLevel: (levelId) => {
    const s = get()
    if (storyFor(levelId, 'intro') && !s.save.seenStory[`${levelId}:intro`]) {
      set({ screen: 'story', pendingStory: { levelId, kind: 'intro' } })
    } else {
      s.start(levelId)
    }
  },

  // Nach dem Ziel: Abschluss-Kapitel zeigen, sonst direkt ins nächste Level.
  afterLevel: (levelId) => {
    const s = get()
    if (storyFor(levelId, 'outro') && !s.save.seenStory[`${levelId}:outro`]) {
      set({ screen: 'story', pendingStory: { levelId, kind: 'outro' } })
      return
    }
    const nxt = nextLevelId(levelId)
    if (nxt) s.beginLevel(nxt)
    else s.toMenu()
  },

  storyContinue: () => {
    const p = get().pendingStory
    if (!p) {
      get().toMenu()
      return
    }
    const s = get()
    const save: SaveData = { ...s.save, seenStory: { ...s.save.seenStory, [`${p.levelId}:${p.kind}`]: true } }
    writeSave(save)
    set({ save, pendingStory: null })

    if (p.kind === 'intro') {
      get().start(p.levelId)
    } else {
      const nxt = nextLevelId(p.levelId)
      if (nxt) get().beginLevel(nxt)
      else get().toMenu()
    }
  },

  addCoin: () => set((s) => ({ coins: s.coins + 1 })),

  addGem: () => set((s) => ({ gems: s.gems + 1 })),

  addStar: () => set((s) => ({ stars: s.stars + 1 })),

  takeKey: () => set({ hasKey: true }),

  openChest: () => set({ chestOpen: true }),

  // Nur setzen, wenn die Figur wirklich neu ist — sonst löst jede Annäherung ein
  // Store-Update und damit ein Re-Render der HUD-Zielliste aus.
  markTalked: (id) =>
    set((s) => (s.talked[id] ? {} : { talked: { ...s.talked, [id]: true } })),

  completeQuest: () => set({ questDone: true }),

  finish: (r) =>
    set((s) => {
      const prevBest = s.save.bestStars[r.levelId] ?? 0
      const save: SaveData = {
        ...s.save,
        totalCoins: s.save.totalCoins + r.coins,
        bestStars: { ...s.save.bestStars, [r.levelId]: Math.max(prevBest, r.stars) },
        done: { ...s.save.done, [r.levelId]: true }, // schaltet das nächste Level frei
      }
      writeSave(save)
      return { screen: 'result', result: r, save }
    }),

  toMenu: () => set({ screen: 'menu', result: null, pendingStory: null }),

  // Fortschritt löschen. Destruktiv — die Oberfläche fragt vorher nach.
  resetSave: () => {
    const save = emptySave()
    writeSave(save)
    set({ save, screen: 'menu', result: null, pendingStory: null })
  },
}))

// Dev-Hilfe: Store im Browser inspizierbar (für automatisierte Tests).
if (typeof window !== 'undefined') {
  ;(window as unknown as { __game?: typeof useGameStore }).__game = useGameStore
}
