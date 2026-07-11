import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'

// Fynnox als animiertes 2,5D-Sprite in der 3D-Welt. Alle Posen stammen aus EINEM
// Sprite-Sheet (public/art/fynnox/anim/fynnox_sheet.png, 3×2, Seitenansicht nach rechts)
// → garantiert derselbe Fuchs. Beim Laden wird jede Zelle vom magenta Hintergrund
// freigestellt (weicher Key + Despill), auf die Figur zugeschnitten und über eine
// gemeinsame Pixel→Welt-Skala einheitlich gemacht (Füße am Boden). Zustand → Frame:
// stehen=0, laufen=1..3, steigen=4, fallen=5. Fallback: Referenz-Bild (side.png).

const SHEET = asset('art/fynnox/anim/fynnox_sheet.png')
const COLS = 3
const ROWS = 2
const TARGET_H = 2.7 // Welt-Höhe der Steh-Pose (übrige Posen relativ dazu)
const RUN_CYCLE = [1, 2, 3, 2]

interface Frame {
  tex: THREE.CanvasTexture
  wPx: number
  hPx: number
}

// Weicher Magenta-Key (#FF00FF): „magenta-ness" m = min(r,b) - g. Fynnox-Farben (Orange,
// Grün, Blau, Braun, Weiß) haben kleines/negatives m → bleiben; nur der Hintergrund geht
// weg. Randpixel werden teiltransparent + entfärbt (Despill) → keine rosa Kante.
function keyMagenta(d: Uint8ClampedArray) {
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const m = Math.min(r, b) - g
    if (m >= 100) {
      d[i + 3] = 0
    } else if (m > 30) {
      const t = (m - 30) / 70
      d[i + 3] = Math.min(d[i + 3], Math.round(255 * (1 - t)))
      d[i] = Math.round(r - (r - g) * t) // Rot/Blau Richtung Grün → Rosa-Stich raus
      d[i + 2] = Math.round(b - (b - g) * t)
    }
  }
}

function bbox(d: Uint8ClampedArray, w: number, h: number) {
  let x0 = w, y0 = h, x1 = 0, y1 = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 30) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < x0) return { x0: 0, y0: 0, x1: w - 1, y1: h - 1 }
  return { x0, y0, x1, y1 }
}

function sliceSheet(img: HTMLImageElement): Frame[] {
  const cw = Math.floor(img.width / COLS)
  const ch = Math.floor(img.height / ROWS)
  const frames: Frame[] = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('canvas')
      cell.width = cw
      cell.height = ch
      const cx = cell.getContext('2d')!
      cx.drawImage(img, c * cw, r * ch, cw, ch, 0, 0, cw, ch)
      const id = cx.getImageData(0, 0, cw, ch)
      keyMagenta(id.data)
      const bb = bbox(id.data, cw, ch)
      cx.putImageData(id, 0, 0)
      // auf die Figur zuschneiden (etwas Rand für weiche Kanten)
      const pad = 4
      const bx = Math.max(0, bb.x0 - pad)
      const by = Math.max(0, bb.y0 - pad)
      const bw = Math.min(cw, bb.x1 + pad) - bx
      const bh = Math.min(ch, bb.y1 + pad) - by
      const crop = document.createElement('canvas')
      crop.width = bw
      crop.height = bh
      crop.getContext('2d')!.drawImage(cell, bx, by, bw, bh, 0, 0, bw, bh)
      const t = new THREE.CanvasTexture(crop)
      t.colorSpace = THREE.SRGBColorSpace
      t.magFilter = THREE.LinearFilter
      t.minFilter = THREE.LinearMipmapLinearFilter
      t.generateMipmaps = true
      t.anisotropy = 8
      frames.push({ tex: t, wPx: bw, hPx: bh })
    }
  }
  return frames
}

function AnimatedFynnox({ frames }: { frames: Frame[] }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null)
  const mesh = useRef<THREE.Mesh>(null)
  const runT = useRef(0)
  const wpp = TARGET_H / frames[0].hPx // gemeinsame Pixel→Welt-Skala (an Steh-Pose geeicht)

  useFrame((_, delta) => {
    const m = mat.current
    const me = mesh.current
    if (!m || !me) return
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
    const f = frames[idx] ?? frames[0]
    if (m.map !== f.tex) m.map = f.tex
    const sx = f.wPx * wpp
    const sy = f.hPx * wpp
    me.scale.set(sx * player.facing, sy, 1)
    me.position.y = sy / 2 // Füße auf den Boden (Gruppen-Ursprung)
  })

  return (
    <mesh ref={mesh} position={[0, TARGET_H / 2, 0.4]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={mat} map={frames[0].tex} transparent alphaTest={0.25} depthWrite={false} toneMapped={false} />
    </mesh>
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
  const H = 2.7
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
  const [frames, setFrames] = useState<Frame[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try { setFrames(sliceSheet(img)) } catch { setFailed(true) }
    }
    img.onerror = () => setFailed(true)
    img.src = SHEET
    return () => { img.onload = null; img.onerror = null }
  }, [])

  if (frames) return <AnimatedFynnox frames={frames} />
  if (failed) return <BillboardFynnox />
  return null
}
