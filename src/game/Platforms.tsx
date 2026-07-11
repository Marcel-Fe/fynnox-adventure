import { useMemo } from 'react'
import * as THREE from 'three'
import type { Platform } from './physics'
import { makePlatformTexture } from '../render/paint'

// Gemalte Gras-Plattformen (flache Sprites statt 3D-Boxen). Gras-Oberkante sitzt genau
// auf der Steh-Linie (f.y+f.h); darunter hängt ein Erdkörper. Textur horizontal gekachelt.
const TILE_WORLD = 2.2 // Weltbreite je Textur-Kachel
const HANG = 1.4 // wie weit der Erdkörper unter die Plattform reicht

export function Platforms({ platforms }: { platforms: Platform[] }) {
  const base = useMemo(() => makePlatformTexture(), [])
  const items = useMemo(
    () =>
      platforms.map((f) => {
        const tex = base.clone()
        tex.needsUpdate = true
        tex.wrapS = THREE.RepeatWrapping
        tex.repeat.x = Math.max(1, f.w / TILE_WORLD)
        const visH = f.h + HANG
        const top = f.y + f.h
        return { tex, w: f.w, h: visH, cx: f.x + f.w / 2, cy: top - visH / 2 }
      }),
    [platforms, base],
  )

  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} position={[it.cx, it.cy, 0]}>
          <planeGeometry args={[it.w, it.h]} />
          <meshBasicMaterial map={it.tex} transparent alphaTest={0.2} toneMapped={false} fog={false} />
        </mesh>
      ))}
    </>
  )
}
