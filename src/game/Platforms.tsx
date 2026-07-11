import type { Platform } from './physics'

// Plattformen als Boxen mit Erd-Körper + Gras-Oberkante. Tiefe in Z, damit sie
// von der Seitenkamera solide wirken; Fynnox steht bei z = 0 oben auf.
export function Platforms({ platforms }: { platforms: Platform[] }) {
  return (
    <>
      {platforms.map((f, i) => (
        <group key={i} position={[f.x + f.w / 2, f.y + f.h / 2, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[f.w, f.h, 3]} />
            <meshStandardMaterial color="#7a5230" roughness={0.9} />
          </mesh>
          <mesh position={[0, f.h / 2, 0]} receiveShadow>
            <boxGeometry args={[f.w, 0.28, 3.05]} />
            <meshStandardMaterial color="#2f9e54" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  )
}
