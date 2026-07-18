import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'
import { burst, addShake } from './fx'
import type { Pickup, Spring } from './level'

// Weitere Sammelobjekte (Artwork-Sprites) und die Sprungfeder als echte Mechanik.
// Die Physik selbst bleibt unangetastet — die Feder setzt nur `player.vy`.

// Gemeinsame Einsammel-Prüfung: Abstand zur Spielfigur (Körpermitte ~ y+1).
function reached(px: number, py: number, radius2: number): boolean {
  const dx = player.x - px
  const dy = player.y + 1 - py
  return dx * dx + dy * dy < radius2
}

export function Gems({ gems }: { gems: Pickup[] }) {
  const tex = useTexture(asset('art/items/gem.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const got = useRef<boolean[]>(gems.map(() => false))
  const addGem = useGameStore((s) => s.addGem)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < gems.length; i++) {
      const s = refs.current[i]
      if (!s || got.current[i]) continue
      // sanftes Schweben + Pulsieren (wie „Kristall pulsiert" im Referenz-Sheet)
      s.position.y = gems[i].y + Math.sin(t * 1.6 + i) * 0.18
      const pulse = 1 + Math.sin(t * 3 + i) * 0.08
      s.scale.set(1.1 * pulse, 1.1 * pulse, 1)
      if (reached(gems[i].x, gems[i].y, 2.2)) {
        got.current[i] = true
        s.visible = false
        burst('gem', gems[i].x, gems[i].y)
        addShake(0.12)
        addGem()
      }
    }
  })

  return (
    <>
      {gems.map((g, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} position={[g.x, g.y, 0.2]} scale={[1.1, 1.1, 1]}>
          <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
        </sprite>
      ))}
    </>
  )
}

export function Stars({ stars }: { stars: Pickup[] }) {
  const tex = useTexture(asset('art/items/star.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const got = useRef<boolean[]>(stars.map(() => false))
  const addStar = useGameStore((s) => s.addStar)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < stars.length; i++) {
      const s = refs.current[i]
      if (!s || got.current[i]) continue
      s.position.y = stars[i].y + Math.sin(t * 1.3 + i) * 0.25
      const pulse = 1 + Math.sin(t * 2.2 + i) * 0.1
      s.scale.set(1.3 * pulse, 1.3 * pulse, 1)
      if (reached(stars[i].x, stars[i].y, 2.6)) {
        got.current[i] = true
        s.visible = false
        burst('star', stars[i].x, stars[i].y)
        addShake(0.25)
        addStar()
      }
    }
  })

  return (
    <>
      {stars.map((st, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} position={[st.x, st.y, 0.2]} scale={[1.3, 1.3, 1]}>
          <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
        </sprite>
      ))}
    </>
  )
}

// Sprungfeder: Landet Fynnox darauf, wird er hoch katapultiert. Setzt nur `player.vy`
// (die Physik in physics.ts bleibt unverändert) und drückt sich sichtbar zusammen.
export function Springs({ springs }: { springs: Spring[] }) {
  const tex = useTexture(asset('art/items/spring.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const refs = useRef<(THREE.Sprite | null)[]>([])
  const squash = useRef<number[]>(springs.map(() => 0))

  useFrame((_, delta) => {
    for (let i = 0; i < springs.length; i++) {
      const s = refs.current[i]
      if (!s) continue
      const sp = springs[i]
      const dx = player.x - sp.x
      // Auslösen: nah dran, fällt oder steht knapp darüber
      if (Math.abs(dx) < 1.1 && player.y < sp.y + 1.6 && player.y > sp.y - 1.2 && player.vy <= 0.5) {
        player.vy = sp.power ?? 26
        player.onGround = false
        squash.current[i] = 1
        burst('spring', sp.x, sp.y + 0.3)
        addShake(0.18)
      }
      squash.current[i] = Math.max(0, squash.current[i] - delta * 3.5)
      const q = squash.current[i]
      s.scale.set(1.2 + q * 0.35, 1.2 - q * 0.5, 1) // zusammendrücken beim Auslösen
    }
  })

  return (
    <>
      {springs.map((sp, i) => (
        <sprite key={i} ref={(el) => { refs.current[i] = el }} position={[sp.x, sp.y + 0.5, 0.15]} scale={[1.2, 1.2, 1]}>
          <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
        </sprite>
      ))}
    </>
  )
}
