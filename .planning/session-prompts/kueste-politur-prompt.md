# Küsten-Politur & offene Punkte — Session-Prompt für Claude Code
## Den Prompt unten kopieren und als erste Nachricht in eine neue Claude-Code-Session einfügen
---

```
Du arbeitest am Projekt Fynnox Adventure (c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure).
Lies ZUERST die CLAUDE.md im Projekt-Stamm (c:\Users\admin\Desktop\Fynnox Adventure APP\CLAUDE.md)
und VISION.md. Antworte auf Deutsch.

## Aufgabe: Küstenbucht fertig polieren + offene Punkte abarbeiten

### Ausgangslage
Das Spiel hat zwei fertige Welten: Sonnenwald (wald-1..3) und Küstenbucht (kueste-1..3),
jeweils mit gemaltem Parallax-Hintergrund, Story-Kapiteln und Level-Zielen. Die komplette
Deko besteht aus gemalten Billboards (Nutzer-Artwork auf Magenta, verarbeitet über die
Skripte in `scripts/`). Prozedurale Geometrie-Deko wurde nach einem ausdrücklichen
Nutzer-Veto entfernt („Keine eckigen Bäume").

Die Küstenbucht wurde am 19.07. in einem Zug gebaut und ist funktional, aber an drei
Stellen sichtbar unfertig. Dazu kommen zwei Altlasten aus früheren Sessions.

WICHTIG: **11 Commits liegen unpushed lokal.** Der Live-Stand
(https://marcel-fe.github.io/fynnox-adventure/) ist alt. Frage den Nutzer früh, ob er
pushen will — NICHT ungefragt pushen.

### Was SCHON EXISTIERT (nicht neu bauen)
Lies diese Dateien VOLLSTÄNDIG, bevor du etwas änderst:

1. `src/world/stage.ts` (~215 Z., COMPLETE) — `StageLook` (~29) + `STAGE` (~107). Pro Welt:
   Himmel, Nebel, Licht, `ground`/`groundMap`, `bgY`/`bgHeight`/`bgFactor` (Backdrop-Lage),
   `water`, `treeArt`, `deco` (`DecoItem[]`), `houseArt`. `FOREST_DECO` (~78),
   `COAST_DECO` (~93). **`STAGE.forest` ist handjustiert — NICHT anfassen.**
2. `src/game/Platforms.tsx` (80 Z., COMPLETE) — `Platforms` (~26): Box mit 6 Material-Gruppen,
   Seiten = `art/deco/platform_dirt.webp` (Gras+Erde), Oberseite = `makeGrassTexture()`
   getönt. `OVERHANG` (~24). **Hier sitzt Lücke 1** — die Kachel ist fest verdrahtet.
3. `src/game/MovingPlatforms.tsx` (~120 Z., COMPLETE) — `buildMovers` (~30),
   `MovingPlatforms` (~40). Mutiert Plattform-Objekte in `useFrame(..., -2)`, also VOR dem
   Physik-Schritt, und trägt den Spieler mit. **Lücke 4 betrifft die Verifikation davon.**
4. `src/game/AdventureScene.tsx` (~190 Z., COMPLETE) — `makeSandTexture` (~65),
   `Ground` (~94), `AdventureScene` (~115). Liest alles aus `stageFor(level.world)`.
5. `src/render/GroundDeco.tsx` (~135 Z., COMPLETE) — nimmt die Objektliste als Prop
   (`types: DecoItem[]`) aus `StageLook.deco`. Verteilung über drei Tiefen-Bänder.
6. `src/render/TreeBillboards.tsx` (168 Z., COMPLETE) — `BANDS` (~40), `TreeType` (~75),
   `TreeShadows` (~140). Vorbild für jede weitere Billboard-Deko.
7. `src/game/levels.ts` (~470 Z., COMPLETE) — `KUESTE_1..3`, `WORLD_GROUPS` (~450),
   `LEVEL_ORDER`, `isUnlocked`, `nextLevelId`.
8. `scripts/` — `cut-asset.mjs` (ein Objekt freistellen), `cut-sheet.mjs` (Sammelblatt
   zerlegen), `prep-tile.mjs` (kachelbare Textur + Nahtmessung), `prep-bg.mjs` (Panorama),
   `cut-region.mjs` (Regionen aus Konzept-Bögen). Prompt-Vorlagen für den Nutzer:
   `.planning/asset-prompts-2026-07-19.md`.

### Was FEHLT (deine Aufgabe — 4 Lücken)

**Lücke 1: Küsten-Plattformen tragen eine grüne Grasnarbe**
- `Platforms.tsx` (~27) lädt fest `art/deco/platform_dirt.webp`, die Oberseite ist grün
  getönt (~72). Am Strand sieht das falsch aus — dort gehören Sand und Holz hin.
- Ansatz: Kachel + Deckfarbe in `StageLook` aufnehmen (z. B. `platformTile: string` und
  `platformTop: string`), Standardwerte = heutige Wald-Werte, damit sich an Welt 1 nichts
  ändert. Dann eine Strand-Kachel vom Nutzer anfordern (Prompt-Muster wie Paket in
  `.planning/asset-prompts-2026-07-19.md`, Abschnitt Plattform-Kachel — Sand/Holz statt
  Gras/Erde) und mit `scripts/prep-tile.mjs` verarbeiten. Die Nahtmessung MUSS „kachelt
  sauber" melden. Dasselbe Feld gilt auch für `MovingPlatforms.tsx` (~46).

**Lücke 2: Sichtbare Kante zwischen gemaltem Strand und 3D-Sandboden**
- Im Screenshot bei `kueste-1` läuft quer durchs Bild eine Helligkeitskante: das Panorama
  (`public/art/bg/kueste/far.webp`) ist heller als der 3D-Sandboden.
- Ansatz: `STAGE.coast.ground` (~150) und/oder die Sandtextur in `AdventureScene.tsx` (~65)
  an die Sandfarbe des Panoramas angleichen — Farbe aus dem unteren Bildbereich des
  Panoramas abgreifen statt raten. Alternativ die Backdrop-Lage (`bgY`) leicht nachziehen.
  Immer per Screenshot gegenprüfen, nicht nach Gefühl.

**Lücke 3: Der Strand hat keine eigene Deko**
- `COAST_DECO` (`stage.ts` ~93) recycelt nur Felsen und Treibholz aus dem Wald-Blatt.
  `STAGE.coast.treeArt` ist leer → an der Küste stehen gar keine Bäume, obwohl das
  Panorama Palmen zeigt.
- Ansatz: Deko-Artwork vom Nutzer anfordern (Palme einzeln als Baum-Billboard; dazu ein
  Sammelblatt mit Muschelfels, Treibholz, Strandgras, Muscheln, Seestern, Fass, Steg-Pfosten).
  Verarbeiten mit `cut-asset.mjs` bzw. `cut-sheet.mjs`, dann `treeArt`/`deco` in
  `STAGE.coast` befüllen. Formuliere dem Nutzer fertige Copy-Paste-Prompts —
  die drei Regeln nicht kürzen: SEITENANSICHT, Magenta #FF00FF, ein freistehendes Objekt
  OHNE Bodenschatten.

**Lücke 4: Der Mitnahme-Effekt der beweglichen Plattformen ist nie bestätigt worden**
- `MovingPlatforms.tsx` (~55–70) addiert das Plattform-Delta auf `player.x/y`, wenn Fynnox
  oben draufsteht. Ein Headless-Test schlug fehl, weil SwiftShader zu wenige Frames rendert
  (der Spieler blieb bei y 7,85, `onGround:false`) — der Effekt ist also UNGEPRÜFT.
- Ansatz: nicht über Screenshots testen, sondern rechnerisch. Beispiel: Spieler auf einen
  x-Mover setzen, `requestAnimationFrame`-Ticks im Browser zählen und prüfen, ob
  `player.x` der Plattform folgt. Alternativ `stepPlayer` in einem kleinen Node-Skript
  direkt gegen mutierte Plattform-Objekte laufen lassen (die Funktion ist bewusst frei von
  three-Importen und damit isoliert testbar).

### Constraints
- Spiel-LOGIK NICHT umschreiben: `src/game/physics.ts`, `controls.ts`, `playerState.ts`.
- `gameStore.ts`, `level.ts`, `save.ts` NUR ADDITIV — alte Savegames
  (`fynnox-adventure-save-v1`) müssen weiter laden.
- `STAGE.forest` NICHT verändern; Welt 1 muss nach jeder Änderung IDENTISCH aussehen.
- KEINE prozedurale Geometrie-Deko einführen (Kugel-Kronen, Kegel, Dodekaeder, Box-Häuser).
  `render/Trees3D.tsx` und `render/Houses.tsx` sind bewusst tot — nicht reaktivieren.
- Neue Assets immer über die Skripte in `scripts/` verarbeiten, als WebP unter
  `public/art/deco/` bzw. `public/art/bg/<welt>/`, Zugriff über `asset('…')`.
- Mobil-Performance: Billboards instanciert (ein Draw-Call je Typ), Partikel nur über den
  bestehenden Pool (`game/fx.ts`), keine Per-Frame-Allokationen.
- OFFLINE & PWA: keine externen CDNs, keine unkomprimierten Bilder > 1 MB committen.
- Keine urheberrechtlich geschützten Assets; keine manipulativen Mechaniken (CLAUDE.md §4).
- Deploy-Pipeline und vite `base: '/fynnox-adventure/'` NICHT ändern.
- CHANGELOG.md im Projekt-Stamm je Änderung pflegen (Datum · Was · Warum, neueste oben).

### Workflow
1. Alle gelisteten Dateien KOMPLETT lesen, bevor du planst.
2. Den Nutzer früh fragen, ob die 11 offenen Commits gepusht werden sollen.
3. Fehlendes Artwork sofort als fertige Copy-Paste-Prompts anfordern, dann OHNE das Artwork
   weiterarbeiten (Lücke 4 und 2 gehen ohne).
4. Je Lücke: Code-Änderung + `npm run build` grün halten.
5. Nach allen Lücken: Build als Regressions-Gate + Sicht-Check per Screenshot, inklusive
   Gegenprüfung, dass Wald 1-1 unverändert aussieht.
6. Ein Commit je Lücke mit klarer Meldung.

### Verification
- cd "c:/Users/admin/Desktop/Fynnox Adventure APP/fynnox-adventure" && npm run build
- npm run preview -- --port 4181   # NICHT `npm run dev` für Screenshots
- Screenshot via Playwright aus dem Kart-Projekt, Import über file://-URL:
  `import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'`
  Flags: `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`,
  `waitUntil:'domcontentloaded'`, `page.screenshot({ timeout: 240000 })`.
- Level starten: `window.__game.getState().start('kueste-1')`
- Spieler positionieren: `window.__player.x = N` UND `window.__cam.position.x = N` zusammen
  setzen. Dev-Hooks: `__player`, `__game`, `__scene`, `__cam`.
- Ziele deterministisch prüfen: `s.addCoin()`, `s.takeKey()`, `s.openChest()`,
  `s.markTalked(0)`, dann `window.__player.x = <goalX+1>` und `…getState().result` lesen.
- Regression Welt 1: `start('wald-1')`, Screenshot bei x=45 — muss unverändert aussehen.

### Was du NICHT tun darfst
- NICHT ungefragt pushen — der Nutzer entscheidet, wann deployt wird.
- KEINE prozedurale Geometrie-Deko reaktivieren (Nutzer-Veto).
- `STAGE.forest` NICHT verändern und den Wald nicht „nebenbei mitverbessern".
- `physics.ts` / `controls.ts` / `playerState.ts` NICHT umschreiben.
- `gameStore`/`level`/`save` nur additiv — alte Savegames müssen laden.
- Das Level `candy-1` NICHT löschen (absichtlich in `LEVELS`, nicht in `WORLD_GROUPS`).
  Dateien generell erst nach ausdrücklicher Bestätigung löschen.
- KEINE Screenshots gegen `npm run dev` — HMR setzt den Spieler auf `startX` zurück.
- Nicht behaupten, der Mitnahme-Effekt funktioniere, ohne ihn gemessen zu haben.
- KEINE externen CDNs/Assets; keine fremden Marken oder geschützten Assets.
```
