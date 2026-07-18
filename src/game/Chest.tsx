import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { useGameStore } from '../store/gameStore'
import { burst, addShake } from './fx'
import type { ChestDef, Pickup } from './level'

// Schlüssel & Schatztruhe — das Belohnungs-Ziel eines Levels.
// Der Schlüssel liegt abseits des Wegs; erst mit ihm springt der Truhen-Deckel auf und
// die Kristalle fliegen heraus. Muster wie in Pickups.tsx (Distanzprüfung + burst).

const OPEN_ANGLE = -1.9 // rad; der Deckel klappt nach hinten weg

// --- Schlüssel ---------------------------------------------------------------
export function KeyItem({ def }: { def: Pickup }) {
  const tex = useTexture(asset('art/items/key.png'))
  tex.colorSpace = THREE.SRGBColorSpace
  const ref = useRef<THREE.Sprite>(null)
  const got = useRef(false)
  const takeKey = useGameStore((s) => s.takeKey)

  useFrame(({ clock }) => {
    const s = ref.current
    if (!s || got.current) return
    const t = clock.elapsedTime
    s.position.y = def.y + Math.sin(t * 1.8) * 0.2
    // leichtes Kippen — der Schlüssel „blinkt" beim Drehen kurz auf
    ;(s.material as THREE.SpriteMaterial).rotation = Math.sin(t * 1.4) * 0.5

    const dx = player.x - def.x
    const dy = player.y + 1 - def.y
    if (dx * dx + dy * dy < 2.4) {
      got.current = true
      s.visible = false
      burst('star', def.x, def.y)
      addShake(0.2)
      takeKey()
    }
  })

  return (
    <sprite ref={ref} position={[def.x, def.y, 0.2]} scale={[1.15, 1.15, 1]}>
      <spriteMaterial map={tex} transparent alphaTest={0.4} depthWrite={false} />
    </sprite>
  )
}

// --- Truhe -------------------------------------------------------------------
export function Chest({ def }: { def: ChestDef }) {
  const lid = useRef<THREE.Group>(null)
  const hint = useRef<THREE.Sprite>(null)
  const glow = useRef<THREE.Mesh>(null)
  const opened = useRef(false)
  const anim = useRef(0) // 0 = zu, 1 = ganz offen
  const keyTex = useTexture(asset('art/items/key.png'))
  keyTex.colorSpace = THREE.SRGBColorSpace

  const addGem = useGameStore((s) => s.addGem)
  const openChest = useGameStore((s) => s.openChest)

  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    const st = useGameStore.getState()

    // Hinweis-Schlüssel über der Truhe: zeigt „hier fehlt noch etwas".
    if (hint.current) {
      hint.current.visible = !st.hasKey && !opened.current
      hint.current.position.y = def.y + 1.9 + Math.sin(t * 2.4) * 0.12
    }

    if (!opened.current && st.hasKey) {
      const dx = player.x - def.x
      const dy = player.y + 1 - (def.y + 0.6)
      if (dx * dx + dy * dy < 5.0) {
        opened.current = true
        openChest()
        // Belohnung: Kristall-Regen. Die Kristalle zählen in die Level-Summe mit
        // (siehe totalGemCount) — die Anzeige „x / y" bleibt dadurch ehrlich.
        for (let i = 0; i < def.gems; i++) addGem()
        burst('star', def.x, def.y + 1.0)
        burst('coin', def.x - 0.5, def.y + 1.1)
        burst('coin', def.x + 0.5, def.y + 1.1)
        burst('gem', def.x, def.y + 1.3)
        addShake(0.4)
      }
    }

    if (opened.current && anim.current < 1) {
      anim.current = Math.min(1, anim.current + delta * 2.6)
    }
    // weiches Aufschwingen mit kleinem Überschwingen (ease-out back)
    const e = anim.current
    const eased = e < 1 ? 1 - Math.pow(1 - e, 3) : 1
    const overshoot = Math.sin(e * Math.PI) * 0.12
    if (lid.current) lid.current.rotation.x = OPEN_ANGLE * (eased + overshoot)
    if (glow.current) {
      glow.current.visible = anim.current > 0.05
      const m = glow.current.material as THREE.MeshBasicMaterial
      m.opacity = 0.45 * eased * (0.75 + Math.sin(t * 3) * 0.25)
    }
  })

  return (
    <group position={[def.x, def.y, 0]}>
      {/* Korpus */}
      <RoundedBox args={[1.5, 0.95, 1.1]} radius={0.1} smoothness={4} position={[0, 0.48, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#7a4a24" roughness={0.75} />
      </RoundedBox>
      {/* Goldbeschläge */}
      <mesh position={[0, 0.48, 0.56]}>
        <boxGeometry args={[0.3, 0.98, 0.06]} />
        <meshStandardMaterial color="#f2c14b" roughness={0.3} metalness={0.6} envMapIntensity={1.4} />
      </mesh>
      <mesh position={[0, 0.42, 0.6]}>
        <boxGeometry args={[0.2, 0.24, 0.08]} />
        <meshStandardMaterial color="#ffe08a" roughness={0.25} metalness={0.7} envMapIntensity={1.6} />
      </mesh>

      {/* Schein aus der offenen Truhe */}
      <mesh ref={glow} position={[0, 1.1, 0]} visible={false}>
        <sphereGeometry args={[0.6, 16, 12]} />
        <meshBasicMaterial color="#ffe9a8" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Deckel — Drehpunkt an der HINTEREN Oberkante, klappt nach hinten auf */}
      <group ref={lid} position={[0, 0.95, -0.55]}>
        <RoundedBox args={[1.55, 0.42, 1.15]} radius={0.1} smoothness={4} position={[0, 0.2, 0.55]} castShadow>
          <meshStandardMaterial color="#8a5529" roughness={0.72} />
        </RoundedBox>
        <mesh position={[0, 0.2, 1.1]}>
          <boxGeometry args={[0.3, 0.46, 0.06]} />
          <meshStandardMaterial color="#f2c14b" roughness={0.3} metalness={0.6} envMapIntensity={1.4} />
        </mesh>
      </group>

      {/* „Braucht einen Schlüssel"-Hinweis */}
      <sprite ref={hint} position={[0, 1.9, 0.3]} scale={[0.7, 0.7, 1]}>
        <spriteMaterial map={keyTex} transparent alphaTest={0.4} opacity={0.85} depthWrite={false} />
      </sprite>
    </group>
  )
}
