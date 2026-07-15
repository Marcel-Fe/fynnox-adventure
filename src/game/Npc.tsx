import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Html } from '@react-three/drei'
import * as THREE from 'three'
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'

// NPC-Figur mit echter Aufgaben-Logik. Gibt die Level-Quest (alle Münzen sammeln),
// zeigt den Fortschritt in der Sprechblase und reagiert bei Abgabe („Danke!").
//
// Modell-Pipeline (Lücke 5): jede Figur kann ein eigenes GLB laden
// (`public/models/<name>.glb`). Ohne `model` dient das getönte Fynnox-Modell als
// hochwertiger Platzhalter. Wie man ein echtes Figuren-GLB erzeugt, steht in
// `docs/npc-pipeline.md`.

const FALLBACK = asset('models/fynnox.glb')
const TARGET_H = 2.6
const REACH = 8 // Sprechblase erscheint ab dieser Nähe

export interface NpcDef {
  x: number
  model?: string // GLB-Dateiname unter public/models/ (ohne Pfad)
  tint?: string // Einfärbung des Platzhalter-Modells
}

export interface NpcQuest {
  total: number // Anzahl Münzen im Level
  ask: string
  ready: string
  thanks: string
}

export function Npc({ def, quest }: { def: NpcDef; quest: NpcQuest }) {
  const url = def.model ? asset('models/' + def.model) : FALLBACK
  const { scene } = useGLTF(url)
  const isFallback = url === FALLBACK

  const coins = useGameStore((s) => s.coins)
  const questDone = useGameStore((s) => s.questDone)
  const completeQuest = useGameStore((s) => s.completeQuest)
  const allCollected = coins >= quest.total

  const model = useMemo(() => {
    const m = skeletonClone(scene)
    m.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.material) {
        const mat = (mesh.material as THREE.MeshStandardMaterial).clone()
        // Platzhalter (Fynnox-Modell) leicht kühler tönen → als andere Figur erkennbar.
        // Eigene GLBs bleiben unverfälscht, außer es wird bewusst getönt.
        if (isFallback || def.tint) {
          mat.color.multiplyScalar(0.85)
          mat.color.lerp(new THREE.Color(def.tint ?? '#8fb0e0'), 0.5)
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
    const isNear = dist < REACH
    if (isNear !== near) setNear(isNear)

    // Abgabe: alles gesammelt + beim NPC → Quest erfüllt (einmalig).
    // Zustand FRISCH aus dem Store lesen (nicht aus der Render-Closure) → immer aktuell.
    const st = useGameStore.getState()
    if (isNear && st.coins >= quest.total && !st.questDone) completeQuest()

    // Freut sich stärker, wenn die Aufgabe erledigt ist.
    const joy = questDone ? 1 : allCollected ? 0.6 : 0
    if (outer.current) outer.current.position.y = yOff + Math.sin(t.current * 2) * (0.03 + joy * 0.05)
    if (head) head.rotation.x = base.headX + Math.sin(t.current * 2.2) * 0.12
    if (rArm) {
      const waveAmp = isNear ? 0.6 + Math.abs(Math.sin(t.current * (6 + joy * 4))) * (0.4 + joy * 0.5) : 0.1
      rArm.rotation.z = base.armZ + waveAmp
    }
  })

  const bubbleText = questDone ? quest.thanks : allCollected ? quest.ready : `${quest.ask} (${coins}/${quest.total})`
  const bubbleColor = questDone ? '#2f9e54' : '#2f6fe0'

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
              border: `3px solid ${bubbleColor}`,
              position: 'relative',
              userSelect: 'none',
            }}
          >
            {bubbleText}
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
                borderTop: `12px solid ${bubbleColor}`,
              }}
            />
          </div>
        </Html>
      )}
    </group>
  )
}
