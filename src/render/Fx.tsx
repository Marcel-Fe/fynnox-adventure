import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { particles, MAX_PARTICLES } from '../game/fx'

// Zeichnet den Partikel-Pool aus game/fx.ts. EIN Instanced-Mesh für alle Effekte
// (Funken, Staub, Glitzer) → nur ein Draw-Call, auch bei vielen Partikeln gleichzeitig.

// Weicher Funke: heller Kern, nach außen auslaufend.
function makeSparkTexture(): THREE.CanvasTexture {
  const S = 64
  const c = document.createElement('canvas')
  c.width = S; c.height = S
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

export function Fx() {
  const tex = useMemo(() => makeSparkTexture(), [])
  const refs = useRef<(THREE.Object3D & { color: THREE.Color } | null)[]>([])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = particles[i]
      const o = refs.current[i]
      if (!o) continue
      if (p.life <= 0) {
        if (o.scale.x !== 0) o.scale.setScalar(0) // erledigte Partikel unsichtbar parken
        continue
      }
      p.life -= dt
      p.vy += p.gravity * dt
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.z += p.vz * dt
      // Luftwiderstand → Funken bremsen weich aus statt schnurgerade zu fliegen
      p.vx *= 1 - 2.2 * dt
      p.vz *= 1 - 2.2 * dt
      o.position.set(p.x, p.y, p.z)
      const t = Math.max(0, p.life / p.maxLife)
      // schnelles Aufblitzen, dann Ausklingen (Skalierung ersetzt Transparenz)
      const grow = t > 0.85 ? (1 - t) / 0.15 : 1
      o.scale.setScalar(p.size * (0.25 + t * 0.75) * grow)
      o.color.setRGB(p.r, p.g, p.b)
    }
  })

  return (
    <Instances limit={MAX_PARTICLES} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
        fog={false}
      />
      {Array.from({ length: MAX_PARTICLES }, (_, i) => (
        <Instance
          key={i}
          ref={(el: never) => { refs.current[i] = el }}
          position={[0, -999, 0]}
          scale={0}
        />
      ))}
    </Instances>
  )
}
