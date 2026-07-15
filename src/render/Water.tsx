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

// Weich auslaufendes Wasser-Sheet (transparente Ränder, fließende Streifen, oben zarter).
function makeFallTexture(): THREE.CanvasTexture {
  const W = 128, H = 256
  const c = document.createElement('canvas')
  c.width = W; c.height = H
  const ctx = c.getContext('2d')!
  // Grund: senkrechter Blau→Weiß-Verlauf
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0, 'rgba(150,205,240,0.55)')
  g.addColorStop(0.6, 'rgba(200,232,255,0.8)')
  g.addColorStop(1, 'rgba(240,250,255,0.95)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)
  // fließende Strähnen
  const rnd = (s => () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)(7)
  for (let i = 0; i < 14; i++) {
    const x = rnd() * W
    ctx.strokeStyle = `rgba(255,255,255,${0.25 + rnd() * 0.4})`
    ctx.lineWidth = 1 + rnd() * 2.5
    ctx.beginPath()
    ctx.moveTo(x, 0)
    for (let y = 0; y <= H; y += 24) ctx.lineTo(x + Math.sin(y * 0.05 + i) * 3, y)
    ctx.stroke()
  }
  // Ränder + Oberkante weich ausblenden (Alpha-Maske)
  ctx.globalCompositeOperation = 'destination-in'
  const gx = ctx.createLinearGradient(0, 0, W, 0)
  gx.addColorStop(0, 'rgba(0,0,0,0)'); gx.addColorStop(0.22, 'rgba(0,0,0,1)')
  gx.addColorStop(0.78, 'rgba(0,0,0,1)'); gx.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gx; ctx.fillRect(0, 0, W, H)
  const gy = ctx.createLinearGradient(0, 0, 0, H)
  gy.addColorStop(0, 'rgba(0,0,0,0.35)'); gy.addColorStop(0.15, 'rgba(0,0,0,1)')
  ctx.fillStyle = gy; ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'

  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(1, 1.6)
  return t
}

function Waterfall({ x }: { x: number }) {
  const tex = useMemo(() => makeFallTexture(), [])
  useFrame((_, delta) => { tex.offset.y -= delta * 1.1 })
  return (
    <group position={[x, 0, -54]}>
      {/* fallendes Wasser (Alpha kommt aus der Textur) */}
      <mesh position={[0, 8.5, 0]}>
        <planeGeometry args={[4.2, 18]} />
        <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} fog />
      </mesh>
      {/* Gischt/Nebel am Fuß */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[(i - 1) * 1.4, 0.6 + (i === 1 ? 0.5 : 0), 0.3]}>
          <circleGeometry args={[1.8 - i * 0.2, 18]} />
          <meshBasicMaterial color="#eef9ff" transparent opacity={0.5} depthWrite={false} toneMapped={false} fog />
        </mesh>
      ))}
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
