import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import type { StageLook } from '../world/stage'

// Gemalte Bäume statt Geometrie.
//
// Warum Billboards und nicht mehr Polygone? Die Detailtiefe des Nutzer-Artworks
// (Blattstruktur, Rinde, Wurzeln) ist mit Kugeln und Kegeln nicht erreichbar — und
// wäre auf dem Handy auch viel zu teuer. Eine gemalte Fläche liefert sie geschenkt.
//
// Warum reichen einfache, feststehende Flächen? Die Kamera ist eine strikte
// Seitenkamera: sie folgt Fynnox nur in X und dreht sich nie. Eine Fläche mit Normale
// +Z steht damit IMMER frontal zur Kamera — echtes Billboard-Nachdrehen je Frame wäre
// verschwendete Rechenzeit. Die Tiefe entsteht über die z-Bänder und den Nebel.
//
// Alles instanciert: ein Draw-Call je Baum-Typ, egal wie viele Bäume im Level stehen.

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

// Weicher Bodenschatten. Ohne ihn scheinen die Bäume über der Wiese zu schweben —
// echte Schattenwürfe scheiden aus, weil alphaTest-Billboards im Shadow-Pass nur
// ihr Rechteck werfen würden (ein schwarzer Kasten pro Baum).
function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(0,0,0,0.5)')
  g.addColorStop(0.55, 'rgba(0,0,0,0.26)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

interface TreeInst {
  x: number
  z: number
  h: number
  phase: number
  tint: THREE.Color
  flip: boolean
}

// Tiefen-Bänder. Bewusst LOCKER besetzt (großer `step`) und erst ab z=-11:
// der gemalte Hintergrund muss zwischen den Stämmen sichtbar bleiben — vorher haben
// dichte, riesige Bäume das Artwork des Nutzers komplett zugestellt.
// `shade`: fernere Bänder werden aufgehellt und entsättigt → Luftperspektive wie im Artwork.
const BANDS = [
  { z: -11, step: 38, h: [10, 13], shade: 1.0 },
  { z: -19, step: 25, h: [8, 10.5], shade: 0.93 },
  { z: -30, step: 21, h: [6.5, 8.5], shade: 0.84 },
  { z: -44, step: 27, h: [5, 7], shade: 0.74 },
]

function useTrees(minX: number, maxX: number, count: number): TreeInst[][] {
  return useMemo(() => {
    const r = rand(1337)
    const perType: TreeInst[][] = Array.from({ length: count }, () => [])
    for (const b of BANDS) {
      for (let x = minX - 16; x <= maxX + 16; x += b.step) {
        // Aufhellen Richtung Horizont: mischt die Baumfarbe zum Dunst hin.
        const f = b.shade
        const tint = new THREE.Color(f, f * 0.99 + 0.01, f * 0.96 + 0.06)
        perType[(r() * count) | 0].push({
          x: x + (r() - 0.5) * b.step * 0.75,
          z: b.z + (r() - 0.5) * 3.5,
          h: b.h[0] + r() * (b.h[1] - b.h[0]),
          phase: r() * Math.PI * 2,
          tint,
          flip: r() > 0.5, // gespiegelt → derselbe Baum wirkt nicht wie kopiert
        })
      }
    }
    return perType
  }, [minX, maxX, count])
}

function TreeType({ url, aspect, trees }: { url: string; aspect: number; trees: TreeInst[] }) {
  const tex = useTexture(asset(url))
  tex.colorSpace = THREE.SRGBColorSpace
  tex.generateMipmaps = true
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.anisotropy = 4

  // Ursprung an den FUSS der Fläche legen. Nur so wiegt die Wind-Rotation den Baum um
  // seinen Stammansatz statt um die Kronenmitte.
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(1, 1)
    g.translate(0, 0.5, 0)
    return g
  }, [])

  const refs = useRef<(THREE.Object3D | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < trees.length; i++) {
      const o = refs.current[i]
      if (!o) continue
      const tr = trees[i]
      // Zwei überlagerte Frequenzen: langsame Böe + feines Zittern → lebendig statt Metronom.
      const gust = Math.sin(t * 0.55 + tr.phase) * 0.035
      const flutter = Math.sin(t * 2.3 + tr.phase * 2) * 0.009
      o.rotation.z = gust + flutter
    }
  })

  if (trees.length === 0) return null

  return (
    <Instances limit={trees.length} geometry={geo} castShadow>
      {/* Unbeleuchtet: das Licht ist im Artwork gemalt. `fog` bleibt AN, damit die
          fernen Bänder im Dunst verschwinden. alphaTest statt Alpha-Blending →
          korrekte Tiefensortierung, wenn sich Kronen überlappen. */}
      <meshBasicMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} toneMapped={false} fog />
      {trees.map((tr, i) => (
        <Instance
          key={i}
          ref={(el: THREE.Object3D | null) => { refs.current[i] = el }}
          position={[tr.x, 0, tr.z]}
          scale={[tr.h * aspect * (tr.flip ? -1 : 1), tr.h, 1]}
          color={tr.tint}
        />
      ))}
    </Instances>
  )
}

// Alle Baumschatten in einem Draw-Call, unabhängig vom Baum-Typ.
function TreeShadows({ trees }: { trees: TreeInst[] }) {
  const tex = useMemo(() => makeShadowTexture(), [])
  if (trees.length === 0) return null
  return (
    <Instances limit={trees.length}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} fog />
      {trees.map((tr, i) => (
        <Instance
          key={i}
          position={[tr.x, 0.03, tr.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          // breit und flach gedrückt — die Sonne steht hoch und seitlich
          scale={[tr.h * 0.85, tr.h * 0.42, 1]}
        />
      ))}
    </Instances>
  )
}

export function TreeBillboards({ minX, maxX, look }: { minX: number; maxX: number; look: StageLook }) {
  const trees = useTrees(minX, maxX, look.treeArt.length)
  const all = useMemo(() => trees.flat(), [trees])
  return (
    <>
      <TreeShadows trees={all} />
      {look.treeArt.map((t, i) => (
        <TreeType key={t.url} url={t.url} aspect={t.aspect} trees={trees[i] ?? []} />
      ))}
    </>
  )
}
