import { useMemo } from 'react'
import { Instances, Instance, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import type { StageLook } from '../world/stage'

// Gemalte Dorfhäuser als Billboards — ersetzt die alten Box-Häuser (`render/Houses.tsx`).
//
// Häuser stehen weiter hinten als die Bäume und deutlich seltener: sie sollen das Dorf
// andeuten, nicht die Sicht auf den gemalten Hintergrund verstellen. Anders als Bäume
// wiegen sie sich nicht — ein wackelndes Haus wäre albern.

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

interface HouseInst {
  x: number
  z: number
  h: number
  shade: number
  flip: boolean
}

// Bewusst nur zwei dünn besetzte Bänder — ein Haus alle ~45 Einheiten.
const BANDS = [
  { z: -16, step: 46, h: [6.5, 8], shade: 0.95 },
  { z: -26, step: 58, h: [5.5, 7], shade: 0.86 },
]

function useHouses(minX: number, maxX: number, count: number): HouseInst[][] {
  return useMemo(() => {
    const r = rand(70707)
    const out: HouseInst[][] = Array.from({ length: count }, () => [])
    for (const b of BANDS) {
      for (let x = minX + 8; x <= maxX; x += b.step) {
        out[(r() * count) | 0].push({
          x: x + (r() - 0.5) * b.step * 0.5,
          z: b.z + (r() - 0.5) * 3,
          h: b.h[0] + r() * (b.h[1] - b.h[0]),
          shade: b.shade,
          flip: r() > 0.5,
        })
      }
    }
    return out
  }, [minX, maxX, count])
}

function HouseType({ url, aspect, items }: { url: string; aspect: number; items: HouseInst[] }) {
  const tex = useTexture(asset(url))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4

  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.translate(0, 0.5, 0)
    return g
  }, [])

  if (items.length === 0) return null

  return (
    <Instances limit={items.length} geometry={geo}>
      <meshBasicMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} toneMapped={false} fog />
      {items.map((it, i) => (
        <Instance
          key={i}
          position={[it.x, 0, it.z]}
          scale={[it.h * aspect * (it.flip ? -1 : 1), it.h, 1]}
          color={new THREE.Color(it.shade, it.shade, it.shade)}
        />
      ))}
    </Instances>
  )
}

export function HouseBillboards({ minX, maxX, look }: { minX: number; maxX: number; look: StageLook }) {
  const houses = useHouses(minX, maxX, look.houseArt.length)
  return (
    <>
      {look.houseArt.map((h, i) => (
        <HouseType key={h.url} url={h.url} aspect={h.aspect} items={houses[i] ?? []} />
      ))}
    </>
  )
}
