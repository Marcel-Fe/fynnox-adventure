// Schneidet feste Rechteck-Regionen aus einem Konzept-Blatt heraus (z. B. die
// Welt-Kacheln aus einer Übersicht) und speichert sie als WebP.
//
// Aufruf:
//   node scripts/cut-region.mjs "<blatt.png>" <zielordner> <name:x,y,w,h> [...]
// Beispiel:
//   node scripts/cut-region.mjs sheet.png art/previews wald:10,28,248,162
//
// Kein Freistellen, kein Trim — die Regionen sind vollflächige Bildausschnitte.

import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'
import fs from 'node:fs'
import path from 'node:path'
const { chromium } = pkg

const [input, target, ...regionArgs] = process.argv.slice(2)
if (!input || !target || regionArgs.length === 0) {
  console.error('Aufruf: node scripts/cut-region.mjs "<blatt.png>" <zielordner> <name:x,y,w,h> ...')
  process.exit(1)
}

const regions = regionArgs.map((a) => {
  const [name, nums] = a.split(':')
  const [x, y, w, h] = nums.split(',').map(Number)
  return { name, x, y, w, h }
})

const outDir = path.resolve(target)
fs.mkdirSync(outDir, { recursive: true })

const b64 = fs.readFileSync(input).toString('base64')
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
await page.setContent('<body style="margin:0"></body>')

const out = await page.evaluate(async ({ b64, regions }) => {
  const img = new Image()
  img.src = 'data:image/png;base64,' + b64
  await img.decode()

  // Zielbreite großzügig: die Menü-Kacheln werden auf Retina-Displays doppelt so
  // groß dargestellt wie ihre CSS-Breite.
  const OUT_W = 480
  return regions.map((r) => {
    const c = document.createElement('canvas')
    const scale = OUT_W / r.w
    c.width = OUT_W
    c.height = Math.round(r.h * scale)
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, r.x, r.y, r.w, r.h, 0, 0, c.width, c.height)
    return { name: r.name, webp: c.toDataURL('image/webp', 0.88), size: [c.width, c.height] }
  })
}, { b64, regions })

await browser.close()

for (const o of out) {
  const buf = Buffer.from(o.webp.split(',')[1], 'base64')
  fs.writeFileSync(path.join(outDir, o.name + '.webp'), buf)
  console.log(`${o.name.padEnd(18)} ${o.size.join(' x ').padEnd(12)} ${(buf.length / 1024).toFixed(0)} KB`)
}
