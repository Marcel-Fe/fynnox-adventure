import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'

// Fynnox als animiertes 2,5D-Sprite in der 3D-Welt. Alle Posen stammen aus EINEM
// Sprite-Sheet (public/art/fynnox/anim/fynnox_sheet.png) → garantiert derselbe Fuchs.
// Beim Laden wird das Sheet in Zellen zerschnitten und der magenta Hintergrund (#FF00FF)
// zu Transparenz gekeyt. Zustand → Frame: stehen=idle, laufen=run1..3, steigen=jump,
// fallen=fall. Solange kein Sheet existiert, dient das Referenz-Bild (side.png) als Fallback.

const SHEET = asset('art/fynnox/anim/fynnox_sheet.png')
const COLS = 3
const ROWS = 2 // Zell-Reihenfolge (Index 0..5): idle, run1, run2, run3, jump, fall
const H = 3.0
const RUN_CYCLE = [1, 2, 3, 2] // Frame-Indizes für den Laufzyklus

// Magenta-Hintergrund zu Transparenz. Fynnox-Farben (Orange r↑g~b↓, Grün g↑, Blau b↑r↓)
// treffen die Magenta-Bedingung (r↑ UND b↑ UND g↓) nicht → bleiben erhalten.
function keyMagenta(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (r > 135 && b > 135 && g < 120) {
      data[i + 3] = 0
    }
  }
}

function sliceSheet(img: HTMLImageElement): { frames: THREE.CanvasTexture[]; aspect: number } {
  const cw = Math.floor(img.width / COLS)
  const ch = Math.floor(img.height / ROWS)
  const frames: THREE.CanvasTexture[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cv = document.createElement('canvas')
      cv.width = cw
      cv.height = ch
      const ctx = cv.getContext('2d')!
      ctx.drawImage(img, c * cw, r * ch, cw, ch, 0, 0, cw, ch)
      const id = ctx.getImageData(0, 0, cw, ch)
      keyMagenta(id.data)
      ctx.putImageData(id, 0, 0)
      const t = new THREE.CanvasTexture(cv)
      t.colorSpace = THREE.SRGBColorSpace
      t.magFilter = THREE.LinearFilter
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.generateMipmaps = true
      t.anisotropy = 8
      frames.push(t)
    }
  }
  return { frames, aspect: cw / ch }
}

function AnimatedFynnox({ frames, aspect }: { frames: THREE.CanvasTexture[]; aspect: number }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const grp = useRef<THREE.Group>(null)
  const runT = useRef(0)
  const W = H * aspect

  useFrame((_, delta) => {
    const m = mat.current
    const g = grp.current
    if (!m || !g) return
    let idx: number
    if (!player.onGround) {
      idx = player.vy > 0 ? 4 : 5
    } else if (Math.abs(player.vx) > 0.1) {
      runT.current += delta * (6 + Math.abs(player.vx) * 0.6)
      idx = RUN_CYCLE[Math.floor(runT.current) % RUN_CYCLE.length]
    } else {
      runT.current = 0
      idx = 0
    }
    const tex = frames[idx] ?? frames[0]
    if (m.map !== tex) m.map = tex
    g.scale.x = player.facing
  })

  return (
    <group ref={grp}>
      <mesh position={[0, H / 2, 0.4]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial ref={mat} map={frames[0]} transparent alphaTest={0.35} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

// Fallback: Referenz-Bild als Billboard, bis das Sprite-Sheet vorliegt.
function BillboardFynnox() {
  const tex = useTexture(asset('art/fynnox/side.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const img = tex.image as HTMLImageElement | undefined
  const aspect = img && img.width ? img.width / img.height : 0.68
  const grp = useRef<THREE.Group>(null)
  const t = useRef(0)
  const W = H * aspect * 0.97
  useFrame((_, delta) => {
    const g = grp.current
    if (!g) return
    const running = player.onGround && Math.abs(player.vx) > 0.1
    t.current += delta
    g.position.y = running ? Math.abs(Math.sin(t.current * 11)) * 0.12 : Math.sin(t.current * 2) * 0.03
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

export function Fynnox() {
  const [sheet, setSheet] = useState<{ frames: THREE.CanvasTexture[]; aspect: number } | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => setSheet(sliceSheet(img))
    img.onerror = () => setFailed(true)
    img.src = SHEET
    return () => { img.onload = null; img.onerror = null }
  }, [])

  if (sheet) return <AnimatedFynnox frames={sheet.frames} aspect={sheet.aspect} />
  if (failed) return <BillboardFynnox />
  return null // kurz während des Ladeversuchs
}
