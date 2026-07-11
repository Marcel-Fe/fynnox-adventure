import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { controls } from '../game/controls'

// Mobilfreundliche On-Screen-Buttons. Links unten laufen (◀ ▶), rechts unten
// springen. Pointer-Events decken Touch + Maus ab.
const btn: CSSProperties = {
  width: 76,
  height: 76,
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255,255,255,0.28)',
  color: '#fff',
  fontSize: 30,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  touchAction: 'none',
  userSelect: 'none',
  backdropFilter: 'blur(3px)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.25)',
}

function hold(set: (v: boolean) => void) {
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      set(true)
    },
    onPointerUp: (e: ReactPointerEvent) => {
      e.preventDefault()
      set(false)
    },
    onPointerCancel: () => set(false),
    onPointerLeave: () => set(false),
  }
}

export function TouchControls() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
      <div style={{ position: 'fixed', left: 18, bottom: 24, display: 'flex', gap: 14, pointerEvents: 'auto' }}>
        <button style={btn} {...hold((v) => (controls.left = v))} aria-label="links">◀</button>
        <button style={btn} {...hold((v) => (controls.right = v))} aria-label="rechts">▶</button>
      </div>
      <div style={{ position: 'fixed', right: 18, bottom: 24, pointerEvents: 'auto' }}>
        <button
          style={{ ...btn, width: 92, height: 92, background: 'rgba(43,143,78,0.55)', fontSize: 22 }}
          onPointerDown={(e) => {
            e.preventDefault()
            controls.jump = true
          }}
          aria-label="springen"
        >
          SPRUNG
        </button>
      </div>
    </div>
  )
}
