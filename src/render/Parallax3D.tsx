import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'

// Gemalter Hintergrund als Parallax-Ebene (Nutzer-Artwork, Seitenansicht).
// Die Ebene folgt der Kamera nur teilweise (factor < 1) → sie „bleibt zurück" und wirkt
// dadurch weit entfernt. Bewusst UNBELEUCHTET (das Licht ist im Bild gemalt) und OHNE
// Nebel — sonst würde der Nebel das Artwork zuwaschen.

interface Props {
  url: string
  z?: number // Tiefe hinter dem Spielfeld
  height?: number // Welt-Höhe der Ebene; Breite folgt aus dem Bild-Seitenverhältnis
  y?: number // Mittelpunkt-Höhe: so gewählt, dass der gemalte Horizont am 3D-Horizont sitzt
  factor?: number // 1 = klebt an der Kamera, 0 = steht fest in der Welt
}

export function Backdrop({ url, z = -110, height = 115, y = 10, factor = 0.85 }: Props) {
  const tex = useTexture(asset(url))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping

  const img = tex.image as { width: number; height: number } | undefined
  const aspect = img && img.height ? img.width / img.height : 2.5

  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ camera }) => {
    if (ref.current) ref.current.position.x = camera.position.x * factor
  })

  // WICHTIG: normales, undurchsichtiges Mesh mit Tiefe. Mit depthWrite={false} +
  // negativer renderOrder würde der <Sky>-Dome anschließend darüber malen.
  return (
    <mesh ref={ref} position={[0, y, z]}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
    </mesh>
  )
}
