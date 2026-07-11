import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// Bodendeko für einen lebendigen Wald: bunte Blumen + Grasbüschel, instanziert
// (ein Zeichenaufruf je Teil). Verteilt entlang der Laufachse rund um das Spielfeld.
const FLOWER_COLORS = ['#ff5db0', '#ffd23f', '#ff7a2f', '#8f6bff', '#ff5555', '#5be0ff']

interface Spot {
  x: number
  z: number
  s: number
  c: number
}

function useSpots(minX: number, maxX: number, count: number, seedShift: number): Spot[] {
  return useMemo(() => {
    const out: Spot[] = []
    for (let i = 0; i < count; i++) {
      // deterministische Pseudo-Streuung (kein Math.random → stabil bei Re-Renders)
      const r1 = Math.abs(Math.sin((i + seedShift) * 12.9898) * 43758.5453) % 1
      const r2 = Math.abs(Math.sin((i + seedShift) * 78.233) * 12543.777) % 1
      const r3 = Math.abs(Math.sin((i + seedShift) * 3.14) * 998.77) % 1
      out.push({
        x: minX + (maxX - minX) * r1,
        z: -6.5 + r2 * 11, // vor und knapp hinter dem Spielfeld
        s: 0.7 + r3 * 0.7,
        c: Math.floor(r3 * FLOWER_COLORS.length),
      })
    }
    return out
  }, [minX, maxX, count, seedShift])
}

function Instances({ spots, geom, color, yOff }: { spots: Spot[]; geom: THREE.BufferGeometry; color?: string; yOff: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const im = ref.current
    if (!im) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const c = new THREE.Color()
    for (let i = 0; i < spots.length; i++) {
      const s = spots[i]
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), s.x + s.z)
      m.compose(new THREE.Vector3(s.x, yOff * s.s, s.z), q, new THREE.Vector3(s.s, s.s, s.s))
      im.setMatrixAt(i, m)
      if (!color) {
        c.set(FLOWER_COLORS[s.c])
        im.setColorAt(i, c)
      }
    }
    im.instanceMatrix.needsUpdate = true
    if (im.instanceColor) im.instanceColor.needsUpdate = true
    im.computeBoundingSphere()
  }, [spots, yOff, color])
  return (
    <instancedMesh ref={ref} args={[geom, undefined as unknown as THREE.Material, spots.length]} castShadow receiveShadow>
      <meshStandardMaterial color={color ?? '#ffffff'} roughness={0.85} />
    </instancedMesh>
  )
}

export function Foliage({ minX, maxX }: { minX: number; maxX: number }) {
  const flowers = useSpots(minX, maxX, 90, 1)
  const grass = useSpots(minX, maxX, 130, 50)

  const stemGeo = useMemo(() => new THREE.CylinderGeometry(0.03, 0.04, 0.5, 5), [])
  const budGeo = useMemo(() => new THREE.SphereGeometry(0.12, 8, 7), [])
  const bladeGeo = useMemo(() => new THREE.ConeGeometry(0.07, 0.42, 4), [])

  return (
    <>
      <Instances spots={flowers} geom={stemGeo} color="#2f8f45" yOff={0.25} />
      <Instances spots={flowers} geom={budGeo} yOff={0.55} />
      <Instances spots={grass} geom={bladeGeo} color="#2c8c46" yOff={0.3} />
    </>
  )
}
