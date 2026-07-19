import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { makeGrassTexture } from '../render/paint'
import { player } from './playerState'
import { PW, type Platform } from './physics'
import type { MoverDef } from './level'

// Bewegliche Plattformen — ohne jeden Eingriff in die Physik.
//
// Wie es funktioniert: `buildMovers` erzeugt aus den Definitionen echte `Platform`-
// Objekte. Genau DIESE Objekte landen im Array, das `stepPlayer` bekommt. Hier wird
// ihr x/y je Frame mutiert; weil `stepPlayer` die Werte live liest, trägt die
// bestehende Landungsprüfung die Plattform automatisch mit.
//
// WICHTIG ist die Reihenfolge: dieses useFrame läuft mit Priorität -2, also VOR dem
// Physik-Schritt des Spielers (Priorität 0). Sonst würde der Spieler eine Plattform
// sehen, die erst danach wegfährt — er würde durchfallen.

const DEPTH = 2.6
const OVERHANG = 0.45 // wie bei den festen Plattformen: Erdkörper reicht unter die Steh-Linie

// Weltposition eines Movers zum Zeitpunkt t.
function offsetAt(d: MoverDef, t: number): number {
  return Math.sin(t * d.speed + (d.phase ?? 0)) * d.range
}

// Erzeugt die lebenden Plattform-Objekte (Startposition = Position bei t = 0,
// damit im ersten Frame nichts springt).
export function buildMovers(defs: MoverDef[]): Platform[] {
  return defs.map((d) => {
    const off = offsetAt(d, 0)
    return { x: d.x + (d.axis === 'x' ? off : 0), y: d.y + (d.axis === 'y' ? off : 0), w: d.w, h: d.h }
  })
}

export function MovingPlatforms({ defs, live }: { defs: MoverDef[]; live: Platform[] }) {
  const groups = useRef<(THREE.Group | null)[]>([])

  // Gleiche gemalte Kachel wie die festen Plattformen — sonst fällt der Mover als
  // einziges Volltonfarben-Objekt aus dem Bild. Erkennbar bleibt er durch seine
  // Bewegung und die Metallbeschläge an den Enden.
  const tile = useTexture(asset('art/deco/platform_dirt.webp'))
  const sideTex = useMemo(() => {
    const m = new Map<string, THREE.Texture>()
    for (const d of defs) {
      const key = `${d.w}:${d.h}`
      if (m.has(key)) continue
      const t = tile.clone()
      t.needsUpdate = true
      t.wrapS = THREE.RepeatWrapping
      t.wrapT = THREE.ClampToEdgeWrapping
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 4
      t.repeat.set(Math.max(1, Math.round(d.w / (d.h + OVERHANG))), 1)
      m.set(key, t)
    }
    return m
  }, [tile, defs])

  const topTex = useMemo(() => {
    const t = makeGrassTexture()
    t.repeat.set(3, 2)
    t.anisotropy = 4
    return t
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < defs.length; i++) {
      const d = defs[i]
      const p = live[i]
      if (!p) continue

      const prevX = p.x
      const prevY = p.y
      const off = offsetAt(d, t)
      if (d.axis === 'x') p.x = d.x + off
      else p.y = d.y + off

      // Spieler mittragen: Steht er (Stand aus dem letzten Physik-Schritt) oben auf
      // dieser Plattform, wandert er um dasselbe Delta mit.
      const top = prevY + p.h
      if (
        player.onGround &&
        Math.abs(player.y - top) < 0.14 &&
        player.x + PW > prevX &&
        player.x - PW < prevX + p.w
      ) {
        player.x += p.x - prevX
        player.y += p.y - prevY
      }

      const g = groups.current[i]
      if (g) g.position.set(p.x + p.w / 2, p.y + p.h, 0)
    }
  }, -2)

  return (
    <>
      {defs.map((d, i) => {
        const visH = d.h + OVERHANG
        const side = sideTex.get(`${d.w}:${d.h}`)
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
              <meshStandardMaterial attach="material-2" map={topTex} color="#b6e86a" roughness={0.85} />
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
