import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, Html } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'
import type { NpcDefData } from './level'

// Figur als freigestelltes Artwork-Billboard (kein 3D-Modell nötig).
// Das Bild steht senkrecht in der Welt, dreht sich leicht zum Spieler und wippt sanft —
// dadurch wirkt es in der 2,5D-Bühne lebendig und nicht wie ein flacher Aufkleber.
// Höhe wird in Welt-Einheiten vorgegeben, die Breite folgt aus dem Seitenverhältnis.

const REACH = 7

export function SpriteNpc({ def, id }: { def: NpcDefData; id: number }) {
  const tex = useTexture(asset(def.sprite!))
  tex.colorSpace = THREE.SRGBColorSpace

  const img = tex.image as { width: number; height: number } | undefined
  const aspect = img && img.height ? img.width / img.height : 0.7
  const h = def.height ?? 2.4
  const w = h * aspect

  const group = useRef<THREE.Group>(null)
  const t = useRef(Math.abs(def.x) % 6)
  const [near, setNear] = useState(false)
  const [line, setLine] = useState(0)

  useFrame((_, delta) => {
    t.current += delta
    const isNear = Math.abs(player.x - def.x) < REACH
    if (isNear !== near) {
      setNear(isNear)
      if (isNear) {
        if (def.lines.length > 1) setLine((n) => (n + 1) % def.lines.length)
        useGameStore.getState().markTalked(id) // zählt auf das „Sprich mit allen"-Ziel ein
      }
    }
    const g = group.current
    if (!g) return
    // sanftes Atmen/Wippen + leichte Drehung zum Spieler (verkauft die Tiefe)
    const bob = Math.sin(t.current * 1.9) * 0.035
    g.position.y = h / 2 + bob
    g.scale.y = 1 + Math.sin(t.current * 1.9) * 0.012
    const dir = THREE.MathUtils.clamp((player.x - def.x) / 6, -1, 1)
    g.rotation.y = dir * 0.45
  })

  return (
    <group position={[def.x, 0, def.z ?? 0]}>
      <group ref={group} position={[0, h / 2, 0]}>
        <mesh>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial map={tex} transparent alphaTest={0.35} side={THREE.DoubleSide} toneMapped={false} />
        </mesh>
      </group>

      {/* weicher Bodenschatten, damit die Figur nicht schwebt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[w * 0.38, 20]} />
        <meshBasicMaterial color="#1d3a1d" transparent opacity={0.28} depthWrite={false} />
      </mesh>

      {near && def.lines.length > 0 && (
        <Html position={[0, h + 0.7, 0]} center distanceFactor={14} occlude={false} pointerEvents="none">
          <div
            style={{
              background: '#ffffff', color: '#16213c', borderRadius: 18, padding: '10px 14px',
              fontFamily: 'system-ui, sans-serif', fontWeight: 600, fontSize: 15, lineHeight: 1.25,
              width: 210, textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
              border: '3px solid #a3622f', position: 'relative', userSelect: 'none',
            }}
          >
            {def.lines[line]}
            <div
              style={{
                position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)',
                width: 0, height: 0, borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent', borderTop: '12px solid #a3622f',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
