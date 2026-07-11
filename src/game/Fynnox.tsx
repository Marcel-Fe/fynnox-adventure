import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'

// PLATZHALTER: Fynnox als Billboard aus der Referenz-Grafik (side.png), damit die Figur
// exakt wie die Vorlage aussieht, solange das echte 3D-Modell (public/models/fynnox.glb)
// noch nicht da ist. Sobald das .glb vorliegt, wird hier auf <FynnoxGltf> umgeschaltet.
const H = 2.9

export function Fynnox() {
  const tex = useTexture(asset('art/fynnox/side.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const img = tex.image as HTMLImageElement | undefined
  const aspect = img && img.width ? img.width / img.height : 0.68
  const W = H * aspect

  const grp = useRef<THREE.Group>(null)
  const runT = useRef(0)

  useFrame((_, delta) => {
    const g = grp.current
    if (!g) return
    const running = player.onGround && Math.abs(player.vx) > 0.1
    runT.current += delta
    // leichtes Hüpfen beim Laufen, sanftes Wippen im Stand
    const bob = running ? Math.abs(Math.sin(runT.current * 11)) * 0.12 : Math.sin(runT.current * 2) * 0.03
    g.position.y = bob
    g.scale.x = player.facing
  })

  return (
    <group ref={grp}>
      <mesh position={[0, H / 2, 0.4]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.3} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}
