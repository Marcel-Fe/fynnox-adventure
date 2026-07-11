import { RoundedBox } from '@react-three/drei'
import type { Platform } from './physics'

// Plastische 3D-Plattformen (abgerundete Kanten → weicher Cartoon-Look): Erd-Körper mit
// Tiefe + satte Gras-Oberkante. Fynnox steht bei z=0 oben auf (Steh-Linie = f.y+f.h).
const DEPTH = 3.2

export function Platforms({ platforms }: { platforms: Platform[] }) {
  return (
    <>
      {platforms.map((f, i) => (
        <group key={i} position={[f.x + f.w / 2, f.y + f.h / 2, 0]}>
          {/* Erd-Körper */}
          <RoundedBox args={[f.w, f.h, DEPTH]} radius={0.14} smoothness={4} castShadow receiveShadow>
            <meshStandardMaterial color="#8a5a30" roughness={0.95} />
          </RoundedBox>
          {/* Gras-Deckel */}
          <RoundedBox
            args={[f.w + 0.06, 0.5, DEPTH + 0.06]}
            radius={0.12}
            smoothness={4}
            position={[0, f.h / 2 + 0.05, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#43a559" roughness={0.85} />
          </RoundedBox>
        </group>
      ))}
    </>
  )
}
