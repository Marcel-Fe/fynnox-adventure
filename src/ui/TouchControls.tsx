import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import { controls } from '../game/controls'
import { C } from './theme'

// Querformat-Steuerung wie im Mockup: unten links Laufkreuz (◀ ▶),
// unten rechts DASH + SPRUNG.
const round: CSSProperties = {
  borderRadius: '50%',
  border: '4px solid rgba(255,255,255,0.85)',
  color: C.white,
  fontWeight: 800,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
}

function hold(set: (v: boolean) => void) {
  return {
    onPointerDown: (e: ReactPointerEvent) => {
      e.preventDefault()
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
      set(true)
    },
    onPointerUp: (e: ReactPointerEvent) => { e.preventDefault(); set(false) },
    onPointerCancel: () => set(false),
    onPointerLeave: () => set(false),
  }
}

function tap(fire: () => void) {
  return {
    onPointerDown: (e: ReactPointerEvent) => { e.preventDefault(); fire() },
  }
}

export function TouchControls() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}>
      {/* Laufkreuz links */}
      <div style={{ position: 'fixed', left: 22, bottom: 26, display: 'flex', gap: 16, pointerEvents: 'auto' }}>
        <button style={{ ...round, width: 76, height: 76, fontSize: 30, background: 'rgba(255,255,255,0.22)' }} {...hold((v) => (controls.left = v))} aria-label="links">◀</button>
        <button style={{ ...round, width: 76, height: 76, fontSize: 30, background: 'rgba(255,255,255,0.22)' }} {...hold((v) => (controls.right = v))} aria-label="rechts">▶</button>
      </div>
      {/* Aktionen rechts */}
      <div style={{ position: 'fixed', right: 22, bottom: 26, display: 'flex', alignItems: 'flex-end', gap: 16, pointerEvents: 'auto' }}>
        <button style={{ ...round, width: 72, height: 72, fontSize: 16, background: C.blue }} {...tap(() => (controls.dash = true))} aria-label="dash">DASH</button>
        <button style={{ ...round, width: 92, height: 92, fontSize: 18, background: C.orange }} {...tap(() => (controls.jump = true))} aria-label="springen">SPRUNG</button>
      </div>
    </div>
  )
}
