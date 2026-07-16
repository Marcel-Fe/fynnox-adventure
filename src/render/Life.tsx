import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'

// „Bewegte Welt" — die Lebens-Ebene aus dem Referenz-Sheet (Abschnitt 3: Zustandssequenzen):
// Schmetterlinge, Blätterflug und startende Vögel. Alles instanciert (wenige Draw-Calls) und
// deterministisch angelegt; die Bewegung läuft je Gruppe in EINER useFrame-Schleife.

function rand(seed: number) {
  let s = seed >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
}

// --- Texturen (prozedural, keine Dateien nötig) ---
function makeButterflyTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  // zwei Flügelpaare
  ctx.beginPath(); ctx.ellipse(22, 24, 14, 10, -0.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(42, 24, 14, 10, 0.5, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(24, 42, 10, 8, 0.4, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(40, 42, 10, 8, -0.4, 0, Math.PI * 2); ctx.fill()
  ctx.fillStyle = '#3a2a1c' // Körper
  ctx.beginPath(); ctx.ellipse(32, 33, 2.6, 12, 0, 0, Math.PI * 2); ctx.fill()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function makeLeafTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(32, 6)
  ctx.quadraticCurveTo(58, 30, 32, 58)
  ctx.quadraticCurveTo(6, 30, 32, 6)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,0,0,0.22)' // Mittelrippe
  ctx.lineWidth = 2.5
  ctx.beginPath(); ctx.moveTo(32, 10); ctx.lineTo(32, 54); ctx.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

function makeBirdTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 64
  const ctx = c.getContext('2d')!
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(8, 38); ctx.quadraticCurveTo(22, 20, 32, 34)
  ctx.quadraticCurveTo(42, 20, 56, 38)
  ctx.stroke()
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

const BUTTERFLY_COLORS = ['#ffd23f', '#ff8fc4', '#7ac8ff', '#ff9a3f', '#c39aff']
const LEAF_COLORS = ['#5fae4e', '#8cc63f', '#e0a53a', '#d4762c']

// --- Schmetterlinge: flattern um einen Ankerpunkt herum ---
function Butterflies({ minX, maxX }: { minX: number; maxX: number }) {
  const tex = useMemo(() => makeButterflyTexture(), [])
  const data = useMemo(() => {
    const r = rand(5150)
    const out = []
    for (let x = minX; x <= maxX; x += 7) {
      out.push({
        // z hinter/neben der Spielachse — sonst flattern sie der Kamera vors Gesicht
        x: x + (r() - 0.5) * 5, y: 1.1 + r() * 1.9, z: -1.5 + (r() - 0.5) * 4,
        rx: 1.2 + r() * 1.8, rz: 0.5 + r() * 1.2,
        sp: 0.5 + r() * 0.5, ph: r() * Math.PI * 2,
        s: 0.3 + r() * 0.16, c: BUTTERFLY_COLORS[(r() * BUTTERFLY_COLORS.length) | 0],
      })
    }
    return out
  }, [minX, maxX])

  const refs = useRef<(THREE.Object3D | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < data.length; i++) {
      const o = refs.current[i]
      if (!o) continue
      const d = data[i]
      o.position.x = d.x + Math.sin(t * d.sp + d.ph) * d.rx
      o.position.y = d.y + Math.sin(t * d.sp * 2.3 + d.ph) * 0.3
      o.position.z = d.z + Math.cos(t * d.sp * 0.8 + d.ph) * d.rz
      // Flügelschlag: Breite pulsiert schnell
      o.scale.x = d.s * (0.3 + Math.abs(Math.sin(t * 14 + d.ph)) * 0.7)
      o.rotation.y = Math.cos(t * d.sp + d.ph) > 0 ? 0.3 : -0.3
    }
  })

  return (
    <Instances limit={data.length}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.35} side={THREE.DoubleSide} toneMapped={false} />
      {data.map((d, i) => (
        <Instance key={i} ref={(el: THREE.Object3D | null) => { refs.current[i] = el }} position={[d.x, d.y, d.z]} scale={d.s} color={d.c} />
      ))}
    </Instances>
  )
}

// --- Blätterflug: segeln langsam herab und beginnen oben neu ---
function Leaves({ minX, maxX }: { minX: number; maxX: number }) {
  const tex = useMemo(() => makeLeafTexture(), [])
  const TOP = 7
  const data = useMemo(() => {
    const r = rand(8123)
    const out = []
    for (let x = minX; x <= maxX; x += 4.5) {
      out.push({
        x: x + (r() - 0.5) * 4, z: -1 + (r() - 0.5) * 8,
        y0: r() * TOP, fall: 0.35 + r() * 0.4, sway: 0.5 + r() * 1.2,
        sp: 0.6 + r() * 0.8, ph: r() * Math.PI * 2,
        s: 0.16 + r() * 0.12, c: LEAF_COLORS[(r() * LEAF_COLORS.length) | 0],
      })
    }
    return out
  }, [minX, maxX])

  const refs = useRef<(THREE.Object3D | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < data.length; i++) {
      const o = refs.current[i]
      if (!o) continue
      const d = data[i]
      // endloses Herabsegeln (modulo) + seitliches Pendeln
      const y = TOP - ((d.y0 + t * d.fall) % TOP)
      o.position.set(d.x + Math.sin(t * d.sp + d.ph) * d.sway, y + 0.2, d.z)
      o.rotation.z = t * d.sp + d.ph
      o.rotation.y = Math.sin(t * d.sp * 0.7 + d.ph)
    }
  })

  return (
    <Instances limit={data.length}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.35} side={THREE.DoubleSide} toneMapped={false} />
      {data.map((d, i) => (
        <Instance key={i} ref={(el: THREE.Object3D | null) => { refs.current[i] = el }} position={[d.x, d.y0, d.z]} scale={d.s} color={d.c} />
      ))}
    </Instances>
  )
}

// --- Vögel: ziehen hoch am Himmel vorbei und tauchen wieder auf ---
function Birds({ minX, maxX }: { minX: number; maxX: number }) {
  const tex = useMemo(() => makeBirdTexture(), [])
  const span = maxX - minX + 60
  const data = useMemo(() => {
    const r = rand(2468)
    const out = []
    for (let i = 0; i < 9; i++) {
      out.push({
        x0: minX - 30 + r() * span, y: 9 + r() * 5, z: -24 - r() * 14,
        sp: 1.4 + r() * 1.6, ph: r() * Math.PI * 2, s: 0.6 + r() * 0.5,
      })
    }
    return out
  }, [minX, span])

  const refs = useRef<(THREE.Object3D | null)[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    for (let i = 0; i < data.length; i++) {
      const o = refs.current[i]
      if (!o) continue
      const d = data[i]
      o.position.x = minX - 30 + ((d.x0 - minX + 30 + t * d.sp) % span)
      o.position.y = d.y + Math.sin(t * 0.8 + d.ph) * 0.5
      // Flügelschlag
      o.scale.y = d.s * (0.55 + Math.abs(Math.sin(t * 6 + d.ph)) * 0.45)
    }
  })

  return (
    <Instances limit={data.length}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent alphaTest={0.3} side={THREE.DoubleSide} color="#3f4d5c" toneMapped={false} fog={false} />
      {data.map((d, i) => (
        <Instance key={i} ref={(el: THREE.Object3D | null) => { refs.current[i] = el }} position={[d.x0, d.y, d.z]} scale={d.s} />
      ))}
    </Instances>
  )
}

export function Life({ minX, maxX }: { minX: number; maxX: number }) {
  return (
    <>
      <Butterflies minX={minX} maxX={maxX} />
      <Leaves minX={minX} maxX={maxX} />
      <Birds minX={minX} maxX={maxX} />
    </>
  )
}
