import * as THREE from 'three'

// Prozedurale, „gemalte" Canvas-Texturen für den 2,5D-Look (kein AI/kein Datei-Asset).
// Alle Layer werden nahtlos horizontal gekachelt (linke Kante == rechte Kante), damit
// der Parallax endlos scrollen kann. Bewusst flacher Cartoon-Vektor-Stil (satte Farben,
// weiche Silhouetten) passend zu den Fynnox-Referenzen.

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return [c, ctx]
}

function toTexture(c: HTMLCanvasElement, repeat = true): THREE.CanvasTexture {
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  if (repeat) {
    t.wrapS = THREE.RepeatWrapping
    t.wrapT = THREE.ClampToEdgeWrapping
  }
  t.magFilter = THREE.LinearFilter
  t.minFilter = THREE.LinearMipmapLinearFilter
  t.generateMipmaps = true
  t.anisotropy = 8
  return t
}

// Deterministischer Pseudo-Zufall (kein Math.random → stabile, reproduzierbare Kulisse).
function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 0xffffffff
  }
}

// Weiche, geschichtete Hügel-/Silhouetten-Reihe über die volle Breite (nahtlos).
function drawHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  baseY: number,
  amp: number,
  color: string,
  seed: number,
  step = 120,
) {
  const r = rng(seed)
  const pts: number[] = []
  for (let x = 0; x <= w; x += step) pts.push(baseY - r() * amp)
  // Naht schließen: letzter Punkt == erster
  pts[pts.length - 1] = pts[0]
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, ctx.canvas.height)
  ctx.lineTo(0, pts[0])
  for (let i = 1; i < pts.length; i++) {
    const x0 = (i - 1) * step
    const x1 = i * step
    const xm = (x0 + x1) / 2
    ctx.quadraticCurveTo(x0, pts[i - 1], xm, (pts[i - 1] + pts[i]) / 2)
    ctx.quadraticCurveTo(x1, pts[i], x1, pts[i])
  }
  ctx.lineTo(w, ctx.canvas.height)
  ctx.closePath()
  ctx.fill()
}

// Ein stilisierter Nadelbaum (flache Cartoon-Silhouette mit Outline).
function drawTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  baseY: number,
  h: number,
  crown: string,
  crownDark: string,
  trunk: string,
  outline: string,
) {
  const w = h * 0.5
  // Stamm
  ctx.fillStyle = trunk
  ctx.fillRect(x - w * 0.07, baseY - h * 0.22, w * 0.14, h * 0.22)
  // Krone: drei gestapelte Dreiecke
  const tiers = 3
  for (let i = 0; i < tiers; i++) {
    const ty = baseY - h * 0.15 - (i * h) / (tiers + 0.5)
    const tw = (w * (tiers - i)) / tiers
    const th = h / (tiers - 0.2)
    ctx.beginPath()
    ctx.moveTo(x, ty - th)
    ctx.lineTo(x + tw, ty)
    ctx.lineTo(x - tw, ty)
    ctx.closePath()
    ctx.fillStyle = crown
    ctx.fill()
    // linke Hälfte etwas dunkler → Volumen
    ctx.beginPath()
    ctx.moveTo(x, ty - th)
    ctx.lineTo(x, ty)
    ctx.lineTo(x - tw, ty)
    ctx.closePath()
    ctx.fillStyle = crownDark
    ctx.fill()
    ctx.lineWidth = Math.max(2, h * 0.02)
    ctx.strokeStyle = outline
    ctx.beginPath()
    ctx.moveTo(x, ty - th)
    ctx.lineTo(x + tw, ty)
    ctx.lineTo(x - tw, ty)
    ctx.closePath()
    ctx.stroke()
  }
}

export interface ParallaxTextures {
  sky: THREE.CanvasTexture
  far: THREE.CanvasTexture
  mid: THREE.CanvasTexture
  near: THREE.CanvasTexture
}

// Vier gemalte Wald-Ebenen. Himmel ist voll gefüllt (Verlauf + Sonne), die drei
// Baum-Ebenen sind transparent (nur Silhouetten) und werden übereinander gelegt.
export function makeForestParallax(): ParallaxTextures {
  // ---- Himmel (full-bleed) ----
  const [skyC, sky] = makeCanvas(1024, 1024)
  const g = sky.createLinearGradient(0, 0, 0, 1024)
  g.addColorStop(0, '#7ec6ff')
  g.addColorStop(0.55, '#bfe6ff')
  g.addColorStop(1, '#e7f7ff')
  sky.fillStyle = g
  sky.fillRect(0, 0, 1024, 1024)
  // Sonne mit weichem Schein
  const sun = sky.createRadialGradient(820, 220, 20, 820, 220, 260)
  sun.addColorStop(0, 'rgba(255,250,225,0.95)')
  sun.addColorStop(0.3, 'rgba(255,244,200,0.55)')
  sun.addColorStop(1, 'rgba(255,244,200,0)')
  sky.fillStyle = sun
  sky.fillRect(0, 0, 1024, 1024)
  // weiche Wolken
  const cr = rng(7)
  sky.fillStyle = 'rgba(255,255,255,0.85)'
  for (let i = 0; i < 6; i++) {
    const cx = cr() * 1024
    const cy = 120 + cr() * 260
    for (let b = 0; b < 5; b++) {
      const bx = cx + (b - 2) * 55 + cr() * 20
      const rr = 34 + cr() * 26
      sky.beginPath()
      sky.arc(bx, cy, rr, 0, Math.PI * 2)
      sky.fill()
    }
  }
  const skyTex = toTexture(skyC, true)
  skyTex.wrapS = THREE.RepeatWrapping

  const W = 1024
  const H = 512

  // ---- Ferne Baumreihe (blau-grün gedämpft, Dunst) ----
  const [farC, far] = makeCanvas(W, H)
  drawHills(far, W, H * 0.92, 60, '#8fb7a0', 11)
  const fr = rng(21)
  for (let x = 24; x < W - 8; x += 46) {
    const jx = x + fr() * 20
    const hh = 150 + fr() * 60
    drawTree(far, jx, H * 0.94, hh, '#7fae95', '#6c9a82', '#6f8f84', '#5c8778')
  }

  // ---- Mittlere Baumreihe (satteres Grün) ----
  const [midC, mid] = makeCanvas(W, H)
  drawHills(mid, W, H * 0.95, 40, '#4f9d5a', 33)
  const mr = rng(45)
  for (let x = 30; x < W - 8; x += 74) {
    const jx = x + mr() * 26
    const hh = 230 + mr() * 90
    drawTree(mid, jx, H * 0.96, hh, '#3f9a52', '#2f7d41', '#7a5230', '#245e33')
  }

  // ---- Vordergrund (dunkel, Büsche + Grasnarbe) ----
  const [nearC, near] = makeCanvas(W, H)
  drawHills(near, W, H * 0.98, 26, '#2f7d43', 57, 90)
  const nr = rng(83)
  for (let x = 20; x < W - 8; x += 60) {
    const jx = x + nr() * 24
    const hh = 300 + nr() * 120
    drawTree(near, jx, H * 1.02, hh, '#2f8347', '#1f6534', '#6b4726', '#164f28')
  }
  // Dichte Unterholz-Hecke am Fuß → schließt die Lücke zum Boden (kein Himmel-Durchblick).
  drawHills(near, W, H * 0.9, 90, '#256b39', 91, 64)
  drawHills(near, W, H * 0.98, 70, '#1c5730', 137, 52)
  // Flache, geschlossene Deckhecke: Täler bleiben über der Graslinie → kein Sky-Sliver.
  drawHills(near, W, H * 0.83, 34, '#1f6534', 211, 44)

  return {
    sky: skyTex,
    far: toTexture(farC, true),
    mid: toTexture(midC, true),
    near: toTexture(nearC, true),
  }
}

// Weltfeste Busch-Bank am Boden (bumpige Hecke, oben transparent). Schließt bündig zur
// Graslinie und verdeckt den perspektivischen Spalt zwischen Kulisse und Boden.
export function makeBankTexture(): THREE.CanvasTexture {
  const W = 512
  const H = 256
  const [c, ctx] = makeCanvas(W, H)
  // Solide Basis in der unteren Hälfte → unterhalb der Buckel keinerlei Durchblick.
  ctx.fillStyle = '#237038'
  ctx.fillRect(0, H * 0.5, W, H * 0.5)
  drawHills(ctx, W, H * 0.52, 58, '#2a7540', 11, 66)
  drawHills(ctx, W, H * 0.62, 46, '#1f6534', 41, 52)
  drawHills(ctx, W, H * 0.44, 30, '#2f7d43', 111, 48) // geschlossene Deckhecke (keine Täler bis zum Himmel)
  // ein paar Highlights auf den Buckeln
  const r = rng(3)
  ctx.fillStyle = 'rgba(120,210,140,0.35)'
  for (let i = 0; i < 30; i++) {
    ctx.beginPath()
    ctx.ellipse(r() * W, H * 0.62 + r() * H * 0.3, 10 + r() * 8, 6 + r() * 5, 0, 0, Math.PI * 2)
    ctx.fill()
  }
  const t = toTexture(c, true)
  t.wrapS = THREE.RepeatWrapping
  return t
}

// Gemaltes Gras-Plattform-Tile (Erde + Grasnarbe oben), nahtlos horizontal kachelbar.
export function makePlatformTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 192)
  // Erd-Körper
  const gd = ctx.createLinearGradient(0, 40, 0, 192)
  gd.addColorStop(0, '#a6713e')
  gd.addColorStop(1, '#7a5230')
  ctx.fillStyle = gd
  ctx.fillRect(0, 30, 256, 162)
  // kleine Erd-Sprenkel
  const r = rng(5)
  ctx.fillStyle = 'rgba(60,38,20,0.35)'
  for (let i = 0; i < 40; i++) {
    ctx.beginPath()
    ctx.arc(r() * 256, 60 + r() * 120, 3 + r() * 4, 0, Math.PI * 2)
    ctx.fill()
  }
  // Grasnarbe oben
  const gg = ctx.createLinearGradient(0, 0, 0, 46)
  gg.addColorStop(0, '#57c46b')
  gg.addColorStop(1, '#2f9e54')
  ctx.fillStyle = gg
  ctx.fillRect(0, 0, 256, 40)
  // Gras-Zacken an der Unterkante der Narbe
  ctx.fillStyle = '#2f9e54'
  for (let x = 0; x <= 256; x += 16) {
    ctx.beginPath()
    ctx.moveTo(x, 40)
    ctx.lineTo(x + 8, 54)
    ctx.lineTo(x + 16, 40)
    ctx.closePath()
    ctx.fill()
  }
  // Highlight-Linie
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 6)
  ctx.lineTo(256, 6)
  ctx.stroke()
  const t = toTexture(c, true)
  t.wrapS = THREE.RepeatWrapping
  return t
}

// Durchgehender gemalter Bodenstreifen (dünne Gras-Narbe oben, tiefe Erde darunter),
// horizontal kachelbar. Hoch (512) → Grasband bleibt dünn, Erde füllt den Bildschirm.
export function makeGroundStripTexture(): THREE.CanvasTexture {
  const HH = 512
  const [c, ctx] = makeCanvas(256, HH)
  const gd = ctx.createLinearGradient(0, 70, 0, HH)
  gd.addColorStop(0, '#7a5230')
  gd.addColorStop(1, '#4a3018')
  ctx.fillStyle = gd
  ctx.fillRect(0, 0, 256, HH)
  const gg = ctx.createLinearGradient(0, 0, 0, 66)
  gg.addColorStop(0, '#5cc46f')
  gg.addColorStop(1, '#2f9e54')
  ctx.fillStyle = gg
  ctx.fillRect(0, 0, 256, 56)
  ctx.fillStyle = '#2f9e54'
  for (let x = 0; x <= 256; x += 20) {
    ctx.beginPath()
    ctx.moveTo(x, 56)
    ctx.lineTo(x + 10, 74)
    ctx.lineTo(x + 20, 56)
    ctx.closePath()
    ctx.fill()
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(0, 8)
  ctx.lineTo(256, 8)
  ctx.stroke()
  const r = rng(9)
  ctx.fillStyle = 'rgba(40,26,14,0.35)'
  for (let i = 0; i < 90; i++) {
    ctx.beginPath()
    ctx.arc(r() * 256, 100 + r() * (HH - 130), 3 + r() * 6, 0, Math.PI * 2)
    ctx.fill()
  }
  const t = toTexture(c, true)
  t.wrapS = THREE.RepeatWrapping
  return t
}
