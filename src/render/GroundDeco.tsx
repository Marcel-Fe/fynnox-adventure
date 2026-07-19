import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from '../game/playerState'
import type { DecoItem } from '../world/stage'

// Gemalte Boden-Deko (Nutzer-Artwork) statt Kegeln und Dodekaedern.
// Gleiches Prinzip wie TreeBillboards: feststehende Flächen mit Normale +Z, weil die
// Seitenkamera sich nie dreht. Ein Instances-Block je Objekttyp.

// Welche Objekte eine Welt verwendet, steht in `world/stage.ts` (`StageLook.deco`) —
// der Wald nutzt Gras/Blumen/Pilze, die Küste nur Felsen und Treibholz.
type DecoType = DecoItem

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

interface Placed {
  x: number
  z: number
  h: number
  phase: number
  flip: boolean
  shade: number
}

// Deko-Bänder rund um die Spielachse. Die Achse selbst (z ≈ 0) bleibt frei, damit
// nichts vor Fynnox steht.
const BANDS = [
  { z: 3.2, spread: 2.2, step: 2.6, scale: 1.05 },
  { z: -3.4, spread: 2.6, step: 2.4, scale: 1.0 },
  { z: -8.5, spread: 3.2, step: 3.0, scale: 0.92 },
]

function usePlacement(minX: number, maxX: number, types: DecoType[]): Placed[][] {
  return useMemo(() => {
    const r = rand(4242)
    const total = types.reduce((a, t) => a + t.weight, 0)
    const out: Placed[][] = types.map(() => [])
    for (const b of BANDS) {
      for (let x = minX - 12; x <= maxX + 12; x += b.step) {
        // gewichtete Typ-Wahl
        let roll = r() * total
        let ti = 0
        while (ti < types.length - 1 && roll > types[ti].weight) {
          roll -= types[ti].weight
          ti++
        }
        const t = types[ti]
        out[ti].push({
          x: x + (r() - 0.5) * b.step,
          z: b.z + (r() - 0.5) * b.spread,
          h: t.h * b.scale * (0.82 + r() * 0.36),
          phase: r() * Math.PI * 2,
          flip: r() > 0.5,
          shade: 0.93 + r() * 0.07,
        })
      }
    }
    return out
  }, [minX, maxX, types])
}

function DecoType({ type, items }: { type: DecoType; items: Placed[] }) {
  const tex = useTexture(asset(`art/deco/${type.name}.webp`))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.translate(0, 0.5, 0) // Ursprung an den Fuß → Neigung dreht um den Boden-Kontaktpunkt
    return g
  }, [])

  const refs = useRef<(THREE.Object3D | null)[]>([])
  useFrame(({ clock }) => {
    if (!type.sway) return
    const t = clock.elapsedTime
    for (let i = 0; i < items.length; i++) {
      const o = refs.current[i]
      if (!o) continue
      const it = items[i]
      const wind = Math.sin(t * 1.9 + it.phase) * 0.08
      // Fynnox drückt nahes Gras zur Seite (Referenz-Sheet: „Blumen reagieren")
      const dx = player.x - it.x
      const dist = Math.abs(dx)
      const near = Math.abs(it.z) < 4.5 && dist < 1.9
      const push = near ? -Math.sign(dx) * 0.7 * (1 - dist / 1.9) : 0
      o.rotation.z = wind + push
    }
  })

  if (items.length === 0) return null

  return (
    <Instances limit={items.length} geometry={geo}>
      <meshBasicMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} toneMapped={false} fog />
      {items.map((it, i) => (
        <Instance
          key={i}
          ref={(el: THREE.Object3D | null) => { refs.current[i] = el }}
          position={[it.x, 0, it.z]}
          scale={[it.h * type.aspect * (it.flip ? -1 : 1), it.h, 1]}
          color={new THREE.Color(it.shade, it.shade, it.shade)}
        />
      ))}
    </Instances>
  )
}

export function GroundDeco({ minX, maxX, types }: { minX: number; maxX: number; types: DecoType[] }) {
  const placed = usePlacement(minX, maxX, types)
  return (
    <>
      {types.map((t, i) => (
        <DecoType key={t.name} type={t} items={placed[i] ?? []} />
      ))}
    </>
  )
}
