import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Animiertes Wasser als Kulisse hinter den Bäumen: ein breiter Fluss/See mit driftenden
// Glanz-Wellen + zwei Wasserfälle als Blickfang. Liegt weiter hinten als alle Bäume.

function makeWaterTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 0, 256)
  g.addColorStop(0, '#4f9fe0')
  g.addColorStop(1, '#2f7bc8')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 256)
  ctx.strokeStyle = 'rgba(210,240,255,0.6)'
  ctx.lineWidth = 3
  for (let y = 8; y < 256; y += 24) {
    ctx.beginPath()
    for (let x = 0; x <= 256; x += 16) {
      const yy = y + Math.sin(x * 0.08) * 5
      if (x === 0) ctx.moveTo(x, yy)
      else ctx.lineTo(x, yy)
    }
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(10, 6)
  return t
}

function makeFallTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 128
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#bfe6ff'
  ctx.fillRect(0, 0, 64, 128)
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'
  ctx.lineWidth = 3
  for (let x = 6; x < 64; x += 10) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, 128)
    ctx.stroke()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1, 2)
  return t
}

function Waterfall({ x }: { x: number }) {
  const tex = useMemo(() => makeFallTexture(), [])
  useFrame((_, delta) => { tex.offset.y -= delta * 1.2 })
  return (
    <group position={[x, 0, -54]}>
      {/* fallendes Wasser */}
      <mesh position={[0, 8, 0]}>
        <planeGeometry args={[5, 17]} />
        <meshBasicMaterial map={tex} transparent opacity={0.92} toneMapped={false} fog />
      </mesh>
      {/* Schaum/Gischt am Fuß */}
      <mesh position={[0, 0.3, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.4, 20]} />
        <meshBasicMaterial color="#eaf7ff" transparent opacity={0.85} toneMapped={false} fog />
      </mesh>
    </group>
  )
}

export function Water({ minX, maxX }: { minX: number; maxX: number }) {
  const tex = useMemo(() => makeWaterTexture(), [])
  const w = maxX - minX + 160
  const cx = (minX + maxX) / 2

  useFrame((_, delta) => {
    tex.offset.y -= delta * 0.05
    tex.offset.x += delta * 0.02
  })

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.06, -47]}>
        <planeGeometry args={[w, 26]} />
        <meshStandardMaterial map={tex} color="#5aa8e8" transparent opacity={0.96} roughness={0.16} metalness={0.25} />
      </mesh>
      <Waterfall x={minX + (maxX - minX) * 0.32} />
      <Waterfall x={minX + (maxX - minX) * 0.72} />
    </>
  )
}
