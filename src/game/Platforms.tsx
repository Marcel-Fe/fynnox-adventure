import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { makeGrassTexture } from '../render/paint'
import type { Platform } from './physics'

// Plattformen mit gemalter Erd-/Grasnarbe-Kachel (Nutzer-Artwork).
//
// Vorher: zwei RoundedBoxes in Volltonfarben. Neben den gemalten Bäumen und der
// gemalten Boden-Deko waren sie das einzige Element, das noch wie Plastik wirkte.
//
// Zwei Details, die den Unterschied machen:
// 1. Die sichtbare Box reicht jetzt UM `OVERHANG` TIEFER als die Kollisionsbox, endet
//    oben aber exakt auf der Steh-Linie (f.y + f.h). Dadurch wirkt die Plattform wie
//    ein dickes Erdstück — und Fynnox steht sauber obenauf statt bis zu den Knien im
//    Gras zu versinken, wie es der überstehende Grasdeckel vorher verursacht hat.
// 2. Die Kachel wird nach BREITE wiederholt (repeat.x = Breite / Höhe), nicht gestreckt.
//    Sonst wären Erdklumpen auf einer 4 Einheiten breiten Plattform lang gezogen.

const DEPTH = 3.2
const OVERHANG = 0.5 // wie weit der Erdkörper unter die Steh-Linie reicht

export function Platforms({ platforms }: { platforms: Platform[] }) {
  const tile = useTexture(asset('art/deco/platform_dirt.webp'))

  // Je Plattform-Maß eine eigene Textur-Instanz: `repeat` hängt am Textur-Objekt, nicht
  // am Material. Klone teilen das Bild im Speicher, kosten also kaum etwas.
  const sideTex = useMemo(() => {
    const m = new Map<string, THREE.Texture>()
    for (const f of platforms) {
      const key = `${f.w}:${f.h}`
      if (m.has(key)) continue
      const t = tile.clone()
      t.needsUpdate = true
      t.wrapS = THREE.RepeatWrapping
      t.wrapT = THREE.ClampToEdgeWrapping
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      t.repeat.set(Math.max(1, Math.round(f.w / (f.h + OVERHANG))), 1)
      m.set(key, t)
    }
    return m
  }, [tile, platforms])

  // Oberseite: Draufsicht auf Gras. Die Seitenkachel taugt dafür nicht — sie zeigt
  // Grashalme von der Seite.
  const topTex = useMemo(() => {
    const t = makeGrassTexture()
    t.repeat.set(4, 3)
    t.anisotropy = 4
    return t
  }, [])

  return (
    <>
      {platforms.map((f, i) => {
        const visH = f.h + OVERHANG
        const side = sideTex.get(`${f.w}:${f.h}`)
        return (
          <mesh
            key={i}
            position={[f.x + f.w / 2, f.y + f.h - visH / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[f.w, visH, DEPTH]} />
            {/* Reihenfolge der BoxGeometry-Gruppen: +x, -x, +y, -y, +z, -z */}
            <meshStandardMaterial attach="material-0" map={side} roughness={0.92} />
            <meshStandardMaterial attach="material-1" map={side} roughness={0.92} />
            <meshStandardMaterial attach="material-2" map={topTex} color="#b6e86a" roughness={0.85} />
            <meshStandardMaterial attach="material-3" color="#5d3f22" roughness={0.95} />
            <meshStandardMaterial attach="material-4" map={side} roughness={0.92} />
            <meshStandardMaterial attach="material-5" map={side} roughness={0.92} />
          </mesh>
        )
      })}
    </>
  )
}
