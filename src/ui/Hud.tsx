import { useGameStore } from '../store/gameStore'

// Kopfzeile: Titel links, Pfotenmünzen-Zähler rechts.
export function Hud() {
  const coins = useGameStore((s) => s.coins)
  return (
    <>
      <div
        style={{
          position: 'fixed', left: 14, top: 12, padding: '6px 12px', borderRadius: 12,
          background: 'rgba(20,40,30,0.45)', color: '#fff', fontWeight: 700, fontSize: 15,
          backdropFilter: 'blur(4px)',
        }}
      >
        🦊 Fynnox Adventure — Wald
      </div>
      <div
        style={{
          position: 'fixed', right: 14, top: 12, padding: '6px 14px', borderRadius: 12,
          background: 'rgba(40,30,10,0.5)', color: '#ffd76a', fontWeight: 800, fontSize: 18,
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        🐾 {coins}
      </div>
    </>
  )
}
