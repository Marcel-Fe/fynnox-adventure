import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { asset } from '../utils/asset'
import { player } from './playerState'
import { burst, addShake } from './fx'

// Fynnox als echtes 3D-Modell (Tripo, gerigt) im 2,5D-Seitenscroller. Auto-skaliert auf
// Zielhöhe, Füße am Boden, blickt nach +X (Laufrichtung). Bewegung wird prozedural über
// die (sauber benannten) Knochen erzeugt — der Export enthält keine fertigen Clips.

const URL = asset('models/fynnox.glb')
const TARGET_H = 2.6
const BASE_ROT = 0 // Modell blickt intrinsisch nach +X → Seitenansicht nach rechts

useGLTF.preload(URL)

interface Bones {
  lThigh?: THREE.Object3D; rThigh?: THREE.Object3D
  lCalf?: THREE.Object3D; rCalf?: THREE.Object3D
  lArm?: THREE.Object3D; rArm?: THREE.Object3D
  spine?: THREE.Object3D; pelvis?: THREE.Object3D
  base: Record<string, number> // Ausgangs-Rotationen (x)
}

export function FynnoxModel() {
  const { scene } = useGLTF(URL)
  const outer = useRef<THREE.Group>(null)
  const t = useRef(0)
  // Spielgefühl: Squash & Stretch + Staub-Effekte
  const wasGround = useRef(true)
  const squash = useRef(0) // >0 = gestaucht (Landung), <0 = gestreckt (Absprung)
  const runDust = useRef(0)

  const { scaleV, yOff } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene)
    const size = new THREE.Vector3()
    box.getSize(size)
    const s = TARGET_H / (size.y || 1)
    return { scaleV: s, yOff: -box.min.y * s }
  }, [scene])

  const bones = useMemo<Bones>(() => {
    const find = (n: string) => scene.getObjectByName(n) || undefined
    const b: Bones = {
      lThigh: find('L_Thigh'), rThigh: find('R_Thigh'),
      lCalf: find('L_Calf'), rCalf: find('R_Calf'),
      lArm: find('L_Upperarm'), rArm: find('R_Upperarm'),
      spine: find('Spine02'), pelvis: find('Pelvis'),
      base: {},
    }
    for (const [k, o] of Object.entries(b)) {
      if (k !== 'base' && o) b.base[k] = (o as THREE.Object3D).rotation.x
    }
    return b
  }, [scene])

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (m.isMesh) { m.castShadow = true; m.frustumCulled = false }
    })
  }, [scene])

  useFrame((_, delta) => {
    const o = outer.current
    if (!o) return
    t.current += delta
    const time = t.current
    const running = player.onGround && Math.abs(player.vx) > 0.1

    // --- prozedurale Pose über Knochen ---
    const set = (bone: THREE.Object3D | undefined, key: string, val: number) => {
      if (bone && bones.base[key] !== undefined) bone.rotation.x = bones.base[key] + val
    }
    if (!player.onGround) {
      const tuck = player.vy > 0 ? 0.6 : 0.15 // Sprung: angezogen, Fall: leicht
      set(bones.lThigh, 'lThigh', tuck); set(bones.rThigh, 'rThigh', tuck * 0.7)
      set(bones.lCalf, 'lCalf', -tuck * 1.4); set(bones.rCalf, 'rCalf', -tuck)
      set(bones.lArm, 'lArm', -0.9); set(bones.rArm, 'rArm', -0.9)
    } else if (running) {
      const sp = 10
      const sw = Math.sin(time * sp)
      set(bones.lThigh, 'lThigh', sw * 0.7); set(bones.rThigh, 'rThigh', -sw * 0.7)
      set(bones.lCalf, 'lCalf', Math.max(0, -sw) * 0.9); set(bones.rCalf, 'rCalf', Math.max(0, sw) * 0.9)
      set(bones.lArm, 'lArm', -sw * 0.5); set(bones.rArm, 'rArm', sw * 0.5)
      set(bones.spine, 'spine', 0.12)
    } else {
      const br = Math.sin(time * 2) * 0.04
      set(bones.lThigh, 'lThigh', 0); set(bones.rThigh, 'rThigh', 0)
      set(bones.lCalf, 'lCalf', 0); set(bones.rCalf, 'rCalf', 0)
      set(bones.lArm, 'lArm', 0); set(bones.rArm, 'rArm', 0)
      set(bones.spine, 'spine', br)
    }

    // --- Spielgefühl: Absprung / Landung / Laufstaub ---
    const dt = Math.min(delta, 0.05)
    if (!player.onGround && wasGround.current) {
      // gerade abgesprungen → strecken + kleine Staubwolke
      squash.current = -0.55
      burst('jump', player.x, player.y + 0.15)
    } else if (player.onGround && !wasGround.current) {
      // gelandet → stauchen, Staub, Rüttler je nach Fallhöhe
      const hard = Math.min(1, Math.abs(player.vy) / 18)
      squash.current = 0.5 + hard * 0.35
      burst('land', player.x, player.y + 0.12)
      addShake(0.06 + hard * 0.16)
    }
    wasGround.current = player.onGround

    if (running) {
      runDust.current -= dt
      if (runDust.current <= 0) {
        runDust.current = 0.13
        burst('run', player.x - player.facing * 0.35, player.y + 0.1)
      }
    }

    squash.current += (0 - squash.current) * Math.min(1, dt * 11) // federt zurück

    // --- Körper-Bob + Blickrichtung + Squash/Stretch ---
    const bob = running ? Math.abs(Math.sin(time * 10)) * 0.08 : Math.sin(time * 2) * 0.03
    o.position.y = yOff + bob
    o.rotation.y = BASE_ROT + (player.facing === 1 ? 0 : Math.PI)
    const sq = squash.current
    o.scale.set(scaleV * (1 + sq * 0.42), scaleV * (1 - sq * 0.5), scaleV * (1 + sq * 0.42))
  })

  return (
    <group ref={outer} position={[0, yOff, 0]} scale={scaleV}>
      <primitive object={scene} />
    </group>
  )
}
