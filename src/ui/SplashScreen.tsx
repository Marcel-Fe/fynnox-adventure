import { useState } from 'react'
import { asset } from '../utils/asset'
import { C } from './theme'

// Cover-Popup vor dem Menü: großes Titel-Cover mit Fynnox-Maskottchen und pulsierendem
// Start. Ein Klick (= erste Nutzer-Geste → startet auch die Musik) blendet weich ins
// Menü über. Erscheint nur beim ersten Laden.
export function SplashScreen({ onStart }: { onStart: () => void }) {
  const [leaving, setLeaving] = useState(false)
  const go = () => {
    if (leaving) return
    setLeaving(true)
    setTimeout(onStart, 600) // wartet die Ausblend-Animation ab
  }

  return (
    <div
      className={`fa-splash ${leaving ? 'fa-splash-out' : ''}`}
      onClick={go}
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden', cursor: 'pointer', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}
    >
      {/* Unscharfe Kulisse aus demselben Cover → alles wirkt aus einem Guss */}
      <img
        src={asset('art/cover.webp')}
        alt=""
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(26px) saturate(1.15)', transform: 'scale(1.15)' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 85% at 50% 45%, rgba(8,16,32,0.25) 0%, rgba(6,12,26,0.72) 60%, rgba(4,9,20,0.92) 100%)' }} />

      {/* Das Spiel-Cover als Karte — wie eine Spielhülle */}
      <div
        className="fa-splash-mascot"
        style={{
          position: 'relative', zIndex: 2, width: 'min(42vh, 300px)', aspectRatio: '1 / 1',
          borderRadius: 34, overflow: 'hidden',
          boxShadow: '0 26px 70px rgba(0,0,0,0.65), 0 0 90px rgba(255,170,60,0.28)',
          border: '3px solid rgba(255,220,140,0.55)',
        }}
      >
        <img src={asset('art/cover.webp')} alt="Fynnox Adventure" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>

      <p className="fa-splash-tag" style={{ position: 'relative', zIndex: 2, margin: '18px 0 0', fontSize: 17, fontWeight: 700, color: '#eaf6ff', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
        Ein Fuchs. Fünf Welten. Ein großes Abenteuer. 🦊
      </p>

      {/* Start-Button */}
      <div className="fa-splash-cta" style={{ position: 'relative', zIndex: 2, marginTop: 18 }}>
        <button
          className="fa-splash-cta-pulse"
          onClick={(e) => { e.stopPropagation(); go() }}
          style={{
            background: C.orange, color: '#fff', fontSize: 24, fontWeight: 900, border: 'none',
            borderRadius: 999, padding: '16px 52px', cursor: 'pointer', boxShadow: '0 8px 0 #b64d13',
          }}
        >
          ▶ Spielen
        </button>
      </div>

      <div className="fa-splash-hint" style={{ position: 'relative', zIndex: 2, marginTop: 18, fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#dbeaff' }}>
        Tippen zum Starten
      </div>
    </div>
  )
}
