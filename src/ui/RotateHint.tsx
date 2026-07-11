import { useEffect, useState } from 'react'
import { C } from './theme'

// Bittet auf Touch-Geräten im Hochformat, das Gerät ins Querformat zu drehen —
// das Spiel ist fürs Querformat ausgelegt.
export function RotateHint() {
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    const check = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches
      setPortrait(coarse && window.innerHeight > window.innerWidth)
    }
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  if (!portrait) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: C.navyDeep, color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, textAlign: 'center', padding: 24,
      }}
    >
      <div style={{ fontSize: 64, animation: 'fynnoxrotate 2s ease-in-out infinite' }}>📱</div>
      <div style={{ fontSize: 22, fontWeight: 800 }}>Bitte drehe dein Gerät</div>
      <div style={{ fontSize: 16, opacity: 0.8 }}>Fynnox Adventure spielt sich im Querformat 🔄</div>
    </div>
  )
}
