import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { player } from '../game/playerState'

// Landschafts-Anreicherung für den modernen Cartoon-Look: entfernte Hügel/Berge (Tiefe
// + Dunst), plus Boden-Deko (Blumen, Felsen, Büschel, Steine) rund um das Spielfeld.
// Deterministisch platziert (kein Flackern), Instancing für Boden-Deko → wenige Draw-Calls.

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

// Weiße 5-Blütenblatt-Blume (transparent) → wird je Instanz eingefärbt (instanceColor).
function makeFlowerTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    ctx.beginPath()
    ctx.ellipse(32 + Math.cos(a) * 15, 32 + Math.sin(a) * 15, 12, 9, a, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.fillStyle = '#ffe14d' // gelbe Mitte
  ctx.beginPath()
  ctx.arc(32, 32, 9, 0, Math.PI * 2)
  ctx.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

// Große, weiche Hügel weit hinten. Fern genug, dass der Nebel sie zart einfärbt → Tiefe.
function DistantHills({ minX, maxX }: { minX: number; maxX: number }) {
  const hills = useMemo(() => {
    const r = rand(909)
    const out: { pos: [number, number, number]; scale: [number, number, number]; color: string }[] = []
    // vordere Hügelkette (grün)
    for (let x = minX - 30; x <= maxX + 30; x += 26) {
      out.push({
        pos: [x + (r() - 0.5) * 18, -6 + r() * 3, -70 - r() * 8],
        scale: [30 + r() * 16, 16 + r() * 10, 24],
        color: '#5f9e57',
      })
    }
    // hintere Bergkette (bläulich, höher)
    for (let x = minX - 40; x <= maxX + 40; x += 40) {
      out.push({
        pos: [x + (r() - 0.5) * 24, -4 + r() * 4, -95 - r() * 12],
        scale: [46 + r() * 24, 30 + r() * 16, 30],
        color: '#7fa6bf',
      })
    }
    return out
  }, [minX, maxX])

  return (
    <>
      {hills.map((h, i) => (
        <mesh key={i} position={h.pos} scale={h.scale}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshBasicMaterial color={h.color} fog />
        </mesh>
      ))}
    </>
  )
}

const FLOWER_COLORS = ['#ff5a7a', '#ffd23f', '#ffffff', '#ff8fc4', '#7ac8ff']

// `hills`: prozedurale Hügel/Berge. Liegt ein gemalter Hintergrund vor, werden sie
// abgeschaltet — sonst würden sie das Artwork verdecken und dagegen arbeiten.
export function Scenery({ minX, maxX, hills = true }: { minX: number; maxX: number; hills?: boolean }) {
  const flowerTex = useMemo(() => makeFlowerTexture(), [])
  const data = useMemo(() => {
    const r = rand(4242)
    const flowers: { p: [number, number, number]; c: string; s: number }[] = []
    const rocks: { p: [number, number, number]; s: number; rot: number }[] = []
    const tufts: { p: [number, number, number]; s: number }[] = []
    const bushes: { p: [number, number, number]; s: number }[] = []
    for (let x = minX - 10; x <= maxX + 10; x += 1.1) {
      // vor und hinter dem Spielfeld verteilen (z), Spielachse (z≈0) freihalten
      const zBands = [3.5 + r() * 3, -3 - r() * 4, -8 - r() * 6]
      for (const z of zBands) {
        const roll = r()
        const px = x + (r() - 0.5) * 1.0
        if (roll < 0.5) flowers.push({ p: [px, 0.32, z], c: FLOWER_COLORS[(r() * FLOWER_COLORS.length) | 0], s: 0.34 + r() * 0.18 })
        else if (roll < 0.72) tufts.push({ p: [px, 0.16, z], s: 0.28 + r() * 0.2 })
        else if (roll < 0.86) rocks.push({ p: [px, 0.12, z], s: 0.2 + r() * 0.35, rot: r() * Math.PI })
        else if (roll < 0.95) bushes.push({ p: [px, 0.28, z], s: 0.4 + r() * 0.35 })
      }
    }
    return { flowers, rocks, tufts, bushes }
  }, [minX, maxX])

  // „Bewegte Welt": Graswelle + Blumen, die auf Fynnox reagieren (Referenz-Sheet, Abschnitt 3).
  const flowerRefs = useRef<(THREE.Object3D | null)[]>([])
  const tuftRefs = useRef<(THREE.Object3D | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    // Graswelle: versetzte Phase über x → die Welle läuft durchs Gras
    for (let i = 0; i < data.tufts.length; i++) {
      const o = tuftRefs.current[i]
      if (!o) continue
      const p = data.tufts[i].p
      o.rotation.z = Math.sin(t * 1.7 + p[0] * 0.55) * 0.13
    }

    // Blumen: sanfter Wind; kommt Fynnox nah, biegen sie sich von ihm weg und federn zurück
    for (let i = 0; i < data.flowers.length; i++) {
      const o = flowerRefs.current[i]
      if (!o) continue
      const f = data.flowers[i]
      const dx = player.x - f.p[0]
      const wind = Math.sin(t * 2.1 + f.p[0] * 0.7) * 0.1
      const inLane = Math.abs(f.p[2]) < 4.5 // nur Blumen nahe der Spielachse reagieren
      const d = Math.abs(dx)
      const push = inLane && d < 1.8 ? -Math.sign(dx) * 0.85 * (1 - d / 1.8) : 0
      o.rotation.z = wind + push
      o.position.y = f.p[1] + (push !== 0 ? 0.05 : 0)
    }
  })

  return (
    <>
      {hills && <DistantHills minX={minX} maxX={maxX} />}

      {/* Blumen: farbige 5-Blütenblatt-Blüte (zur Kamera gerichtet) */}
      <Instances limit={data.flowers.length}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={flowerTex} transparent alphaTest={0.4} side={2} toneMapped={false} />
        {data.flowers.map((f, i) => (
          <Instance key={i} ref={(el: THREE.Object3D | null) => { flowerRefs.current[i] = el }} position={f.p} scale={f.s} color={f.c} />
        ))}
      </Instances>

      {/* Grasbüschel (kleine grüne Kegel) */}
      <Instances limit={data.tufts.length}>
        <coneGeometry args={[0.5, 1, 6]} />
        <meshStandardMaterial color="#3f9a52" roughness={0.55} envMapIntensity={0.75} />
        {data.tufts.map((t, i) => (
          <Instance key={i} ref={(el: THREE.Object3D | null) => { tuftRefs.current[i] = el }} position={t.p} scale={[t.s, t.s * 1.6, t.s]} />
        ))}
      </Instances>

      {/* Steine */}
      <Instances limit={data.rocks.length} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#9a9488" roughness={1} flatShading />
        {data.rocks.map((rk, i) => (
          <Instance key={i} position={rk.p} scale={[rk.s, rk.s * 0.7, rk.s]} rotation={[0, rk.rot, 0]} />
        ))}
      </Instances>

      {/* Büsche (kleine runde Laubkugeln) */}
      <Instances limit={data.bushes.length} castShadow>
        <sphereGeometry args={[1, 12, 10]} />
        <meshStandardMaterial color="#3d9c52" roughness={0.5} envMapIntensity={0.75} />
        {data.bushes.map((bs, i) => (
          <Instance key={i} position={bs.p} scale={[bs.s * 1.3, bs.s, bs.s]} />
        ))}
      </Instances>
    </>
  )
}
