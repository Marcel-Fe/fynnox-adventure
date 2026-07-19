// Zerlegt ein Asset-BLATT (mehrere Objekte nebeneinander auf Magenta) in Einzeldateien.
//
// Aufruf:
//   node scripts/cut-sheet.mjs "<blatt.png>" name1,name2,name3,... [maxHöhe=384]
// Ergebnis:
//   public/art/deco/<name>.webp  je Objekt
//
// Wie die Trennung funktioniert: Nach dem Magenta-Key wird je Bildspalte gezählt, wie
// viele Pixel zum Motiv gehören. Spalten ohne Motiv-Pixel sind Lücken zwischen den
// Objekten — daraus ergeben sich die Segmente. Das ist robust, solange die Objekte sich
// nicht überlappen (steht so im Prompt-Paket) und braucht keine Bildanalyse-Bibliothek.
//
// Ausgegeben wird außerdem je Objekt das Seitenverhältnis und die relative Größe im
// Blatt — beides brauche ich, um die Deko im Spiel maßstabsgerecht zu setzen.

import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'
import fs from 'node:fs'
import path from 'node:path'
const { chromium } = pkg

const [input, namesArg, maxHArg] = process.argv.slice(2)
if (!input || !namesArg) {
  console.error('Aufruf: node scripts/cut-sheet.mjs "<blatt.png>" name1,name2,... [maxHöhe]')
  process.exit(1)
}
const names = namesArg.split(',').map((s) => s.trim()).filter(Boolean)
const maxH = Number(maxHArg) || 384

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

  // Key + Despill (identisch zu cut-asset.mjs)
  const INNER = 70
  const OUTER = 150
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2]
    const dist = Math.hypot(r - 255, g, b - 255)
    let a = 255
    if (dist <= INNER) a = 0
    else if (dist < OUTER) a = Math.round(((dist - INNER) / (OUTER - INNER)) * 255)
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

  // Spalten-Projektion → Segmentgrenzen
  const colFilled = new Array(c.width).fill(0)
  for (let x = 0; x < c.width; x++) {
    let n = 0
    for (let y = 0; y < c.height; y++) if (d[(y * c.width + x) * 4 + 3] > 24) n++
    colFilled[x] = n
  }

  const MIN_W = 20 // schmalere Segmente sind Rauschen, kein Objekt
  const segs = []
  let start = -1
  for (let x = 0; x < c.width; x++) {
    const on = colFilled[x] > 0
    if (on && start < 0) start = x
    else if (!on && start >= 0) {
      if (x - start >= MIN_W) segs.push([start, x - 1])
      start = -1
    }
  }
  if (start >= 0 && c.width - start >= MIN_W) segs.push([start, c.width - 1])

  // Je Segment vertikal trimmen und exportieren
  const out = []
  for (const [x0, x1] of segs) {
    let minY = c.height, maxY = -1
    for (let y = 0; y < c.height; y++) {
      for (let x = x0; x <= x1; x++) {
        if (d[(y * c.width + x) * 4 + 3] > 8) {
          if (y < minY) minY = y
          if (y > maxY) maxY = y
          break
        }
      }
    }
    if (maxY < 0) continue
    const w = x1 - x0 + 1
    const h = maxY - minY + 1
    const scale = Math.min(1, maxH / h)
    const o = document.createElement('canvas')
    o.width = Math.max(1, Math.round(w * scale))
    o.height = Math.max(1, Math.round(h * scale))
    const octx = o.getContext('2d')
    octx.imageSmoothingQuality = 'high'
    octx.drawImage(c, x0, minY, w, h, 0, 0, o.width, o.height)
    out.push({ webp: o.toDataURL('image/webp', 0.9), src: [w, h], out: [o.width, o.height] })
  }
  return { segs: segs.length, sheetH: c.height, out }
}, { b64, maxH })

await browser.close()

console.log(`Gefundene Objekte: ${result.segs} (erwartet: ${names.length})`)
if (result.segs !== names.length) {
  console.log('WARNUNG: Anzahl passt nicht — bitte Namensliste oder Blatt prüfen.')
}

result.out.forEach((o, i) => {
  const name = names[i] ?? `unbenannt_${i + 1}`
  const buf = Buffer.from(o.webp.split(',')[1], 'base64')
  fs.writeFileSync(path.join(outDir, name + '.webp'), buf)
  const aspect = (o.out[0] / o.out[1]).toFixed(4)
  // relHeight = Höhe im Blatt relativ zum größten Objekt → Anhalt für den Weltmaßstab
  const relH = (o.src[1] / Math.max(...result.out.map((q) => q.src[1]))).toFixed(3)
  console.log(
    `${String(i + 1).padStart(2)} ${name.padEnd(12)} ${String(o.out[0]).padStart(4)}x${String(o.out[1]).padEnd(4)} ` +
    `aspect ${aspect}  relH ${relH}  ${(buf.length / 1024).toFixed(0)} KB`,
  )
})
