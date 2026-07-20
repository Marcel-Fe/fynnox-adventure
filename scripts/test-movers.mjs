// Rechnerischer Test der beweglichen Plattformen — ohne Browser.
//
// Warum nicht per Screenshot? Genau das ist vorher gescheitert: headless (SwiftShader)
// rendert zu wenige Frames, der Spieler hing bei y 7,85 mit onGround:false. Der
// Mitnahme-Effekt war damit nie bewiesen.
//
// Hier laufen stattdessen die ECHTEN Funktionen aus dem Spiel in derselben Reihenfolge
// wie im Bild: erst `stepMovers` (useFrame-Priorität -2), dann `stepPlayer` (Priorität 0).
// Rolldown (steckt in Vite 8) übersetzt das TypeScript im Speicher — keine neue Abhängigkeit.
//
// Aufruf:  node scripts/test-movers.mjs

import { rolldown } from 'rolldown'

// Bündelt eine TS-Datei im Speicher und importiert sie als ES-Modul.
async function load(entry) {
  const b = await rolldown({ input: entry, logLevel: 'silent' })
  const { output } = await b.generate({ format: 'esm' })
  await b.close()
  return import('data:text/javascript;base64,' + Buffer.from(output[0].code).toString('base64'))
}

const { stepMovers, buildMovers } = await load('src/game/movers.ts')
const { stepPlayer } = await load('src/game/physics.ts')

const DT = 1 / 60
const IDLE = { left: false, right: false, jump: false, dash: false }

function newPlayer(x, y) {
  return { x, y, vx: 0, vy: 0, onGround: true, facing: 1, dashTime: 0, dashCd: 0, checkpointX: x }
}

// Ein Lauf: Fynnox steht mittig auf dem Mover, drückt keine Taste, `frames` Frames lang.
// `carry=false` schaltet die Mitnahme ab (Plattform bewegt sich, Spieler wird nicht
// mitgenommen) — das ist die Gegenprobe: der Test muss dabei FEHLSCHLAGEN.
function run(def, frames, carry) {
  const defs = [def]
  const live = buildMovers(defs)
  const p = newPlayer(live[0].x + live[0].w / 2, live[0].y + live[0].h)

  let t = 0
  let maxDriftX = 0
  let maxDriftY = 0
  let lostGround = 0

  for (let i = 0; i < frames; i++) {
    t += DT
    if (carry) {
      stepMovers(defs, live, p, t)
    } else {
      const off = Math.sin(t * def.speed + (def.phase ?? 0)) * def.range
      if (def.axis === 'x') live[0].x = def.x + off
      else live[0].y = def.y + off
    }
    stepPlayer(p, IDLE, live, DT)

    maxDriftX = Math.max(maxDriftX, Math.abs(p.x - (live[0].x + live[0].w / 2)))
    maxDriftY = Math.max(maxDriftY, Math.abs(p.y - (live[0].y + live[0].h)))
    if (!p.onGround) lostGround++
  }
  return { maxDriftX, maxDriftY, lostGround, p, plat: live[0] }
}

const X_MOVER = { x: 20, y: 3.4, w: 3, h: 0.5, axis: 'x', range: 3.0, speed: 0.9 }
const Y_MOVER = { x: 47, y: 3.4, w: 3, h: 0.5, axis: 'y', range: 1.7, speed: 1.0 }

const FRAMES = 600 // 10 Sekunden — deckt bei speed ~1 mehrere volle Pendel ab
const checks = []

// 1) x-Mover: Fynnox muss seitlich mitwandern.
{
  const r = run(X_MOVER, FRAMES, true)
  checks.push({
    name: 'x-Mover trägt Fynnox seitlich mit',
    ok: r.maxDriftX < 0.02 && r.lostGround === 0,
    info: `Abweichung zur Plattform-Mitte max ${r.maxDriftX.toFixed(4)} (Grenze 0.02), ${r.lostGround} Frames ohne Boden`,
  })
}

// 2) Gegenprobe: ohne Mitnahme MUSS Fynnox zurückbleiben und herunterfallen.
{
  const r = run(X_MOVER, FRAMES, false)
  checks.push({
    name: 'Gegenprobe: ohne Mitnahme bleibt er zurück (Test greift wirklich)',
    ok: r.maxDriftX > 1.5 && r.lostGround > 0,
    info: `Abweichung max ${r.maxDriftX.toFixed(2)} (muss > 1.5), ${r.lostGround} Frames ohne Boden (muss > 0), Endhöhe ${r.p.y.toFixed(2)}`,
  })
}

// 3) y-Mover: Fynnox muss auf der Oberkante kleben, hoch wie runter.
{
  const r = run(Y_MOVER, FRAMES, true)
  checks.push({
    name: 'y-Mover trägt Fynnox auf und ab',
    ok: r.maxDriftY < 0.05 && r.lostGround === 0,
    info: `Abstand zur Oberkante max ${r.maxDriftY.toFixed(4)} (Grenze 0.05), ${r.lostGround} Frames ohne Boden`,
  })
}

// 4) Alle Mover der echten Level durchspielen — keiner darf Fynnox verlieren.
{
  const level = await load('src/game/levels.ts')
  const bad = []
  let count = 0
  for (const [id, lvl] of Object.entries(level.LEVELS)) {
    for (const d of lvl.movers ?? []) {
      count++
      const r = run(d, 300, true)
      const drift = d.axis === 'x' ? r.maxDriftX : r.maxDriftY
      if (drift > 0.05 || r.lostGround > 0) bad.push(`${id} @x${d.x}: Drift ${drift.toFixed(3)}, ${r.lostGround} ohne Boden`)
    }
  }
  checks.push({
    name: `alle ${count} Mover aus den echten Leveln tragen mit`,
    ok: bad.length === 0,
    info: bad.length ? bad.join('; ') : 'kein Ausreißer',
  })
}

let failed = 0
for (const c of checks) {
  if (!c.ok) failed++
  console.log(`${c.ok ? 'OK  ' : 'FEHL'}  ${c.name}\n        ${c.info}`)
}
console.log(failed === 0 ? '\nAlle Prüfungen bestanden.' : `\n${failed} Prüfung(en) fehlgeschlagen.`)
process.exit(failed === 0 ? 0 : 1)
