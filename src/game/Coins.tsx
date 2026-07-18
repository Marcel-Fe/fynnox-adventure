import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'
import { burst } from './fx'
import type { Coin } from './level'

// Pfotenmünzen als Artwork-Sprites. „Münz-Dreh" über eine Skalierung der Breite
// (cos), dazu ein sanftes Auf und Ab. Einsammeln bei Nähe → Zähler im Store.
const SIZE = 1.0

export function Coins({ coins }: { coins: Coin[] }) {
  const tex = useTexture(asset('art/items/paw_coin.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const got = useRef<boolean[]>(coins.map(() => false))
  const pop = useRef<number[]>(coins.map(() => 0)) // Rest-Zeit der Einsammel-Animation
  const addCoin = useGameStore((s) => s.addCoin)

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const dt = Math.min(delta, 0.05)
    for (let i = 0; i < coins.length; i++) {
      const s = refs.current[i]
      if (!s) continue

      // Einsammel-Pop: Münze schießt kurz hoch, wird größer und verschwindet dann
      if (got.current[i]) {
        if (pop.current[i] > 0) {
          pop.current[i] -= dt
          const k = Math.max(0, pop.current[i] / 0.22)
          s.position.y += dt * 4.5
          const sc = SIZE * (1 + (1 - k) * 0.9) * k
          s.scale.set(sc, sc, 1)
          if (pop.current[i] <= 0) s.visible = false
        }
        continue
      }

      s.scale.x = SIZE * Math.cos(t * 3 + i) // Münz-Dreh
      s.position.y = coins[i].y + Math.sin(t * 2 + i) * 0.12
      const dx = player.x - coins[i].x
      const dy = player.y + 1 - coins[i].y
      if (dx * dx + dy * dy < 1.7) {
        got.current[i] = true
        pop.current[i] = 0.22
        burst('coin', coins[i].x, coins[i].y)
        addCoin()
      }
    }
  })

  return (
    <>
      {coins.map((c, i) => (
        <sprite
          key={i}
          ref={(el) => { refs.current[i] = el }}
          position={[c.x, c.y, 0.2]}
          scale={[SIZE, SIZE, 1]}
        >
          <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
        </sprite>
      ))}
    </>
  )
}
