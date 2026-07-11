import type { CSSProperties } from 'react'
import { useGameStore } from '../store/gameStore'
import { asset } from '../utils/asset'
import { C } from './theme'

// Ergebnis-Screen nach dem Ziel: Sterne, gesammelte Münzen, Fynnox-Sieg-Pose,
// Buttons „Nochmal" und „Menü".
export function ResultScreen() {
  const result = useGameStore((s) => s.result)
  const start = useGameStore((s) => s.start)
  const toMenu = useGameStore((s) => s.toMenu)
  if (!result) return null

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

        <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
          <img src={asset('art/items/paw_coin.png')} width={28} height={28} alt="" />
          {result.coins} / {result.totalCoins} Pfotenmünzen
        </div>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 22 }}>
          <button
            onClick={() => start(result.levelId)}
            style={btn(C.orange)}
          >
            Nochmal
          </button>
          <button onClick={toMenu} style={btn(C.blue)}>
            Menü
          </button>
        </div>
      </div>

      <img
        src={asset('art/fynnox/victory.png')}
        alt=""
        style={{ position: 'fixed', bottom: 0, left: 24, height: '46vh', maxHeight: 340, pointerEvents: 'none', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.35))' }}
      />
    </div>
  )
}

function btn(bg: string): CSSProperties {
  return {
    background: bg, color: '#fff', fontWeight: 800, fontSize: 18, border: 'none',
    borderRadius: 16, padding: '12px 26px', cursor: 'pointer', boxShadow: '0 5px 0 rgba(0,0,0,0.18)',
  }
}
