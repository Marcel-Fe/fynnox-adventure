import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { asset } from '../utils/asset'
import { player } from './playerState'

// Erste NPC-Figur + Sprechblase (Grundstein für „andere Figuren mit Gesten & Aufgaben").
// Nutzt vorerst das Fynnox-Modell als hochwertigen Platzhalter (eigene Figuren kommen als
// eigene Modelle/Sheets). Winkt/nickt freundlich; kommt Fynnox näher, erscheint die Aufgabe.

const URL = asset('models/fynnox.glb')
const TARGET_H = 2.6

export interface NpcDef {
  x: number
  text: string
}

export function Npc({ def }: { def: NpcDef }) {
  const { scene } = useGLTF(URL)
  const model = useMemo(() => {
    const m = skeletonClone(scene)
    // eigene, leicht kühlere Färbung → als andere Figur erkennbar (Material nicht teilen!)
    m.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
        mat.color.multiplyScalar(0.9)
        mat.color.lerp(new THREE.Color('#9fb6d6'), 0.25)
        mesh.material = mat
        mesh.castShadow = true
        mesh.frustumCulled = false
      }
    })
    return m
  }, [scene])

  const { scaleV, yOff } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(model)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = TARGET_H / (size.y || 1)
    return { scaleV: s, yOff: -box.min.y * s }
  }, [model])

  const head = useMemo(() => model.getObjectByName('Head'), [model])
  const rArm = useMemo(() => model.getObjectByName('R_Upperarm'), [model])
  const base = useMemo(() => ({
    headX: head?.rotation.x ?? 0,
    armZ: rArm?.rotation.z ?? 0,
  }), [head, rArm])

  const outer = useRef<THREE.Group>(null)
  const t = useRef(0)
  const [near, setNear] = useState(false)

  useEffect(() => {
    scene.updateMatrixWorld(true)
  }, [scene])

  useFrame((_, delta) => {
    t.current += delta
    const dist = Math.abs(player.x - def.x)
    const isNear = dist < 8
    if (isNear !== near) setNear(isNear)

    if (outer.current) outer.current.position.y = yOff + Math.sin(t.current * 2) * 0.03
    if (head) head.rotation.x = base.headX + Math.sin(t.current * 2.2) * 0.12 // freundliches Nicken
    if (rArm) rArm.rotation.z = base.armZ + (isNear ? 0.6 + Math.abs(Math.sin(t.current * 6)) * 0.4 : 0.1) // Winken
  })

  return (
    <group position={[def.x, 0, 0]}>
      <group ref={outer} position={[0, yOff, 0]} scale={scaleV} rotation={[0, Math.PI, 0]}>
        <primitive object={model} />
      </group>
      {near && (
        <Html position={[0, TARGET_H + 0.9, 0]} center distanceFactor={14} occlude={false} pointerEvents="none">
          <div
            style={{
              background: '#ffffff',
              color: '#16213c',
              borderRadius: 18,
              padding: '10px 14px',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 600,
              fontSize: 15,
              lineHeight: 1.25,
              width: 220,
              textAlign: 'center',
              boxShadow: '0 6px 18px rgba(0,0,0,0.28)',
              border: '3px solid #2f6fe0',
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {def.text}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                bottom: -12,
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderTop: '12px solid #2f6fe0',
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
