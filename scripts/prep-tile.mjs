// Bereitet eine kachelbare Material-Textur auf (kein Freistellen — die Kachel ist
// vollflächig). Skaliert, prüft die Nahtlosigkeit und speichert als WebP.
//
// Aufruf:
//   node scripts/prep-tile.mjs "<kachel.png>" <name> [größe=512]
// Ergebnis:
//   public/art/deco/<name>.webp
//
// Die Nahtprüfung vergleicht die linke mit der rechten Randspalte. Kacheln Bild-KIs
// nicht sauber, entsteht im Spiel alle paar Meter eine sichtbare Kante — besser hier
// messen als später im Screenshot rätseln.

import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'
import fs from 'node:fs'
import path from 'node:path'
const { chromium } = pkg

const [input, name, sizeArg] = process.argv.slice(2)
if (!input || !name) {
  console.error('Aufruf: node scripts/prep-tile.mjs "<kachel.png>" <name> [größe]')
  process.exit(1)
}
const size = Number(sizeArg) || 512

const outDir = path.resolve('public/art/deco')
fs.mkdirSync(outDir, { recursive: true })

const b64 = fs.readFileSync(input).toString('base64')
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
await page.setContent('<body style="margin:0"></body>')

const res = await page.evaluate(async ({ b64, size }) => {
  const img = new Image()
  img.src = 'data:image/png;base64,' + b64
  await img.decode()

  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, size, size)

  // Nahtprüfung: mittlerer Farbabstand zwischen linker und rechter Randspalte.
  const left = ctx.getImageData(0, 0, 1, size).data
  const right = ctx.getImageData(size - 1, 0, 1, size).data
  let sum = 0
  for (let y = 0; y < size; y++) {
    const i = y * 4
    sum += Math.hypot(left[i] - right[i], left[i + 1] - right[i + 1], left[i + 2] - right[i + 2])
  }
  const seam = sum / size

  return { webp: c.toDataURL('image/webp', 0.88), seam, src: [img.width, img.height] }
}, { b64, size })

await browser.close()

const buf = Buffer.from(res.webp.split(',')[1], 'base64')
fs.writeFileSync(path.join(outDir, name + '.webp'), buf)

console.log(`Quelle   ${res.src.join(' x ')}  →  ${size} x ${size}, ${(buf.length / 1024).toFixed(0)} KB`)
console.log(`Naht     Randabstand ${res.seam.toFixed(1)} / 441`)
console.log(
  res.seam < 30
    ? '         → kachelt sauber.'
    : res.seam < 70
      ? '         → leichte Naht, bei organischer Struktur vertretbar.'
      : '         → DEUTLICHE NAHT: Kachelung wird im Spiel sichtbar sein.',
)
