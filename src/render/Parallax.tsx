import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { makeForestParallax } from './paint'

// Gemalter Parallax-Hintergrund (ersetzt den 3D-Wald). Eine Gruppe folgt der Kamera
// in X (Layer bleiben bildfüllend); die Tiefe/Bewegung entsteht rein über den
// horizontalen Textur-Offset je Ebene (Himmel scrollt kaum, Vordergrund schnell).
// Kein Licht nötig — MeshBasic („vorbeleuchtet").

interface LayerCfg {
  key: 'sky' | 'far' | 'mid' | 'near'
  z: number
  factor: number // Scroll-Anteil relativ zur Kamera
  tileWorld: number // Weltbreite, die einer Texturkachel entspricht (Motiv-Größe)
  band: number | null // feste Welthöhe des Baum-Bands (null = bildschirmfüllend, Himmel)
  bottomY: number // Welt-y der Unterkante des Bands
}

const LAYERS: LayerCfg[] = [
  { key: 'sky', z: -120, factor: 0.05, tileWorld: 260, band: null, bottomY: 0 },
  { key: 'far', z: -60, factor: 0.2, tileWorld: 30, band: 15, bottomY: 1.2 },
  { key: 'mid', z: -34, factor: 0.45, tileWorld: 24, band: 18, bottomY: -1 },
  { key: 'near', z: -15, factor: 0.82, tileWorld: 18, band: 22, bottomY: -3 },
]

export function Parallax() {
  const group = useRef<THREE.Group>(null)
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([])
  const { camera, size } = useThree()
  const tex = useMemo(() => makeForestParallax(), [])

  // Sichtbare Quad-Größe je Layer aus fov/aspect (Blick ~entlang -Z; Neigung klein).
  const geo = useMemo(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / Math.max(1, size.height)
    const vFov = (cam.fov * Math.PI) / 180
    return LAYERS.map((l) => {
      const dist = cam.position.z - l.z
      const visH = 2 * Math.tan(vFov / 2) * dist
      const w = visH * aspect * 1.25
      // Himmel: bildschirmfüllend, auf Blickhöhe zentriert. Baum-Bänder: feste Welthöhe,
      // Unterkante bei bottomY → stehen wie eine Kulisse auf/über dem Boden.
      const h = l.band ?? visH * 1.1
      const centerY = l.band ? l.bottomY + l.band / 2 : 3
      const t = tex[l.key]
      t.repeat.x = w / l.tileWorld
      return { w, h, centerY }
    })
  }, [camera, size.width, size.height, tex])

  useFrame(() => {
    const g = group.current
    if (!g) return
    g.position.x = camera.position.x
    for (let i = 0; i < LAYERS.length; i++) {
      const m = mats.current[i]
      if (!m || !m.map) continue
      m.map.offset.x = (camera.position.x * LAYERS[i].factor) / LAYERS[i].tileWorld
    }
  })

  return (
    <group ref={group}>
      {LAYERS.map((l, i) => (
        <mesh key={l.key} position={[0, geo[i].centerY, l.z]}>
          <planeGeometry args={[geo[i].w, geo[i].h]} />
          <meshBasicMaterial
            ref={(el) => { mats.current[i] = el }}
            map={tex[l.key]}
            transparent={l.key !== 'sky'}
            depthWrite={false}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      ))}
    </group>
  )
}
