import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Fynnox — Platzhalter-Figur (Tag-2-Ziel: aus PetFigure-Fuchs abgeleitet).
// Verbindlich (siehe CLAUDE.md §3): warmes Orange, SEHR große, glänzende blaue
// Augen, blaues Fahrer-Outfit, süß/freundlich. Blickt nach +X (Laufrichtung).
const ORANGE = '#ff7a2f'
const LIGHT = '#ffe3c2'
const BLUE = '#1b7fe0'

export function Fynnox() {
  const g = useRef<THREE.Group>(null)
  // Sanftes Atmen/Wippen im Stand.
  useFrame(({ clock }) => {
    if (g.current) g.current.position.y = Math.abs(Math.sin(clock.elapsedTime * 1.6)) * 0.06
  })

  return (
    <group ref={g}>
      {/* Beine */}
      {[-0.18, 0.18].map((z) => (
        <mesh key={z} position={[0, 0.28, z]} castShadow>
          <capsuleGeometry args={[0.11, 0.3, 6, 10]} />
          <meshStandardMaterial color={ORANGE} roughness={0.6} />
        </mesh>
      ))}

      {/* Körper */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.5, 8, 14]} />
        <meshStandardMaterial color={ORANGE} roughness={0.55} />
      </mesh>
      {/* Weißer Bauch */}
      <mesh position={[0.22, 0.8, 0]} scale={[0.5, 0.9, 0.7]}>
        <sphereGeometry args={[0.28, 14, 14]} />
        <meshStandardMaterial color={LIGHT} roughness={0.6} />
      </mesh>

      {/* Blaues Fahrer-Outfit: Schal am Hals */}
      <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.09, 10, 20]} />
        <meshStandardMaterial color={BLUE} roughness={0.5} />
      </mesh>

      {/* Kopf */}
      <mesh position={[0.06, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.44, 22, 22]} />
        <meshStandardMaterial color={ORANGE} roughness={0.55} />
      </mesh>
      {/* Wangen hell */}
      {[-0.26, 0.26].map((z) => (
        <mesh key={z} position={[0.28, 1.44, z]} scale={0.42}>
          <sphereGeometry args={[0.2, 12, 12]} />
          <meshStandardMaterial color={LIGHT} roughness={0.6} />
        </mesh>
      ))}
      {/* Schnauze nach vorn (+X) */}
      <mesh position={[0.42, 1.42, 0]}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial color={LIGHT} roughness={0.6} />
      </mesh>
      {/* Nase */}
      <mesh position={[0.6, 1.44, 0]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#222" />
      </mesh>

      {/* SEHR große, glänzende blaue Augen */}
      {[-0.19, 0.19].map((z) => (
        <group key={z} position={[0.34, 1.6, z]}>
          <mesh>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color="#ffffff" roughness={0.25} />
          </mesh>
          <mesh position={[0.09, 0, 0]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={BLUE} roughness={0.15} metalness={0.1} />
          </mesh>
          <mesh position={[0.15, 0.03, 0.03]}>
            <sphereGeometry args={[0.035, 10, 10]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Fuchs-Ohren */}
      {[-0.22, 0.22].map((z) => (
        <group key={z} position={[-0.02, 1.92, z]} rotation={[z < 0 ? 0.2 : -0.2, 0, 0.1]}>
          <mesh castShadow>
            <coneGeometry args={[0.15, 0.42, 12]} />
            <meshStandardMaterial color={ORANGE} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.02, 0]} scale={0.6}>
            <coneGeometry args={[0.15, 0.42, 12]} />
            <meshStandardMaterial color={LIGHT} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Buschige Rute mit heller Spitze (nach hinten, -X) */}
      <group position={[-0.42, 0.7, 0]} rotation={[0, 0, 0.7]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.2, 0.5, 8, 12]} />
          <meshStandardMaterial color={ORANGE} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.42, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color={LIGHT} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}
