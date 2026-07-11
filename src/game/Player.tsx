import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Fynnox } from './Fynnox'
import { player, resetPlayer } from './playerState'
import { controls } from './controls'
import { stepPlayer, type Platform } from './physics'

// Bewegt Fynnox über die Seitenscroller-Physik. Liest Eingabe, rechnet einen
// Physik-Schritt, setzt Position + Blickrichtung. Fällt Fynnox aus der Welt,
// startet er am Level-Anfang neu.
export function Player({ platforms, startX }: { platforms: Platform[]; startX: number }) {
  const g = useRef<THREE.Group>(null)

  // Fynnox am Level-Anfang platzieren.
  useEffect(() => resetPlayer(startX), [startX])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    stepPlayer(
      player,
      { left: controls.left, right: controls.right, jump: controls.jump },
      platforms,
      dt,
    )
    controls.jump = false // Sprung verbraucht (Flanke)

    if (player.y < -25) resetPlayer(startX)

    const grp = g.current
    if (grp) {
      grp.position.set(player.x, player.y, 0)
      grp.rotation.y = player.facing === 1 ? 0 : Math.PI
    }
  })

  return (
    <group ref={g}>
      <group scale={1.2}>
        <Fynnox />
      </group>
    </group>
  )
}
