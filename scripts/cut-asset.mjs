// Freistell-Pipeline für Nutzer-Artwork auf Magenta-Hintergrund (#FF00FF).
//
// Aufruf:
//   node scripts/cut-asset.mjs "<eingabe.png>" <name> [maxHöhe=768]
// Ergebnis:
//   public/art/deco/<name>.webp  (RGBA, auf das Motiv zugeschnitten)
//
// Warum Magenta statt „transparent"? Bild-KIs liefern selten echtes Alpha. Magenta
// kommt in Naturmotiven nirgends vor und lässt sich sauber wegrechnen.
//
// Drei Schritte, die alle nötig sind:
//   1. KEY    — Abstand zu Magenta → Alpha, mit weichem Übergang (kein Treppenrand).
//   2. DESPILL— magenta-stichige Randpixel entfärben. Ohne das bekommt jedes Blatt
//               einen rosa Saum, sobald es vor dem hellen Himmel steht.
//   3. TRIM   — auf die Bounding-Box des Motivs zuschneiden. Spart Textur-Speicher
//               und macht die Skalierung im Spiel vorhersehbar.

import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'
import fs from 'node:fs'
import path from 'node:path'
const { chromium } = pkg

const [input, name, maxHArg] = process.argv.slice(2)
if (!input || !name) {
  console.error('Aufruf: node scripts/cut-asset.mjs "<eingabe.png>" <name> [maxHöhe]')
  process.exit(1)
}
const maxH = Number(maxHArg) || 768

const outDir = path.resolve('public/art/deco')
fs.mkdirSync(outDir, { recursive: true })

const b64 = fs.readFileSync(input).toString('base64')
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
await page.setContent('<body style="margin:0"></body>')

const result = await page.evaluate(async ({ b64, maxH }) => {
  const img = new Image()
  img.src = 'data:image/png;base64,' + b64
  await img.decode()

  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0)
  const id = ctx.getImageData(0, 0, c.width, c.height)
  const d = id.data

  // --- 1 + 2: Key & Despill ---
  // Schwellen bewusst großzügig: der Magenta-Grund ist einfarbig, das Motiv weit weg
  // davon. INNER = alles darunter ist sicher Hintergrund, OUTER = ab hier sicher Motiv.
  const INNER = 70
  const OUTER = 150
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const dist = Math.hypot(r - 255, g - 0, b - 255)

    let a = 255
    if (dist <= INNER) a = 0
    else if (dist < OUTER) a = Math.round(((dist - INNER) / (OUTER - INNER)) * 255)

    // Despill: nur echte Magenta-Stiche (rot UND blau über grün) werden entfärbt.
    // Braun (b < g) und Grün (r < g) bleiben dadurch unangetastet.
    if (r > g && b > g) {
      const excess = (r + b) / 2 - g
      if (excess > 0) {
        d[i] = Math.max(g, r - excess * 0.9)
        d[i + 2] = Math.max(g, b - excess * 0.9)
      }
    }
    d[i + 3] = a
  }
  ctx.putImageData(id, 0, 0)

  // --- 3: Trim auf die Bounding-Box (Alpha > 8) ---
  let minX = c.width, minY = c.height, maxX = -1, maxY = -1
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (d[(y * c.width + x) * 4 + 3] > 8) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }
  if (maxX < 0) return { error: 'Kein Motiv gefunden — ist der Hintergrund wirklich Magenta?' }

  const w = maxX - minX + 1
  const h = maxY - minY + 1
  const scale = Math.min(1, maxH / h)

  const o = document.createElement('canvas')
  o.width = Math.round(w * scale)
  o.height = Math.round(h * scale)
  const octx = o.getContext('2d')
  octx.imageSmoothingQuality = 'high'
  octx.drawImage(c, minX, minY, w, h, 0, 0, o.width, o.height)

  return {
    webp: o.toDataURL('image/webp', 0.9),
    src: [img.width, img.height],
    trimmed: [w, h],
    out: [o.width, o.height],
  }
}, { b64, maxH })

await browser.close()

if (result.error) {
  console.error('FEHLER:', result.error)
  process.exit(1)
}

const buf = Buffer.from(result.webp.split(',')[1], 'base64')
const outFile = path.join(outDir, name + '.webp')
fs.writeFileSync(outFile, buf)

console.log(`Quelle    ${result.src.join(' x ')}`)
console.log(`getrimmt  ${result.trimmed.join(' x ')}`)
console.log(`Ausgabe   ${result.out.join(' x ')}  →  ${(buf.length / 1024).toFixed(0)} KB`)
console.log(`Datei     ${outFile}`)
console.log(`Seitenverhältnis (Breite/Höhe): ${(result.out[0] / result.out[1]).toFixed(4)}`)
