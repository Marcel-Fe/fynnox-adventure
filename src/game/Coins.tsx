import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'
import type { Coin } from './level'

// Drehende Pfotenmünzen. Einsammeln, wenn Fynnox nah genug ist → Zähler im Store.
export function Coins({ coins }: { coins: Coin[] }) {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const got = useRef<boolean[]>(coins.map(() => false))
  const addCoin = useGameStore((s) => s.addCoin)

  useFrame((_, delta) => {
    for (let i = 0; i < coins.length; i++) {
      const m = refs.current[i]
      if (!m || got.current[i]) continue
      m.rotation.y += delta * 3
      const dx = player.x - coins[i].x
      const dy = player.y + 1 - coins[i].y
      if (dx * dx + dy * dy < 1.7) {
        got.current[i] = true
        m.visible = false
        addCoin()
      }
    }
  })

  return (
    <>
      {coins.map((c, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el }} position={[c.x, c.y, 0]}>
          <torusGeometry args={[0.35, 0.13, 12, 20]} />
          <meshStandardMaterial color="#ffcf3f" emissive="#ffae1f" emissiveIntensity={0.6} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
    </>
  )
}
