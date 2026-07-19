// Bereitet ein Panorama als Parallax-Hintergrund auf: skalieren + WebP.
//
// Aufruf:
//   node scripts/prep-bg.mjs "<panorama.png>" <welt> [breite=2400]
// Ergebnis:
//   public/art/bg/<welt>/far.webp
//
// Gibt außerdem das Seitenverhältnis aus — das braucht die Backdrop-Justierung, weil
// die Plane ihre Breite aus dem Seitenverhältnis ableitet.

import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'
import fs from 'node:fs'
import path from 'node:path'
const { chromium } = pkg

const [input, world, widthArg] = process.argv.slice(2)
if (!input || !world) {
  console.error('Aufruf: node scripts/prep-bg.mjs "<panorama.png>" <welt> [breite]')
  process.exit(1)
}
const outW = Number(widthArg) || 2400

const outDir = path.resolve('public/art/bg', world)
fs.mkdirSync(outDir, { recursive: true })

const b64 = fs.readFileSync(input).toString('base64')
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] })
const page = await browser.newPage()
await page.setContent('<body style="margin:0"></body>')

const res = await page.evaluate(async ({ b64, outW }) => {
  const img = new Image()
  img.src = 'data:image/png;base64,' + b64
  await img.decode()
  const scale = Math.min(1, outW / img.width)
  const c = document.createElement('canvas')
  c.width = Math.round(img.width * scale)
  c.height = Math.round(img.height * scale)
  const ctx = c.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, c.width, c.height)
  // Qualität 0.86: bei Landschaften optisch verlustfrei, aber deutlich kleiner.
  return { webp: c.toDataURL('image/webp', 0.86), src: [img.width, img.height], out: [c.width, c.height] }
}, { b64, outW })

await browser.close()

const buf = Buffer.from(res.webp.split(',')[1], 'base64')
const file = path.join(outDir, 'far.webp')
fs.writeFileSync(file, buf)

console.log(`Quelle   ${res.src.join(' x ')}`)
console.log(`Ausgabe  ${res.out.join(' x ')}  →  ${(buf.length / 1024).toFixed(0)} KB`)
console.log(`Datei    ${file}`)
console.log(`Seitenverhältnis (Breite/Höhe): ${(res.out[0] / res.out[1]).toFixed(3)}`)
