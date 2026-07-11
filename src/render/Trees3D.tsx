import { useMemo } from 'react'
import * as THREE from 'three'

// Plastische Cartoon-Bäume im 2,5D/„Diorama"-Look (runde Laubkugeln statt Low-Poly-Kegel).
// In Tiefen-Bändern (z<0) gestaffelt → echte 3D-Tiefe; Ferne blendet der Nebel aus.

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

interface TreeInst {
  pos: [number, number, number]
  scale: number
  hue: number
}

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
        out.push({
          pos: [x + (r() - 0.5) * b.step * 0.7, 0, b.z + (r() - 0.5) * 3],
          scale: b.s[0] + r() * (b.s[1] - b.s[0]),
          hue: r(),
        })
      }
    }
    return out
  }, [minX, maxX])
}

function Tree({ inst }: { inst: TreeInst }) {
  const green = new THREE.Color().setHSL(0.32 + inst.hue * 0.06, 0.55, 0.36 + inst.hue * 0.06)
  const greenLight = green.clone().offsetHSL(0, 0, 0.08)
  return (
    <group position={inst.pos} scale={inst.scale}>
      {/* Stamm */}
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.16, 0.22, 1.0, 10]} />
        <meshStandardMaterial color="#7a5230" roughness={0.9} />
      </mesh>
      {/* Laub: mehrere überlappende Kugeln → runde, plastische Krone */}
      {[
        [0, 1.55, 0, 0.85],
        [-0.5, 1.3, 0.1, 0.6],
        [0.5, 1.35, -0.1, 0.62],
        [0.05, 2.1, 0, 0.6],
        [-0.25, 1.85, 0.25, 0.5],
        [0.3, 1.9, -0.2, 0.5],
      ].map(([x, y, z, s], i) => (
        <mesh key={i} position={[x, y, z]} castShadow>
          <sphereGeometry args={[s, 18, 16]} />
          <meshStandardMaterial color={i % 2 === 0 ? green : greenLight} roughness={0.85} flatShading={false} />
        </mesh>
      ))}
    </group>
  )
}

export function Trees3D({ minX, maxX }: { minX: number; maxX: number }) {
  const trees = useTrees(minX, maxX)
  return (
    <>
      {trees.map((t, i) => (
        <Tree key={i} inst={t} />
      ))}
    </>
  )
}
