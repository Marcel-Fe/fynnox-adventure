import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { makeGrassTexture, makeSandTexture } from '../render/paint'
import type { StageLook } from '../world/stage'
import { player } from './playerState'
import type { Platform } from './physics'
import { stepMovers } from './movers'
import type { MoverDef } from './level'

// Bewegliche Plattformen — ohne jeden Eingriff in die Physik.
//
// Wie es funktioniert: `buildMovers` erzeugt aus den Definitionen echte `Platform`-
// Objekte. Genau DIESE Objekte landen im Array, das `stepPlayer` bekommt. Ihr x/y wird
// je Frame mutiert; weil `stepPlayer` die Werte live liest, trägt die bestehende
// Landungsprüfung die Plattform automatisch mit.
//
// WICHTIG ist die Reihenfolge: dieses useFrame läuft mit Priorität -2, also VOR dem
// Physik-Schritt des Spielers (Priorität 0). Sonst würde der Spieler eine Plattform
// sehen, die erst danach wegfährt — er würde durchfallen.
//
// Die Rechnung selbst (Pendel + Mitnahme) steht in `movers.ts` — dort ohne three und
// deshalb in Node prüfbar (`scripts/test-movers.mjs`). Hier bleibt nur die Darstellung.

const DEPTH = 2.6
const OVERHANG = 0.45 // wie bei den festen Plattformen: Erdkörper reicht unter die Steh-Linie

export function MovingPlatforms({ defs, live, look }: { defs: MoverDef[]; live: Platform[]; look: StageLook }) {
  const groups = useRef<(THREE.Group | null)[]>([])

  // Gleiches Material wie die festen Plattformen der Welt — sonst fällt der Mover als
  // einziges Fremdkörper-Objekt aus dem Bild. Erkennbar bleibt er durch seine
  // Bewegung und die Metallbeschläge an den Enden.
  const tile = useTexture(asset(look.platformTile))
  // Wie bei den festen Plattformen: Seite und Deck zusammen, damit die Bohlen auf beiden
  // Flächen gleich groß sind. `platformTileWorld` = Kantenlänge einer Kachel in Welt-
  // Einheiten; 0 = Wald-Verhalten (Kachel füllt die Höhe genau einmal, Grasnarbe oben).
  const tex = useMemo(() => {
    const m = new Map<string, { side: THREE.Texture; top: THREE.Texture | null }>()
    for (const d of defs) {
      const key = `${d.w}:${d.h}`
      if (m.has(key)) continue
      const visH = d.h + OVERHANG
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
      const side = prep(tile.clone(), Math.max(1, Math.round(d.w / tw)), visH / tw, tw === visH)
      const top =
        look.platformTopMap === 'tile'
          ? prep(tile.clone(), Math.max(1, Math.round(d.w / tw)), DEPTH / tw, false)
          : null
      m.set(key, { side, top })
    }
    return m
  }, [tile, defs, look.platformTileWorld, look.platformTopMap])

  const topTex = useMemo(() => {
    if (look.platformTopMap === 'tile') return null
    const t = look.platformTopMap === 'sand' ? makeSandTexture() : makeGrassTexture()
    t.repeat.set(3, 2)
    t.anisotropy = 4
    return t
  }, [look.platformTopMap])

  useFrame(({ clock }) => {
    // Pendel-Bewegung + Spieler mittragen (geprüft in scripts/test-movers.mjs)
    stepMovers(defs, live, player, clock.elapsedTime)
    // Darstellung nachziehen: Gruppen-Ursprung sitzt auf der Steh-Linie.
    for (let i = 0; i < defs.length; i++) {
      const p = live[i]
      const g = groups.current[i]
      if (p && g) g.position.set(p.x + p.w / 2, p.y + p.h, 0)
    }
  }, -2)

  return (
    <>
      {defs.map((d, i) => {
        const visH = d.h + OVERHANG
        const t = tex.get(`${d.w}:${d.h}`)
        const side = t?.side
        const top = t?.top ?? topTex
        return (
          // Gruppen-Ursprung sitzt auf der STEH-LINIE, der Körper hängt darunter —
          // so kann das useFrame oben einfach die Oberkante setzen.
          <group
            key={i}
            ref={(el) => { groups.current[i] = el }}
            position={[live[i]?.x + d.w / 2, live[i]?.y + d.h, 0]}
          >
            <mesh position={[0, -visH / 2, 0]} castShadow receiveShadow>
              <boxGeometry args={[d.w, visH, DEPTH]} />
              <meshStandardMaterial attach="material-0" map={side} roughness={0.92} />
              <meshStandardMaterial attach="material-1" map={side} roughness={0.92} />
              <meshStandardMaterial attach="material-2" map={top} color={look.platformTop} roughness={0.85} />
              <meshStandardMaterial attach="material-3" color="#5d3f22" roughness={0.95} />
              <meshStandardMaterial attach="material-4" map={side} roughness={0.92} />
              <meshStandardMaterial attach="material-5" map={side} roughness={0.92} />
            </mesh>
            {/* Messing-Beschläge an den Enden: der einzige sichtbare Unterschied zu einer
                festen Plattform — sie signalisieren „dieses Stück ist beweglich". */}
            {[-1, 1].map((s) => (
              <mesh key={s} position={[(s * d.w) / 2 - s * 0.16, -visH / 2, DEPTH / 2 + 0.03]}>
                <boxGeometry args={[0.16, visH * 0.8, 0.08]} />
                <meshStandardMaterial color="#d9a441" roughness={0.45} metalness={0.5} envMapIntensity={1.3} />
              </mesh>
            ))}
          </group>
        )
      })}
    </>
  )
}
