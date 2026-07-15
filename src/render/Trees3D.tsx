import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Plastische Cartoon-Bäume im 2,5D/„Diorama"-Look — jetzt mit mehr Varianz (Lücke 2):
// drei Baum-Typen (Laubbaum / Nadelbaum / Busch), Stamm-Farb-Varianz, dichtere Kronen
// und eine leichte Wind-Neigung (die Kronen wiegen sanft). In Tiefen-Bändern (z<0)
// gestaffelt → echte 3D-Tiefe; die Ferne blendet der Nebel aus. Performance bleibt gut:
// die Wind-Animation läuft in EINER Schleife über die Kronen-Refs.

type TreeType = 'leaf' | 'conifer' | 'bush'

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

interface TreeInst {
  pos: [number, number, number]
  scale: number
  hue: number
  type: TreeType
  trunk: string
  phase: number
}

const TRUNKS = ['#7a5230', '#6b4423', '#835a34', '#5f3d22']

function useTrees(minX: number, maxX: number): TreeInst[] {
  return useMemo(() => {
    const r = rand(1337)
    const out: TreeInst[] = []
    const bands = [
      { z: -34, step: 5.5, s: [2.2, 3.0] },
      { z: -22, step: 4.8, s: [1.7, 2.4] },
      { z: -13, step: 4.6, s: [1.3, 1.9] },
      { z: -7, step: 5.2, s: [1.0, 1.5] },
    ]
    for (const b of bands) {
      for (let x = minX - 14; x <= maxX + 14; x += b.step) {
        const roll = r()
        const type: TreeType = roll < 0.55 ? 'leaf' : roll < 0.82 ? 'conifer' : 'bush'
        out.push({
          pos: [x + (r() - 0.5) * b.step * 0.7, 0, b.z + (r() - 0.5) * 3],
          scale: b.s[0] + r() * (b.s[1] - b.s[0]),
          hue: r(),
          type,
          trunk: TRUNKS[(r() * TRUNKS.length) | 0],
          phase: r() * Math.PI * 2,
        })
      }
    }
    return out
  }, [minX, maxX])
}

// Dichte, runde Laubkrone aus überlappenden Kugeln (mehr Blätter = plastischer).
function LeafCrown({ green, greenLight }: { green: THREE.Color; greenLight: THREE.Color }) {
  const blobs: [number, number, number, number][] = [
    [0, 1.6, 0, 0.9],
    [-0.55, 1.35, 0.12, 0.62], [0.55, 1.4, -0.12, 0.64],
    [0.08, 2.15, 0, 0.62], [-0.28, 1.9, 0.28, 0.52], [0.32, 1.95, -0.22, 0.52],
    [-0.15, 1.55, -0.5, 0.5], [0.2, 1.7, 0.5, 0.48], [0, 2.5, 0, 0.42],
  ]
  return (
    <>
      {blobs.map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[s, 16, 14]} />
          <meshStandardMaterial color={i % 2 === 0 ? green : greenLight} roughness={0.85} />
        </mesh>
      ))}
    </>
  )
}

// Nadelbaum: gestaffelte, breiter werdende Kegel (dunkleres Grün).
function ConiferCrown({ green }: { green: THREE.Color }) {
  const tiers: [number, number, number][] = [
    [0.9, 1.15, 1.05], // y, radius, height
    [1.7, 0.85, 0.95],
    [2.4, 0.55, 0.8],
  ]
  const dark = green.clone().offsetHSL(0, 0.05, -0.08)
  return (
    <>
      {tiers.map(([y, rad, h], i) => (
        <mesh key={i} position={[0, y, 0]} castShadow>
          <coneGeometry args={[rad, h, 9]} />
          <meshStandardMaterial color={dark} roughness={0.82} />
        </mesh>
      ))}
    </>
  )
}

function Tree({ inst, crownRef }: { inst: TreeInst; crownRef: (g: THREE.Group | null) => void }) {
  const green = new THREE.Color().setHSL(0.32 + inst.hue * 0.06, 0.55, 0.34 + inst.hue * 0.07)
  const greenLight = green.clone().offsetHSL(0, 0, 0.08)

  return (
    <group position={inst.pos} scale={inst.scale}>
      {/* Stamm (bei Büschen nur ein kurzer Stumpf) */}
      {inst.type !== 'bush' && (
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.16, 0.24, inst.type === 'conifer' ? 0.8 : 1.0, 10]} />
          <meshStandardMaterial color={inst.trunk} roughness={0.9} />
        </mesh>
      )}

      {/* Krone in einer eigenen, windbewegten Gruppe */}
      <group ref={crownRef}>
        {inst.type === 'leaf' && <LeafCrown green={green} greenLight={greenLight} />}
        {inst.type === 'conifer' && <ConiferCrown green={green} />}
        {inst.type === 'bush' && (
          <>
            {[
              [0, 0.55, 0, 0.7], [-0.5, 0.45, 0.1, 0.55], [0.5, 0.48, -0.1, 0.55], [0, 0.85, 0, 0.5],
            ].map(([x, y, z, s], i) => (
              <mesh key={i} position={[x, y, z]} castShadow>
                <sphereGeometry args={[s, 14, 12]} />
                <meshStandardMaterial color={i % 2 === 0 ? green : greenLight} roughness={0.85} />
              </mesh>
            ))}
          </>
        )}
      </group>
    </group>
  )
}

export function Trees3D({ minX, maxX }: { minX: number; maxX: number }) {
  const trees = useTrees(minX, maxX)
  const crowns = useRef<(THREE.Group | null)[]>([])
  const t = useRef(0)

  // Leichte Wind-Neigung: eine Schleife wiegt alle Kronen sanft (Busch weniger).
  useFrame((_, delta) => {
    t.current += delta
    const time = t.current
    for (let i = 0; i < trees.length; i++) {
      const g = crowns.current[i]
      if (!g) continue
      const amp = trees[i].type === 'bush' ? 0.02 : 0.05
      g.rotation.z = Math.sin(time * 1.1 + trees[i].phase) * amp
    }
  })

  return (
    <>
      {trees.map((tr, i) => (
        <Tree key={i} inst={tr} crownRef={(g) => { crowns.current[i] = g }} />
      ))}
    </>
  )
}
