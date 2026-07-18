import { useGameStore } from '../store/gameStore'
import { getLevel } from '../game/levels'
import { storyFor } from '../data/story'
import { asset } from '../utils/asset'
import { C } from './theme'

// Story-Kapitel zwischen den Leveln — Bild links, Text rechts, ein „Weiter"-Knopf.
// Look wie das Menü (Glas-Karte auf dunklem Verlauf). Erscheint je Kapitel nur einmal;
// beim Wiederholen eines Levels startet man direkt (kein Text zum Wegklicken).
export function StoryPanel() {
  const pending = useGameStore((s) => s.pendingStory)
  const storyContinue = useGameStore((s) => s.storyContinue)
  if (!pending) return null

  const beat = storyFor(pending.levelId, pending.kind)
  if (!beat) return null
  const level = getLevel(pending.levelId)

  return (
    <div
      className="fa-menu"
      style={{
        position: 'fixed', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: 20, color: '#fff', overflow: 'hidden',
      }}
    >
      <img src={asset('art/previews/wald.png')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(14px) brightness(0.45)', transform: 'scale(1.1)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,16,32,0.75), rgba(6,12,24,0.92))' }} />

      <div
        className="fa-glass"
        style={{
          position: 'relative', display: 'flex', alignItems: 'center', gap: 24,
          maxWidth: 780, width: '100%', padding: 22, borderRadius: 26,
          boxShadow: '0 22px 60px rgba(0,0,0,0.55)',
        }}
      >
        {/* Bild links */}
        <div style={{ flex: '0 0 auto', width: 168, height: 168, borderRadius: 20, overflow: 'hidden', border: '4px solid rgba(255,255,255,0.9)', background: 'radial-gradient(circle at 50% 35%, #cdeeff, #6ea9d6)' }}>
          <img src={asset(beat.portrait)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Text rechts */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: 1.2, textTransform: 'uppercase', color: C.yellow }}>
            {beat.chapter} · {level.name}
          </div>
          <h2 style={{ margin: '2px 0 10px', fontSize: 30, fontWeight: 900, lineHeight: 1.1, textShadow: '0 3px 0 rgba(0,0,0,0.3)' }}>
            {beat.title}
          </h2>
          {beat.text.map((p, i) => (
            <p key={i} style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, lineHeight: 1.45, color: '#eaf6ff' }}>
              {p}
            </p>
          ))}

          <button
            className="fa-cta"
            onClick={storyContinue}
            style={{
              marginTop: 8, background: C.orange, color: '#fff', fontSize: 19, fontWeight: 900,
              border: 'none', borderRadius: 16, padding: '13px 32px', cursor: 'pointer',
              boxShadow: '0 6px 0 #b64d13',
            }}
          >
            {beat.cta ?? 'Weiter'} ▶
          </button>
        </div>
      </div>
    </div>
  )
}
