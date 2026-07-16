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
      {/* Cover-Kulisse + Verlauf für Kontrast */}
      <img src={asset('art/previews/wald.png')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(120% 85% at 50% 42%, rgba(10,22,40,0.15) 0%, rgba(8,15,30,0.55) 55%, rgba(6,12,26,0.9) 100%)' }} />

      {/* Maskottchen im leuchtenden Ring */}
      <div className="fa-splash-mascot" style={{ position: 'relative', zIndex: 2, width: 190, height: 190, marginBottom: 4 }}>
        <div className="fa-ring" style={{ position: 'absolute', inset: -12, borderRadius: '50%', border: '3px dashed rgba(255,180,90,0.7)' }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
          border: '5px solid rgba(255,255,255,0.92)', boxShadow: '0 16px 46px rgba(0,0,0,0.55), 0 0 60px rgba(255,150,60,0.35)',
          background: 'radial-gradient(circle at 50% 35%, #cdeeff 0%, #7fb4dd 70%, #5a95c4 100%)',
        }}>
          <img src={asset('art/fynnox/portrait.png')} alt="Fynnox" style={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'translateY(2%) scale(1.02)' }} />
        </div>
      </div>

      {/* Logo */}
      <h1 className="fa-splash-logo" style={{ position: 'relative', zIndex: 2, margin: 0, textAlign: 'center', fontWeight: 900, lineHeight: 0.95, textShadow: '0 5px 0 rgba(0,0,0,0.32)' }}>
        <span style={{ display: 'block', fontSize: 58, letterSpacing: 1 }}>Fynnox</span>
        <span style={{ display: 'block', fontSize: 58, letterSpacing: 1, color: C.orange }}>Adventure</span>
      </h1>

      <p className="fa-splash-tag" style={{ position: 'relative', zIndex: 2, margin: '6px 0 0', fontSize: 17, fontWeight: 600, color: '#eaf6ff', textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>
        Ein Fuchs. Fünf Welten. Ein großes Abenteuer. 🦊
      </p>

      {/* Start-Button */}
      <div className="fa-splash-cta" style={{ position: 'relative', zIndex: 2, marginTop: 22 }}>
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
