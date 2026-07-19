import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from '../game/playerState'

// Gemalte Boden-Deko (Nutzer-Artwork) statt Kegeln und Dodekaedern.
// Gleiches Prinzip wie TreeBillboards: feststehende Flächen mit Normale +Z, weil die
// Seitenkamera sich nie dreht. Ein Instances-Block je Objekttyp.

interface DecoType {
  name: string
  aspect: number // Breite / Höhe des freigestellten Artworks
  h: number // Welt-Höhe (Fynnox ist 2,6 hoch)
  weight: number // relative Häufigkeit
  sway: boolean // weiches Zeug wiegt sich im Wind und weicht Fynnox aus
}

// Höhen bewusst von Hand gesetzt (nicht aus der Blatt-Größe abgeleitet): auf dem Blatt
// sind alle Objekte etwa gleich groß gemalt, im Spiel müssen Pilze aber deutlich kleiner
// sein als ein Felsblock.
const TYPES: DecoType[] = [
  { name: 'grass', aspect: 1.0955, h: 1.0, weight: 0.3, sway: true },
  { name: 'flowers', aspect: 0.6193, h: 0.85, weight: 0.16, sway: true },
  { name: 'pebble', aspect: 1.4605, h: 0.42, weight: 0.13, sway: false },
  { name: 'rock_mid', aspect: 1.3289, h: 0.95, weight: 0.1, sway: false },
  { name: 'stones', aspect: 1.9009, h: 0.55, weight: 0.1, sway: false },
  { name: 'mushrooms', aspect: 0.8883, h: 0.7, weight: 0.09, sway: true },
  { name: 'rock_big', aspect: 1.1557, h: 1.7, weight: 0.06, sway: false },
  { name: 'log', aspect: 1.8626, h: 1.0, weight: 0.06, sway: false },
]

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

function usePlacement(minX: number, maxX: number): Placed[][] {
  return useMemo(() => {
    const r = rand(4242)
    const total = TYPES.reduce((a, t) => a + t.weight, 0)
    const out: Placed[][] = TYPES.map(() => [])
    for (const b of BANDS) {
      for (let x = minX - 12; x <= maxX + 12; x += b.step) {
        // gewichtete Typ-Wahl
        let roll = r() * total
        let ti = 0
        while (ti < TYPES.length - 1 && roll > TYPES[ti].weight) {
          roll -= TYPES[ti].weight
          ti++
        }
        const t = TYPES[ti]
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
  }, [minX, maxX])
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

export function GroundDeco({ minX, maxX }: { minX: number; maxX: number }) {
  const placed = usePlacement(minX, maxX)
  return (
    <>
      {TYPES.map((t, i) => (
        <DecoType key={t.name} type={t} items={placed[i] ?? []} />
      ))}
    </>
  )
}
