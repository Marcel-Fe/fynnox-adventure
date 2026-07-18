import { useGameStore } from '../store/gameStore'
import { getLevel, isUnlocked, WORLD_GROUPS } from '../game/levels'
import { totalGemCount } from '../game/level'
import { asset } from '../utils/asset'
import { C } from './theme'

// Level-Auswahl einer Welt: eine Kachel je Level mit Sternen, Sammel-Übersicht und
// Schloss. Ein Level öffnet sich, sobald das vorherige geschafft ist — kein Timer,
// keine Währung, keine Wartezeit (CLAUDE.md §4).

const SUBTITLE: Record<string, string> = {
  'wald-1': 'Der erste Weg durch den Wald',
  'wald-2': 'Schaukelnde Holzbrücken',
  'wald-3': 'Hinauf zum Kristallhain',
  'candy-1': 'Zuckerguss und Lolli-Bäume',
}

export function LevelSelect({ worldKey, onClose }: { worldKey: string; onClose: () => void }) {
  const save = useGameStore((s) => s.save)
  const start = useGameStore((s) => s.start)
  const group = WORLD_GROUPS.find((w) => w.key === worldKey)
  if (!group) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 18,
        background: 'rgba(8,16,32,0.72)', backdropFilter: 'blur(6px)', color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.75 }}>
          Wähle dein Level
        </div>
        <h2 style={{ margin: '4px 0 0', fontSize: 34, fontWeight: 900, textShadow: '0 3px 0 rgba(0,0,0,0.35)' }}>
          {group.name}
        </h2>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '92vw' }}>
        {group.levels.map((id, i) => {
          const level = getLevel(id)
          const open = isUnlocked(id, save)
          const stars = save.bestStars[id] ?? 0
          return (
            <button
              key={id}
              className="fa-card"
              disabled={!open}
              onClick={() => open && start(id)}
              style={{
                width: 218, borderRadius: 20, padding: '16px 16px 14px', textAlign: 'left', color: '#fff',
                background: open ? 'linear-gradient(165deg, rgba(255,255,255,0.16), rgba(255,255,255,0.05))' : 'rgba(255,255,255,0.06)',
                border: `3px solid ${open ? C.orange : 'rgba(255,255,255,0.18)'}`,
                boxShadow: open ? '0 10px 26px rgba(0,0,0,0.45)' : 'none',
                cursor: open ? 'pointer' : 'default', opacity: open ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: 0.6, opacity: 0.8 }}>
                  LEVEL {i + 1}
                </span>
                {!open && <span style={{ fontSize: 17 }}>🔒</span>}
              </div>

              <div style={{ fontSize: 21, fontWeight: 900, marginTop: 2 }}>{level.name}</div>
              <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.82, minHeight: 32, lineHeight: 1.3 }}>
                {open ? SUBTITLE[id] ?? '' : 'Schaffe zuerst das Level davor.'}
              </div>

              <div style={{ display: 'flex', gap: 3, margin: '8px 0 6px' }}>
                {[1, 2, 3].map((n) => (
                  <img
                    key={n}
                    src={asset('art/items/star.png')}
                    width={22}
                    height={22}
                    alt=""
                    style={{ opacity: n <= stars ? 1 : 0.28, filter: n <= stars ? 'none' : 'grayscale(1)' }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', gap: 12, fontSize: 12.5, fontWeight: 700, opacity: 0.85 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <img src={asset('art/items/paw_coin.png')} width={16} height={16} alt="" />
                  {level.coins.length}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <img src={asset('art/items/gem.png')} width={16} height={16} alt="" />
                  {totalGemCount(level)}
                </span>
                {level.chest && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <img src={asset('art/items/chest.png')} width={16} height={16} alt="" />
                    1
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <button
        onClick={onClose}
        className="fa-glass"
        style={{ padding: '12px 30px', borderRadius: 16, color: '#fff', fontSize: 17, fontWeight: 800, cursor: 'pointer' }}
      >
        ← Zurück
      </button>
    </div>
  )
}
