import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'
import type { NpcDefData } from './level'

// Bewohner der Welt: Figuren, die einfach da sind, sich bewegen und bei Annäherung
// etwas sagen (keine Quest). Jede Figur kann ein EIGENES GLB laden
// (`public/models/<name>.glb`); ohne Modell dient ein deutlich umgefärbtes und anders
// skaliertes Fynnox-Modell als Platzhalter, bis echte Figuren vorliegen.

const FALLBACK = asset('models/fynnox.glb')
const BASE_H = 2.6
const REACH = 7

export function Villager({ def, id }: { def: NpcDefData; id: number }) {
  const url = def.model ? asset('models/' + def.model) : FALLBACK
  const { scene } = useGLTF(url)
  const isFallback = url === FALLBACK

  const model = useMemo(() => {
    const m = skeletonClone(scene)
    m.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
        if (isFallback || def.tint) {
          // kräftig umfärben, damit die Figur NICHT wie ein zweiter Fynnox wirkt
          mat.color.lerp(new THREE.Color(def.tint ?? '#8fb0e0'), 0.72)
        }
        mesh.material = mat
        mesh.castShadow = true
        mesh.frustumCulled = false
      }
    })
    return m
  }, [scene, isFallback, def.tint])

  const { scaleV, yOff } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = (BASE_H * (def.scale ?? 1)) / (size.y || 1)
    return { scaleV: s, yOff: -box.min.y * s }
  }, [model, def.scale])

  const head = useMemo(() => model.getObjectByName('Head'), [model])
  const rArm = useMemo(() => model.getObjectByName('R_Upperarm'), [model])
  const base = useMemo(() => ({ headX: head?.rotation.x ?? 0, armZ: rArm?.rotation.z ?? 0 }), [head, rArm])

  const outer = useRef<THREE.Group>(null)
  const t = useRef(Math.abs(def.x) % 6) // versetzte Phase → nicht alle im Gleichtakt
  const [near, setNear] = useState(false)
  const [line, setLine] = useState(0)

  useEffect(() => { scene.updateMatrixWorld(true) }, [scene])

  useFrame((_, delta) => {
    t.current += delta
    const isNear = Math.abs(player.x - def.x) < REACH
    if (isNear !== near) {
      setNear(isNear)
      if (isNear) {
        // bei jeder neuen Annäherung den nächsten Spruch zeigen
        if (def.lines.length > 1) setLine((n) => (n + 1) % def.lines.length)
        useGameStore.getState().markTalked(id) // zählt auf das „Sprich mit allen"-Ziel ein
      }
    }
    if (outer.current) {
      outer.current.position.y = yOff + Math.sin(t.current * 1.8) * 0.04
      outer.current.rotation.y = Math.PI + (player.x < def.x ? -0.35 : 0.35) // dreht sich zum Spieler
    }
    if (head) head.rotation.x = base.headX + Math.sin(t.current * 1.9) * 0.1
    if (rArm) rArm.rotation.z = base.armZ + (isNear ? 0.55 + Math.abs(Math.sin(t.current * 5)) * 0.45 : 0.12)
  })

  return (
    <group position={[def.x, 0, 0]}>
      <group ref={outer} position={[0, yOff, 0]} scale={scaleV} rotation={[0, Math.PI, 0]}>
        <primitive object={model} />
      </group>
      {near && def.lines.length > 0 && (
        <Html position={[0, BASE_H * (def.scale ?? 1) + 1.5, 0]} center distanceFactor={19} occlude={false} pointerEvents="none">
          <div
            style={{
              background: '#ffffff', color: '#16213c', borderRadius: 16, padding: '8px 12px',
              fontFamily: 'system-ui, sans-serif', fontWeight: 600, fontSize: 14, lineHeight: 1.22,
              width: 176, textAlign: 'center', boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
              border: '3px solid #7a5cc4', position: 'relative', userSelect: 'none',
            }}
          >
            {def.lines[line]}
            <div
              style={{
                position: 'absolute', left: '50%', bottom: -12, transform: 'translateX(-50%)',
                width: 0, height: 0, borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent', borderTop: '12px solid #7a5cc4',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
