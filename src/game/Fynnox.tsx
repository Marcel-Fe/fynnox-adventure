import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'

// Fynnox als Original-Artwork-Sprite (Billboard) auf der 3D-Bühne → exakt der
// Look aus den Referenzbildern. Läuft er, wippt er leicht; er lehnt sich in die
// Bewegungsrichtung und spiegelt sich beim Richtungswechsel.
const H = 2.9

export function Fynnox() {
  const tex = useTexture(asset('art/fynnox/front.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const img = tex.image as { width: number; height: number } | undefined
  const aspect = img ? img.width / img.height : 512 / 768
  const W = H * aspect

  const sp = useRef<THREE.Sprite>(null)
  const mat = useRef<THREE.SpriteMaterial>(null)

  useFrame(({ clock }) => {
    const s = sp.current
    if (!s) return
    const running = player.onGround && Math.abs(player.vx) > 0.1
    const bob = running ? Math.abs(Math.sin(clock.elapsedTime * 11)) * 0.09 : 0
    s.position.y = H * 0.46 + bob
    s.scale.set(W * player.facing, H, 1) // spiegeln bei Richtungswechsel
    if (mat.current) mat.current.rotation = THREE.MathUtils.clamp(-player.vx * 0.014, -0.16, 0.16)
  })

  return (
    <sprite ref={sp} position={[0, H * 0.46, 0]} scale={[W, H, 1]}>
      <spriteMaterial ref={mat} map={tex} transparent alphaTest={0.4} depthWrite={false} />
    </sprite>
  )
}
