import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'

// Checkpoint-Flaggen (Artwork). Läuft Fynnox daran vorbei, wird der Respawn-Punkt
// gesetzt und die Flagge „springt" kurz größer (Bestätigung).
export function Checkpoints({ positions }: { positions: number[] }) {
  const tex = useTexture(asset('art/items/flag.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const active = useRef<boolean[]>(positions.map(() => false))
  const H = 2.4
  const W = H

  useFrame(({ clock }) => {
    for (let i = 0; i < positions.length; i++) {
      const s = refs.current[i]
      if (!s) continue
      if (!active.current[i] && player.x >= positions[i]) {
        active.current[i] = true
        if (positions[i] > player.checkpointX) player.checkpointX = positions[i]
      }
      const pop = active.current[i] ? 1 + Math.max(0, Math.sin(clock.elapsedTime * 6)) * 0.06 : 0.9
      s.scale.set(W * pop, H * pop, 1)
    }
  })

  return (
    <>
      {positions.map((x, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} position={[x, H * 0.5, 0.1]} scale={[W, H, 1]}>
          <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
        </sprite>
      ))}
    </>
  )
}

// Ziel-Flagge: größer, mit leuchtendem Ring als klares „hier ist Schluss".
export function Goal({ x }: { x: number }) {
  const tex = useTexture(asset('art/items/flag.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const H = 3.6
  return (
    <group position={[x, 0, 0]}>
      <sprite position={[0, H * 0.5, 0.1]} scale={[H, H, 1]}>
        <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
      </sprite>
      <mesh position={[0, 2.4, -0.4]}>
        <torusGeometry args={[1.7, 0.16, 12, 32]} />
        <meshStandardMaterial color="#ffd23f" emissive="#ffae1f" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}
