import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
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
      if (g) g.position.set(p.x + p.w / 2, p.y + p.h / 2, 0)
    }
  }, -2)

  return (
    <>
      {defs.map((d, i) => (
        <group
          key={i}
          ref={(el) => { groups.current[i] = el }}
          position={[live[i]?.x + d.w / 2, live[i]?.y + d.h / 2, 0]}
        >
          {/* Holz-Körper — bewusst anders als die festen Erd-Plattformen,
              damit man auf einen Blick sieht: die hier bewegt sich. */}
          <RoundedBox args={[d.w, d.h, DEPTH]} radius={0.12} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#8b6134" roughness={0.8} />
          </RoundedBox>
          {/* Deckplanke in warmem Holzton */}
          <RoundedBox
            args={[d.w + 0.06, 0.32, DEPTH + 0.06]}
            radius={0.1}
            smoothness={4}
            position={[0, d.h / 2 + 0.02, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#d4a24a" roughness={0.6} envMapIntensity={1.1} />
          </RoundedBox>
          {/* Beschläge an den Enden — kleiner Detail-Akzent im Cartoon-Look */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[(s * d.w) / 2 - s * 0.18, 0, DEPTH / 2 + 0.02]}>
              <boxGeometry args={[0.18, d.h * 0.86, 0.08]} />
              <meshStandardMaterial color="#5d4526" roughness={0.7} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}
