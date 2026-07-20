import { useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { makeGrassTexture, makeSandTexture } from '../render/paint'
import type { StageLook } from '../world/stage'
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

export function Platforms({ platforms, look }: { platforms: Platform[]; look: StageLook }) {
  // Kachel und Deckfarbe kommen aus dem Welt-Look: Wald = Erde mit Grasnarbe,
  // Küste = Sand. Vorher war beides fest verdrahtet — am Strand lag dadurch eine
  // grüne Grasnarbe mitten in der Bucht.
  const tile = useTexture(asset(look.platformTile))

  // Je Plattform-Maß eine eigene Textur-Instanz: `repeat` hängt am Textur-Objekt, nicht
  // am Material. Klone teilen das Bild im Speicher, kosten also kaum etwas.
  // Seite UND Deck entstehen zusammen, damit die Bohlen auf beiden Flächen gleich groß
  // sind — sonst sieht man der Plattform an, dass sie aus zwei Materialien besteht.
  const tex = useMemo(() => {
    const m = new Map<string, { side: THREE.Texture; top: THREE.Texture | null }>()
    for (const f of platforms) {
      const key = `${f.w}:${f.h}`
      if (m.has(key)) continue
      const visH = f.h + OVERHANG
      // `platformTileWorld` = Kantenlänge einer Kachel in Welt-Einheiten. 0 heißt
      // „Kachel füllt die Plattform-Höhe genau einmal" (Wald: die Grasnarbe MUSS oben
      // sitzen, deshalb dort exakt eine Lage und ClampToEdge).
      const tw = look.platformTileWorld || visH
      const prep = (t: THREE.Texture, rx: number, ry: number, clampY: boolean) => {
        t.needsUpdate = true
        t.wrapS = THREE.RepeatWrapping
        t.wrapT = clampY ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping
        t.colorSpace = THREE.SRGBColorSpace
        t.anisotropy = 8
        t.repeat.set(rx, ry)
        return t
      }
      const side = prep(tile.clone(), Math.max(1, Math.round(f.w / tw)), visH / tw, tw === visH)
      const top =
        look.platformTopMap === 'tile'
          ? prep(tile.clone(), Math.max(1, Math.round(f.w / tw)), DEPTH / tw, false)
          : null
      m.set(key, { side, top })
    }
    return m
  }, [tile, platforms, look.platformTileWorld, look.platformTopMap])

  // Oberseite bei Gras/Sand: prozedurale Draufsicht. Die Seitenkachel taugt dafür nicht —
  // sie zeigt Halme bzw. die Erdschicht von der Seite. Beim Holzsteg dagegen IST das Deck
  // aus denselben Bohlen; dort kommt die Kachel oben aus `tex` (Größe passend zur Seite).
  const topTex = useMemo(() => {
    if (look.platformTopMap === 'tile') return null
    const t = look.platformTopMap === 'sand' ? makeSandTexture() : makeGrassTexture()
    t.repeat.set(4, 3)
    t.anisotropy = 4
    return t
  }, [look.platformTopMap])

  return (
    <>
      {platforms.map((f, i) => {
        const visH = f.h + OVERHANG
        const t = tex.get(`${f.w}:${f.h}`)
        const side = t?.side
        const top = t?.top ?? topTex
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
            <meshStandardMaterial attach="material-2" map={top} color={look.platformTop} roughness={0.85} />
            <meshStandardMaterial attach="material-3" color="#5d3f22" roughness={0.95} />
            <meshStandardMaterial attach="material-4" map={side} roughness={0.92} />
            <meshStandardMaterial attach="material-5" map={side} roughness={0.92} />
          </mesh>
        )
      })}
    </>
  )
}
