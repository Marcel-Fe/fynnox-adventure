import type { CSSProperties } from 'react'
import { useGameStore } from '../store/gameStore'
import { getLevel, nextLevelId } from '../game/levels'
import { goalsOf } from '../game/level'
import { asset } from '../utils/asset'
import { C } from './theme'

// Ergebnis-Screen nach dem Ziel: Sterne, gesammelte Münzen, Fynnox-Sieg-Pose,
// Buttons „Nochmal" und „Menü".
export function ResultScreen() {
  const result = useGameStore((s) => s.result)
  const start = useGameStore((s) => s.start)
  const afterLevel = useGameStore((s) => s.afterLevel)
  const toMenu = useGameStore((s) => s.toMenu)
  if (!result) return null

  const nextId = nextLevelId(result.levelId)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(10,20,35,0.62)', backdropFilter: 'blur(4px)', zIndex: 20,
      }}
    >
      <div
        style={{
          background: 'linear-gradient(180deg,#fff,#eaf2ff)', borderRadius: 28, padding: '26px 34px',
          width: 'min(90vw, 460px)', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
          border: `4px solid ${C.navy}`,
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 900, color: C.navy }}>Geschafft! 🎉</div>

        {/* Sterne */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '14px 0 8px' }}>
          {[1, 2, 3].map((n) => (
            <img
              key={n}
              src={asset('art/items/star.png')}
              width={64}
              height={64}
              alt=""
              style={{
                filter: n <= result.stars ? 'none' : 'grayscale(1)',
                opacity: n <= result.stars ? 1 : 0.3,
                transform: n === 2 ? 'translateY(-8px) scale(1.12)' : 'none',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', fontSize: 19, fontWeight: 800, color: C.navy }}>
          <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <img src={asset('art/items/paw_coin.png')} width={28} height={28} alt="" />
            {result.coins} / {result.totalCoins}
          </span>
          {(result.totalGems ?? 0) > 0 && (
            <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <img src={asset('art/items/gem.png')} width={26} height={26} alt="" />
              {result.gems ?? 0} / {result.totalGems}
            </span>
          )}
          {(result.totalStars ?? 0) > 0 && (
            <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
              <img src={asset('art/items/star.png')} width={26} height={26} alt="" />
              {result.foundStars ?? 0} / {result.totalStars}
            </span>
          )}
        </div>

        {/* Level-Ziele: zeigt, WOFÜR es die Sterne gab — und was beim nächsten
            Versuch noch drin ist. */}
        {result.goalsDone && (
          <div style={{ margin: '16px auto 0', maxWidth: 360, textAlign: 'left' }}>
            {goalsOf(getLevel(result.levelId)).map((g, i) => {
              const done = result.goalsDone?.[i]
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '5px 2px',
                    fontSize: 14.5, fontWeight: 700,
                    color: done ? C.green : '#8b93a6',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{done ? '✅' : '⬜'}</span>
                  <span style={{ textDecoration: done ? 'none' : 'none' }}>{g.label}</span>
                </div>
              )
            })}
          </div>
        )}

        {nextId && (
          <div style={{ marginTop: 16, fontSize: 14.5, fontWeight: 700, color: C.green }}>
            🔓 {getLevel(nextId).name} freigeschaltet!
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, flexWrap: 'wrap' }}>
          <button onClick={() => afterLevel(result.levelId)} style={btn(C.green)}>
            Weiter ▶
          </button>
          <button onClick={() => start(result.levelId)} style={btn(C.orange)}>
            Nochmal
          </button>
          <button onClick={toMenu} style={btn(C.blue)}>
            Menü
          </button>
        </div>
      </div>

      {/* Der echte Fynnox statt des alten Vektor-Platzhalters mit „P"-Anzug. */}
      <img
        src={asset('art/fynnox/hero.webp')}
        alt=""
        style={{ position: 'fixed', bottom: 0, left: 24, height: '52vh', maxHeight: 380, pointerEvents: 'none', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.45))' }}
      />
    </div>
  )
}

function btn(bg: string): CSSProperties {
  return {
    background: bg, color: '#fff', fontWeight: 800, fontSize: 17, border: 'none',
    borderRadius: 15, padding: '11px 20px', cursor: 'pointer', boxShadow: '0 5px 0 rgba(0,0,0,0.18)',
    whiteSpace: 'nowrap',
  }
}
