import { useMemo } from 'react'
import { RoundedBox } from '@react-three/drei'

// Plastische Cartoon-Häuser für ein bewohntes Dorf-Gefühl (Lücke 1). Bewusst wenige
// Meshes je Haus (Körper + Dach + Tür + 2 Fenster + Schornstein) und deterministisch
// in Tiefen-Ebenen (z<0) hinter dem Spielfeld platziert → gute Mobil-Performance.
// Der Nebel dünnt die ferneren Häuser sanft aus.

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

interface HouseInst {
  pos: [number, number, number]
  scale: number
  wall: string
  roof: string
}

// Warme, freundliche Cartoon-Paletten (Wand / Dach).
const PALETTES: { wall: string; roof: string }[] = [
  { wall: '#f4d9a6', roof: '#c1492f' }, // creme / ziegelrot
  { wall: '#f1b877', roof: '#7a4a2b' }, // apricot / braun
  { wall: '#e9c7a0', roof: '#3f6d4e' }, // sand / tannengrün
  { wall: '#f6e0b0', roof: '#2f5f8a' }, // hell / blau
  { wall: '#e7a86b', roof: '#8a3b2e' }, // terracotta / rostrot
]

function useHouses(minX: number, maxX: number): HouseInst[] {
  return useMemo(() => {
    const r = rand(70707)
    const out: HouseInst[] = []
    // Zwei Tiefen-Bänder: näheres Dorf (deutlich) + fernere Häuser (Dunst/Tiefe).
    // Maßstab passend zu Fynnox (2,6) und den Bäumen: Haus-Grundmodell ist ~4 Einheiten
    // hoch → scale 2 ≈ 8 Einheiten, also ein richtiges Haus, kein Puppenhaus.
    const bands = [
      { z: -15, step: 26, s: [1.9, 2.4], jitter: 7 },
      { z: -27, step: 34, s: [2.4, 3.1], jitter: 10 },
    ]
    for (const b of bands) {
      for (let x = minX + 4; x <= maxX; x += b.step) {
        const p = PALETTES[(r() * PALETTES.length) | 0]
        out.push({
          pos: [x + (r() - 0.5) * b.jitter, 0, b.z + (r() - 0.5) * 3],
          scale: b.s[0] + r() * (b.s[1] - b.s[0]),
          wall: p.wall,
          roof: p.roof,
        })
      }
    }
    return out
  }, [minX, maxX])
}

function House({ inst }: { inst: HouseInst }) {
  const bodyH = 2.2
  const bodyW = 2.6
  const bodyD = 2.2
  return (
    <group position={inst.pos} scale={inst.scale}>
      {/* Körper */}
      <RoundedBox args={[bodyW, bodyH, bodyD]} radius={0.12} smoothness={3} position={[0, bodyH / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={inst.wall} roughness={0.85} />
      </RoundedBox>

      {/* Dach (4-seitige Pyramide) */}
      <mesh position={[0, bodyH + 0.85, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[bodyW * 0.95, 1.7, 4]} />
        <meshStandardMaterial color={inst.roof} roughness={0.8} flatShading />
      </mesh>

      {/* Tür (leicht vor der Wand) */}
      <mesh position={[0, 0.6, bodyD / 2 + 0.02]}>
        <boxGeometry args={[0.7, 1.2, 0.08]} />
        <meshStandardMaterial color="#5b3a22" roughness={0.7} />
      </mesh>

      {/* Fenster links/rechts */}
      {[-0.72, 0.72].map((wx, i) => (
        <mesh key={i} position={[wx, 1.45, bodyD / 2 + 0.02]}>
          <boxGeometry args={[0.55, 0.55, 0.08]} />
          <meshStandardMaterial color="#bfe6ff" emissive="#7fd0ff" emissiveIntensity={0.25} roughness={0.35} />
        </mesh>
      ))}

      {/* Schornstein */}
      <mesh position={[bodyW * 0.28, bodyH + 1.0, 0]} castShadow>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshStandardMaterial color="#8a5a3a" roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Houses({ minX, maxX }: { minX: number; maxX: number }) {
  const houses = useHouses(minX, maxX)
  return (
    <>
      {houses.map((h, i) => (
        <House key={i} inst={h} />
      ))}
    </>
  )
}
