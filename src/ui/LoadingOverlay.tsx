import { useProgress } from '@react-three/drei'
import { asset } from '../utils/asset'
import { C } from './theme'

// Ladeschirm während die 3D-Szene (v. a. das 2,4-MB-Fynnox-Modell) noch lädt.
//
// Warum nötig: Der erste Level-Einstieg zieht das GLB und die Panorama-/Deko-Texturen.
// Auf dem Handy dauert das ein paar Sekunden; ohne Überdeckung sähe man solange eine
// leere Bühne (Fynnox erscheint erst mit dem Modell). Das wirkte wie ein Fehlstart.
// `useProgress` meldet den echten Ladefortschritt des three-Ladmanagers. `active` ist nur
// true, solange Requests laufen — beim zweiten Level ist das GLB gecacht, dann bleibt der
// Schirm aus.
export function LoadingOverlay() {
  const { active, progress } = useProgress()
  if (!active) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22,
        background: `radial-gradient(120% 90% at 50% 35%, #24365f 0%, ${C.navyDeep} 70%, #0b1327 100%)`,
        color: C.white,
      }}
    >
      <img
        src={asset('art/cover.webp')}
        alt=""
        className="fa-float"
        width={170}
        height={170}
        style={{ borderRadius: 28, boxShadow: '0 14px 40px rgba(0,0,0,0.5)' }}
      />
      <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.4, textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
        Fynnox macht sich bereit …
      </div>
      <div style={{ width: 240, height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${Math.max(6, Math.round(progress))}%`, height: '100%', borderRadius: 999,
            background: `linear-gradient(90deg, ${C.yellow}, ${C.orange})`, transition: 'width 0.2s ease',
          }}
        />
      </div>
    </div>
  )
}
