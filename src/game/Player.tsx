import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FynnoxModel } from './Fynnox3D'
import { player, resetPlayer, respawnAtCheckpoint } from './playerState'
import { controls } from './controls'
import { stepPlayer } from './physics'
import { useGameStore } from '../store/gameStore'
import { computeStars, type LevelDef } from './level'

// Bewegt Fynnox über die Physik, kümmert sich um Sturz-Respawn (letzter Checkpoint)
// und Ziel-Erkennung (→ Ergebnis-Screen mit Sternebewertung).
export function Player({ level }: { level: LevelDef }) {
  const g = useRef<THREE.Group>(null)
  const finished = useRef(false)

  useEffect(() => {
    resetPlayer(level.startX)
    finished.current = false
  }, [level])

  useFrame((_, delta) => {
    if (useGameStore.getState().screen !== 'play') return
    const dt = Math.min(delta, 0.05)

    stepPlayer(
      player,
      { left: controls.left, right: controls.right, jump: controls.jump, dash: controls.dash },
      level.platforms,
      dt,
    )
    controls.jump = false
    controls.dash = false

    if (player.y < -25) respawnAtCheckpoint()

    if (!finished.current && player.x >= level.goalX) {
      finished.current = true
      const st = useGameStore.getState()
      const stars = computeStars(st.coins, level.coins.length)
      st.finish({ levelId: level.id, stars, coins: st.coins, totalCoins: level.coins.length })
    }

    if (g.current) g.current.position.set(player.x, player.y, 0)
  })

  return (
    <group ref={g}>
      <FynnoxModel />
    </group>
  )
}
