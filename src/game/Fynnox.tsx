import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { player } from './playerState'

// Fynnox als sauberes 3D-Modell nach der Referenz (CLAUDE.md §3):
// leuchtend orange, SEHR große glänzende blaue Augen, cremefarbene Schnauze,
// blauer Fahreranzug mit „P"-Abzeichen, buschige Rute. Blickt in Laufrichtung,
// leicht zur Kamera gedreht (3/4), damit das Gesicht gut lesbar ist.
const ORANGE = '#ff7d33'
const CREAM = '#ffe6c6'
const SUIT = '#2f6fe0'
const SUIT_DARK = '#2358bd'
const EYE = '#1b8be6'
const NAVY = '#16213c'

export function Fynnox() {
  const g = useRef<THREE.Group>(null)
  const leg = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const grp = g.current
    if (!grp) return
    const t = clock.elapsedTime
    const running = player.onGround && Math.abs(player.vx) > 0.1
    grp.position.y = running ? Math.abs(Math.sin(t * 11)) * 0.08 : Math.sin(t * 2) * 0.02
    // Blickrichtung + leichte 3/4-Drehung zur Kamera (+Z)
    grp.rotation.y = player.facing === 1 ? -0.55 : Math.PI + 0.55
    // Beine „laufen" (Wechselschritt), wenn in Bewegung
    if (leg.current) {
      const swing = running ? Math.sin(t * 12) * 0.5 : 0
      leg.current.children.forEach((c, i) => {
        ;(c as THREE.Object3D).rotation.x = i === 0 ? swing : -swing
      })
    }
  })

  return (
    <group ref={g}>
      {/* ---- Beine + Schuhe ---- */}
      <group ref={leg}>
        {[0.2, -0.2].map((z) => (
          <group key={z} position={[0, 0.5, z]}>
            <mesh position={[0, -0.2, 0]} castShadow>
              <capsuleGeometry args={[0.13, 0.3, 6, 12]} />
              <meshStandardMaterial color={SUIT} roughness={0.5} />
            </mesh>
            <mesh position={[0.08, -0.42, 0]} scale={[1.5, 0.8, 1]} castShadow>
              <sphereGeometry args={[0.15, 14, 12]} />
              <meshStandardMaterial color={NAVY} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ---- Körper (blauer Anzug) ---- */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <capsuleGeometry args={[0.42, 0.5, 10, 18]} />
        <meshStandardMaterial color={SUIT} roughness={0.5} />
      </mesh>
      {/* weißer Reißverschluss vorn */}
      <mesh position={[0.4, 1.0, 0]}>
        <boxGeometry args={[0.05, 0.7, 0.05]} />
        <meshStandardMaterial color="#eef4ff" roughness={0.5} />
      </mesh>
      {/* „P"-Abzeichen (weißer Ring + oranger Kreis) */}
      <group position={[0.42, 1.12, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <circleGeometry args={[0.17, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <circleGeometry args={[0.12, 24]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>
      </group>

      {/* ---- Arme + Pfoten ---- */}
      {[
        [0.32, 1.15, 0.5], // rechts (vorn) leicht gehoben
        [0.06, 1.05, -0.52],
      ].map(([rx, y, z], i) => (
        <group key={i} position={[0.05, y, z]} rotation={[0, 0, i === 0 ? -0.5 : 0.35]}>
          <mesh position={[0, -0.22, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.36, 6, 12]} />
            <meshStandardMaterial color={SUIT_DARK} roughness={0.5} />
          </mesh>
          <mesh position={[rx * 0 + 0.02, -0.44, 0]} castShadow>
            <sphereGeometry args={[0.14, 14, 12]} />
            <meshStandardMaterial color={ORANGE} roughness={0.55} />
          </mesh>
        </group>
      ))}

      {/* ---- Buschige Rute (hinten, -X) ---- */}
      <group position={[-0.42, 0.85, 0]} rotation={[0, 0, 0.8]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.22, 0.5, 8, 14]} />
          <meshStandardMaterial color={ORANGE} roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <sphereGeometry args={[0.2, 14, 12]} />
          <meshStandardMaterial color={CREAM} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- Kopf ---- */}
      <group position={[0.05, 1.85, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.6, 28, 26]} />
          <meshStandardMaterial color={ORANGE} roughness={0.5} />
        </mesh>

        {/* Ohren */}
        {[0.32, -0.32].map((z) => (
          <group key={z} position={[-0.05, 0.52, z]} rotation={[z > 0 ? -0.25 : 0.25, 0, 0.12]}>
            <mesh castShadow>
              <coneGeometry args={[0.2, 0.55, 16]} />
              <meshStandardMaterial color={ORANGE} roughness={0.55} />
            </mesh>
            <mesh position={[0.03, -0.02, 0]} scale={0.55}>
              <coneGeometry args={[0.2, 0.55, 16]} />
              <meshStandardMaterial color={CREAM} roughness={0.6} />
            </mesh>
          </group>
        ))}

        {/* Schnauze (cremefarben) + Nase */}
        <mesh position={[0.42, -0.14, 0]} scale={[0.55, 0.42, 0.62]}>
          <sphereGeometry args={[0.34, 20, 18]} />
          <meshStandardMaterial color={CREAM} roughness={0.55} />
        </mesh>
        <mesh position={[0.62, -0.06, 0]}>
          <sphereGeometry args={[0.09, 14, 12]} />
          <meshStandardMaterial color="#20242e" roughness={0.4} />
        </mesh>

        {/* SEHR große glänzende blaue Augen */}
        {[0.24, -0.24].map((z) => (
          <group key={z} position={[0.4, 0.14, z]}>
            <mesh>
              <sphereGeometry args={[0.2, 20, 18]} />
              <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
            <mesh position={[0.12, 0, 0]}>
              <sphereGeometry args={[0.13, 18, 16]} />
              <meshStandardMaterial color={EYE} roughness={0.15} metalness={0.1} />
            </mesh>
            <mesh position={[0.19, 0, 0]}>
              <sphereGeometry args={[0.06, 12, 10]} />
              <meshStandardMaterial color="#0c1330" roughness={0.3} />
            </mesh>
            <mesh position={[0.2, 0.06, 0.05]}>
              <sphereGeometry args={[0.035, 10, 8]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}
