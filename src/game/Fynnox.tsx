import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './playerState'
import { makeFynnoxFrames, FOX_IMG, type Pose } from '../render/paintFynnox'

// Fynnox als animiertes 2D-Sprite (gemalter Vektor-Cartoon). Frame-Wechsel je Zustand:
// steht → idle; läuft → run1..3 zyklisch; steigt → jump; fällt → fall. Spiegeln über
// scale.x = facing. Frames kommen aus paintFynnox (ein Zeichencode → konsistent).

const H = 3.0
const W = H * (FOX_IMG.w / FOX_IMG.h)
// Bild so verschieben, dass die Füße auf der Gruppen-Ursprung (Boden) sitzen.
const CENTER_Y = (FOX_IMG.footY / FOX_IMG.h - 0.5) * H

const RUN_CYCLE: Pose[] = ['run1', 'run2', 'run3', 'run2']

export function Fynnox() {
  const frames = useMemo(() => makeFynnoxFrames(), [])
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const grp = useRef<THREE.Group>(null)
  const runT = useRef(0)

  useFrame((_, delta) => {
    const m = mat.current
    const g = grp.current
    if (!m || !g) return

    let pose: Pose
    if (!player.onGround) {
      pose = player.vy > 0 ? 'jump' : 'fall'
    } else if (Math.abs(player.vx) > 0.1) {
      runT.current += delta * (6 + Math.abs(player.vx) * 0.6)
      pose = RUN_CYCLE[Math.floor(runT.current) % RUN_CYCLE.length]
    } else {
      runT.current = 0
      pose = 'idle'
    }

    if (m.map !== frames[pose]) m.map = frames[pose]
    // Blickrichtung spiegeln (Sprite ist nach rechts gezeichnet)
    g.scale.x = player.facing
  })

  return (
    <group ref={grp}>
      <mesh position={[0, CENTER_Y, 0.3]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          ref={mat}
          map={frames.idle}
          transparent
          alphaTest={0.3}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </mesh>
    </group>
  )
}
