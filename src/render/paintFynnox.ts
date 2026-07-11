import * as THREE from 'three'

// Fynnox als gemalter 2D-Vektor-Cartoon (Seitenansicht, blickt nach rechts), passend
// zu den Referenzen: orange, SEHR große glänzende blaue Augen, cremefarbene Schnauze,
// blauer Anzug mit „P"-Abzeichen, buschige Rute. Alle Lauf-/Sprung-Posen werden aus
// EINEM Zeichencode abgeleitet → garantiert konsistent (kein AI/keine Sprite-Sheets).

export type Pose = 'idle' | 'run1' | 'run2' | 'run3' | 'jump' | 'fall'
export const POSES: Pose[] = ['idle', 'run1', 'run2', 'run3', 'jump', 'fall']

export const FOX_IMG = { w: 256, h: 340, footY: 306 }

const ORANGE = '#ff7d33'
const CREAM = '#ffe6c6'
const SUIT = '#2f6fe0'
const SUIT_D = '#2358bd'
const EYE = '#1b8be6'
const NAVY = '#16213c'

interface PoseParams {
  bob: number // vertikaler Körper-Versatz (px)
  legFront: number // Winkel Vorderbein (rad, + = nach vorn)
  legBack: number
  arm: number // Winkel Arm
  tail: number // Winkel Rute
  lean: number // Körperneigung (rad)
}

const PARAMS: Record<Pose, PoseParams> = {
  idle: { bob: 0, legFront: 0.06, legBack: -0.06, arm: 0.2, tail: -0.5, lean: 0 },
  run1: { bob: -4, legFront: 0.7, legBack: -0.7, arm: -0.6, tail: -0.9, lean: 0.12 },
  run2: { bob: -10, legFront: 0.15, legBack: 0.15, arm: 0.1, tail: -0.7, lean: 0.14 },
  run3: { bob: -4, legFront: -0.7, legBack: 0.7, arm: 0.6, tail: -0.9, lean: 0.12 },
  jump: { bob: -8, legFront: 0.5, legBack: 0.9, arm: -0.9, tail: -1.2, lean: 0.18 },
  fall: { bob: 2, legFront: -0.3, legBack: 0.5, arm: -1.3, tail: -0.6, lean: 0.05 },
}

function limb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  len: number,
  width: number,
  color: string,
  foot?: { r: number; color: string },
) {
  const fx = x + Math.sin(angle) * len
  const fy = y + Math.cos(angle) * len
  ctx.lineCap = 'round'
  // Outline
  ctx.strokeStyle = NAVY
  ctx.lineWidth = width + 7
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(fx, fy)
  ctx.stroke()
  // Füllung
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(fx, fy)
  ctx.stroke()
  if (foot) {
    ctx.fillStyle = NAVY
    ctx.beginPath()
    ctx.ellipse(fx + 6, fy, foot.r + 3, foot.r * 0.72 + 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = foot.color
    ctx.beginPath()
    ctx.ellipse(fx + 6, fy, foot.r, foot.r * 0.72, 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

function strokeFill(ctx: CanvasRenderingContext2D, fill: string, lw = 6) {
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = lw
  ctx.strokeStyle = NAVY
  ctx.stroke()
}

function drawFox(ctx: CanvasRenderingContext2D, pose: Pose) {
  const p = PARAMS[pose]
  ctx.clearRect(0, 0, FOX_IMG.w, FOX_IMG.h)
  ctx.lineJoin = 'round'

  const cx = 120
  const hipY = 210 + p.bob
  const bodyCx = cx
  const bodyCy = 168 + p.bob

  // ---- Rute (hinten) ----
  ctx.save()
  ctx.translate(bodyCx - 30, bodyCy + 6)
  ctx.rotate(p.tail)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-70, -6, -96, 34)
  ctx.quadraticCurveTo(-70, 30, -30, 26)
  ctx.closePath()
  strokeFill(ctx, ORANGE, 6)
  // creme Spitze
  ctx.beginPath()
  ctx.ellipse(-88, 30, 20, 18, 0.3, 0, Math.PI * 2)
  strokeFill(ctx, CREAM, 5)
  ctx.restore()

  // ---- Hinterbein ----
  limb(ctx, hipX(cx) - 4, hipY, p.legBack, 92, 20, SUIT_D, { r: 17, color: NAVY })

  // ---- Körper (blauer Anzug) ----
  ctx.save()
  ctx.translate(bodyCx, bodyCy)
  ctx.rotate(p.lean)
  ctx.beginPath()
  roundRect(ctx, -44, -52, 88, 104, 34)
  strokeFill(ctx, SUIT, 6)
  // Reißverschluss
  ctx.beginPath()
  ctx.moveTo(0, -46)
  ctx.lineTo(0, 46)
  ctx.strokeStyle = '#eef4ff'
  ctx.lineWidth = 4
  ctx.stroke()
  // „P"-Abzeichen
  ctx.beginPath()
  ctx.arc(0, -4, 22, 0, Math.PI * 2)
  strokeFill(ctx, '#ffffff', 4)
  ctx.beginPath()
  ctx.arc(0, -4, 15, 0, Math.PI * 2)
  ctx.fillStyle = ORANGE
  ctx.fill()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', 0, -2)
  ctx.restore()

  // ---- Vorderbein ----
  limb(ctx, hipX(cx) + 6, hipY, p.legFront, 94, 21, SUIT, { r: 18, color: NAVY })

  // ---- Arm (vorn) ----
  limb(ctx, bodyCx + 20, bodyCy - 30, p.arm + Math.PI * 0.5, 58, 16, SUIT_D, { r: 12, color: ORANGE })

  // ---- Kopf ----
  const hx = cx + 20
  const hy = 84 + p.bob
  // Ohren
  ear(ctx, hx - 26, hy - 44, -0.35)
  ear(ctx, hx + 20, hy - 50, 0.15)
  // Kopf-Kreis
  ctx.beginPath()
  ctx.arc(hx, hy, 60, 0, Math.PI * 2)
  strokeFill(ctx, ORANGE, 6)
  // Stirn-Glanz
  ctx.beginPath()
  ctx.arc(hx - 18, hy - 24, 26, Math.PI * 1.05, Math.PI * 1.6)
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 6
  ctx.stroke()
  // Schnauze (creme)
  ctx.beginPath()
  ctx.ellipse(hx + 40, hy + 16, 32, 26, 0, 0, Math.PI * 2)
  strokeFill(ctx, CREAM, 5)
  // Nase
  ctx.beginPath()
  ctx.ellipse(hx + 64, hy + 8, 9, 7, 0, 0, Math.PI * 2)
  ctx.fillStyle = '#20242e'
  ctx.fill()
  // Mund
  ctx.beginPath()
  ctx.moveTo(hx + 46, hy + 26)
  ctx.quadraticCurveTo(hx + 40, hy + 36, hx + 30, hy + 30)
  ctx.strokeStyle = NAVY
  ctx.lineWidth = 3
  ctx.stroke()
  // ---- Großes glänzendes blaues Auge (Seitenprofil → ein Auge) ----
  const ex = hx + 22
  const ey = hy - 6
  ctx.beginPath()
  ctx.ellipse(ex, ey, 24, 27, 0, 0, Math.PI * 2)
  strokeFill(ctx, '#ffffff', 4)
  ctx.beginPath()
  ctx.arc(ex + 4, ey + 2, 16, 0, Math.PI * 2)
  ctx.fillStyle = EYE
  ctx.fill()
  ctx.beginPath()
  ctx.arc(ex + 6, ey + 3, 8, 0, Math.PI * 2)
  ctx.fillStyle = '#0c1330'
  ctx.fill()
  ctx.beginPath()
  ctx.arc(ex + 1, ey - 3, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
}

function hipX(cx: number) {
  return cx
}

function ear(ctx: CanvasRenderingContext2D, x: number, y: number, tilt: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(tilt)
  ctx.beginPath()
  ctx.moveTo(0, 30)
  ctx.lineTo(-16, -34)
  ctx.lineTo(20, -18)
  ctx.closePath()
  strokeFill(ctx, ORANGE, 6)
  ctx.beginPath()
  ctx.moveTo(2, 20)
  ctx.lineTo(-6, -18)
  ctx.lineTo(10, -10)
  ctx.closePath()
  ctx.fillStyle = CREAM
  ctx.fill()
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

export function makeFynnoxFrames(): Record<Pose, THREE.CanvasTexture> {
  const out = {} as Record<Pose, THREE.CanvasTexture>
  for (const pose of POSES) {
    const c = document.createElement('canvas')
    c.width = FOX_IMG.w
    c.height = FOX_IMG.h
    const ctx = c.getContext('2d')!
    drawFox(ctx, pose)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.magFilter = THREE.LinearFilter
    t.minFilter = THREE.LinearMipmapLinearFilter
    t.generateMipmaps = true
    t.anisotropy = 8
    out[pose] = t
  }
  return out
}
