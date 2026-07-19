# Küstenbucht (Welt 2) — Session-Prompt für Claude Code
## Den Prompt unten kopieren und als erste Nachricht in eine neue Claude-Code-Session einfügen
---

```
Du arbeitest am Projekt Fynnox Adventure (c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure).
Lies ZUERST die CLAUDE.md im Projekt-Stamm (c:\Users\admin\Desktop\Fynnox Adventure APP\CLAUDE.md) —
sie enthält Charakter-Vorgaben (§3), No-Gos (§4), Technik (§5) und Deployment (§11).
Lies außerdem VISION.md im Projekt-Stamm. Antworte auf Deutsch.

## Aufgabe: Welt 2 „Küstenbucht" bauen

### Worum geht es?
Der Sonnenwald ist fertig und sieht gut aus: gemalte Baum-Billboards, gemalte Boden-Deko,
gemalte Plattformen, Dorfhäuser, drei Level mit Story und Level-Zielen. Es gibt aber nur
EINE Welt. Der Nutzer hat am 19.07. ein Konzept-Artwork geliefert, das sechs Welten
definiert — die zweite ist die **Küstenbucht** („Strände, Häfen und kristallklares Wasser").
Im Menü ist sie bereits als Kachel sichtbar, aber gesperrt und ohne Inhalt. Diese Session
macht daraus eine spielbare Welt.

WICHTIG — Nutzer-Veto vom 19.07.: „Keine eckigen Bäume." Prozedurale Geometrie-Deko
(Kugel-Kronen, Kegel-Grasbüschel, Dodekaeder-Steine, Box-Häuser) wurde deshalb komplett
abgeschaltet. Sie darf NICHT zurückkommen — auch nicht als Zwischenlösung für eine neue Welt.

### Was SCHON EXISTIERT (nicht neu bauen — nur erweitern)
Lies diese Dateien VOLLSTÄNDIG, bevor du etwas änderst:

1. `src/world/stage.ts` (171 Z., COMPLETE) — `StageLook` (~19) + `STAGE` (~60): Himmel, Nebel,
   Licht, Boden und Deko-Assets JE WELT an einer Stelle. Felder u. a. `treeArt`, `groundDeco`,
   `houseArt`, `groundMap`, `fog*`, `hemi*`, `sunColor`. `stageFor` (~169).
   Der `forest`-Eintrag enthält handjustierte Werte — NICHT anfassen.
2. `src/world/themes.ts` (49 Z., COMPLETE) — `DecorKind` (~5) ist aktuell
   `'forest' | 'candy' | 'volcano' | 'city' | 'ice'`. **Es gibt kein `'coast'`** — das ist
   die Wurzel von Lücke 1. `THEMES` (~23) liefert Grundstimmungen aus dem Kart-Projekt.
3. `src/game/level.ts` (274 Z., COMPLETE) — `LevelDef` (~66) mit platforms/coins/gems/stars/
   springs/movers/key/chest/goals/npcs/quest/bg. `MoverDef` (~28), `ChestDef` (~42),
   `LevelGoal`/`GoalKind` (~57), `goalsOf`/`goalDone`/`computeStars` (~215–265),
   `totalGemCount` (~208). `FOREST_LEVEL` (~99).
4. `src/game/levels.ts` (274 Z., COMPLETE) — `WALD_2`/`WALD_3`/`CANDY_1`, `LEVELS` (~236),
   `WORLD_GROUPS` (~253, enthält NUR forest), `LEVEL_ORDER`, `isUnlocked`, `nextLevelId`.
   Hier entstehen die Küsten-Level.
5. `src/game/AdventureScene.tsx` (196 Z., COMPLETE) — `Ground` (~55), `AdventureScene` (~87).
   Liest `stageFor(level.world)`. Zeile ~140: `Water` läuft NUR bei `level.world === 'forest'`.
   Zeile ~130: `Backdrop` bei `level.bg`. Zeile ~148: Baum-Fallback auf `Trees3D`, wenn
   `treeArt` leer ist — genau dieser Fallback ist die Falle (siehe Lücke 4).
6. `src/render/Parallax3D.tsx` (42 Z., COMPLETE) — `Backdrop` (~20) mit
   `z=-110, height=115, y=10, factor=0.85`. Diese Werte wurden für das WALD-Panorama von
   Hand justiert; ein neues Panorama braucht eigene Werte.
7. `src/render/TreeBillboards.tsx` (168 Z.), `src/render/GroundDeco.tsx` (141 Z.),
   `src/render/HouseBillboards.tsx` (88 Z.) — COMPLETE. Gemalte Billboards, instanciert,
   Fuß-Ursprung, Wind, Bodenschatten. `GroundDeco` hat `TYPES` (~26) mit fest verdrahteten
   Wald-Dateinamen (`grass`, `flowers`, `rock_big`, …) — für eine andere Welt muss das
   parametrisierbar werden.
8. `src/render/Water.tsx` (120 Z., COMPLETE) — `Water` (~100): Fluss-Band + zwei Wasserfälle,
   fest auf einen Wald-Fluss ausgelegt (z=-47, Wasserfälle bei 32 %/72 % der Strecke).

Weitere fertige Bausteine (nur lesen): `scripts/cut-asset.mjs` (Magenta freistellen),
`scripts/cut-sheet.mjs` (Sammelblatt automatisch zerlegen), `scripts/prep-tile.mjs`
(kachelbare Textur + Nahtmessung), `scripts/cut-region.mjs` (feste Regionen ausschneiden),
`src/ui/MainMenu.tsx` (~17 `WORLDS`, Kachel `coast` existiert bereits),
`src/data/story.ts` (Kapitel; Wald-1-3-Outro verweist bereits auf die Küstenbucht).

### Artwork-Lage (WICHTIG — zuerst prüfen!)
Der Nutzer sollte ein Küsten-Panorama liefern (Prompt-Paket F in
`.planning/asset-prompts-2026-07-19.md`). Prüfe ZUERST:
  ls "c:/Users/admin/Desktop/Fynnox Adventure APP/"*.png
und schau nach Dateien, die neuer sind als der letzte Commit.
- **Panorama vorhanden** → mit `scripts/prep-tile.mjs` NICHT verarbeiten (das ist für Kacheln),
  sondern nach WebP wandeln und als `public/art/bg/kueste/far.webp` ablegen.
- **Kein Panorama** → NICHT blockieren. Baue die Welt ohne `bg`, aber siehe Lücke 4:
  es darf trotzdem KEINE Geometrie-Deko erscheinen. Melde am Ende klar, welches Bild fehlt.

### Was FEHLT (deine Aufgabe — 5 Lücken)

**Lücke 1: `'coast'` existiert als Welt-Typ überhaupt nicht**
- `DecorKind` (`src/world/themes.ts` ~5) kennt kein `'coast'`. Dadurch lässt sich weder ein
  `STAGE`-Eintrag noch ein `WORLD_GROUPS`-Eintrag typkorrekt anlegen.
- Ansatz: `DecorKind` additiv um `'coast'` erweitern, `THEMES.coast` ergänzen (türkis/sand:
  fog hell-türkis, ground sandfarben, envPreset 'park' oder 'dawn'), danach `STAGE.coast` in
  `src/world/stage.ts` anlegen. Die bestehenden Einträge dabei NICHT verändern.
- Achtung: `THEMES` und `STAGE` sind `Record<DecorKind, …>` — nach dem Erweitern verlangt
  TypeScript beide neuen Einträge. Das ist gewollt und ein guter Schutz.

**Lücke 2: Backdrop-Justierung für das Küsten-Panorama**
- `Backdrop` (`src/render/Parallax3D.tsx` ~20) hat Standardwerte, die für das Wald-Bild von
  Hand gefunden wurden. Ein anderes Panorama mit anderem Horizont sitzt damit falsch —
  typisch: der gemalte Horizont liegt über oder unter der 3D-Bodenkante, es klafft ein Spalt.
- Neu: `bgY`/`bgHeight`/`bgFactor` optional in `LevelDef` (`src/game/level.ts` ~66) ODER in
  `StageLook`, und in `AdventureScene` (~130) an `Backdrop` durchreichen. Standardwerte =
  heutige Wald-Werte, damit sich am Wald NICHTS ändert.
- Ansatz: per Screenshot justieren (siehe Verification), nicht raten.

**Lücke 3: Die Küsten-Level fehlen**
- `WORLD_GROUPS` (`src/game/levels.ts` ~253) enthält nur den Sonnenwald.
- Neu: `kueste-1`, `kueste-2`, `kueste-3` nach dem Muster von `WALD_2`/`WALD_3` — jeweils mit
  `world: 'coast'`, eigenen Plattform-/Sammel-Layouts, `movers`, `springs`, `key`+`chest`,
  **drei `goals`** (unterschiedliche Schwerpunkte je Level, wie im Wald) und `npcs`.
  Danach `WORLD_GROUPS` um die Welt erweitern → Freischaltung und `nextLevelId` greifen
  automatisch. Story-Kapitel in `src/data/story.ts` ergänzen.
- Der Boden ist überall begehbar (Physik hat einen Boden bei y=0) — ein Fehlsprung kostet
  also nie ein Leben. Das ist Absicht (familienfreundlich), Layouts entsprechend bauen.

**Lücke 4: Neue Welten fallen auf die abgelehnte Geometrie-Deko zurück**
- `AdventureScene` (~148): ist `look.treeArt` leer, wird `Trees3D` gerendert — die
  Kugel-Kronen, die der Nutzer ausdrücklich abgelehnt hat. `GroundDeco` (`TYPES` ~26) hat
  außerdem die Wald-Dateinamen fest verdrahtet, taugt also nicht für eine Strand-Welt.
- Ansatz A (bevorzugt): Deko-Artwork vom Nutzer anfordern (Palme, Strandfels mit Muscheln,
  Steg-Stück, Strandgras, Treibholz — als EIN Sammelblatt auf Magenta, dann
  `scripts/cut-sheet.mjs`) und `treeArt`/`groundDeco` für `coast` befüllen. `GroundDeco` so
  umbauen, dass die Objektliste aus `StageLook` kommt statt fest im Modul zu stehen.
- Ansatz B (falls kein Artwork): Deko für `coast` einfach WEGLASSEN. Lieber eine leere,
  saubere Bucht als Kugelbäume. `Trees3D`-Fallback für neue Welten deaktivieren.
- Melde am Ende klar, welche Assets fehlen.

**Lücke 5: Wasser gibt es nur als Wald-Fluss**
- `Water` (`src/render/Water.tsx` ~100) rendert ein schmales Fluss-Band bei z=-47 plus zwei
  Wasserfälle an festen Prozentpositionen — für eine Bucht falsch. In `AdventureScene` (~140)
  ist es deshalb hart auf `level.world === 'forest'` begrenzt.
- Neu: entweder eine Meer-Variante (breite, ruhige Wasserfläche bis zum Horizont, sanfte
  Wellen, KEINE Wasserfälle) hinter dem Spielfeld, gesteuert über ein Feld in `StageLook`
  (z. B. `water: 'none' | 'river' | 'sea'`), oder — falls das Panorama das Meer schon malt —
  bewusst KEIN 3D-Wasser (dann in `stage.ts` dokumentieren, warum).
- Regel aus früheren Sessions: bei vorhandenem `bg` NIE prozedurale Elemente dagegen
  arbeiten lassen (frei schwebende Wasserfälle waren genau dieser Fehler).

### Constraints
- Spiel-LOGIK NICHT umschreiben: `src/game/physics.ts`, `controls.ts`, `playerState.ts`.
- `gameStore.ts`, `level.ts`, `save.ts` NUR ADDITIV erweitern — alte localStorage-Savegames
  (`fynnox-adventure-save-v1`) müssen weiter laden.
- `STAGE.forest` in `src/world/stage.ts` NICHT verändern — dort stecken handjustierte Werte;
  jede Änderung verändert die fertige Welt 1.
- Der 3D-Fynnox (`Fynnox3D.tsx` + `public/models/fynnox.glb`) ist die Spielfigur — nicht ersetzen.
- Figuren: KEIN Tripo/3D (kein Budget). Standard ist das freigestellte Artwork-Billboard
  (`game/SpriteNpc.tsx`); ohne Sprite dient `Villager.tsx` als getönter Platzhalter.
- Neue Assets IMMER über die Skripte in `scripts/` verarbeiten (Magenta-Key, Trim, WebP) und
  unter `public/art/deco/` bzw. `public/art/bg/<welt>/` ablegen. Zugriff über `asset('…')`.
- Mobil-Performance: Billboards instanciert (ein Draw-Call je Typ), Partikel nur über den
  bestehenden Pool (`game/fx.ts`, feste Größe), keine Per-Frame-Allokationen.
- OFFLINE & PWA: keine externen CDNs, alle Assets lokal, Bilder als WebP,
  keine unkomprimierten PNGs > 1 MB committen.
- Keine urheberrechtlich geschützten Assets; keine manipulativen Mechaniken (CLAUDE.md §4):
  kein Pay-to-Win, keine Lootboxen, keine künstlichen Wartezeiten, keine Fake-Währungen.
- Deploy-Pipeline (`.github/workflows/deploy.yml`, vite `base: '/fynnox-adventure/'`) und
  Querformat/PWA NICHT ändern.
- CHANGELOG.md im Projekt-Stamm je Änderung pflegen (Datum · Was · Warum, neueste oben).

### Workflow
1. Alle gelisteten Dateien KOMPLETT lesen, bevor du planst.
2. Artwork-Lage prüfen (siehe oben) und die Strategie danach festlegen.
3. Lücken als isolierte, unabhängige Änderungen planen (1 → 2 → 5 → 4 → 3).
4. Je Lücke: Code-Änderung + `npm run build` (tsc+vite) grün halten.
5. Nach allen Lücken: Build als Regressions-Gate + Sicht-Check per Screenshot,
   inklusive Gegenprüfung, dass Wald 1-1 UNVERÄNDERT aussieht.
6. Ein Commit je Lücke mit klarer Meldung.

### Verification
- cd "c:/Users/admin/Desktop/Fynnox Adventure APP/fynnox-adventure" && npm run build
- npm run preview -- --port 4181   # NICHT `npm run dev` für Screenshots (siehe unten)
- Screenshot via Playwright aus dem Kart-Projekt. CommonJS-Import über file://-URL:
  `import pkg from 'file:///C:/Users/admin/Desktop/Pet%20Kart%20APP%20Spiel/kart-pets/node_modules/playwright/index.js'`
  Flags: `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`,
  `waitUntil:'domcontentloaded'`, Start via `window.__game.getState().start('kueste-1')`,
  `page.screenshot({ timeout: 240000 })`.
- Spieler positionieren: `window.__player.x = N` UND `window.__cam.position.x = N` zusammen
  setzen (sonst fährt die Kamera minutenlang). Dev-Hooks: `__player`, `__game`, `__scene`, `__cam`.
- Ziele-System deterministisch prüfen (nicht durchspielen): Store-Aktionen direkt aufrufen,
  z. B. `s.addCoin()`, `s.takeKey()`, `s.openChest()`, `s.markTalked(0)`, danach
  `window.__player.x = <goalX+1>` setzen und `window.__game.getState().result` auslesen.
- Regression Welt 1: `window.__game.getState().start('wald-1')`, Screenshot bei x=45 und x=90,
  gegen die Bilder der Vorsession vergleichen — der Wald MUSS unverändert aussehen.
- curl -s -o /dev/null -w "%{http_code}" https://marcel-fe.github.io/fynnox-adventure/

### Was du NICHT tun darfst
- KEINE prozedurale Geometrie-Deko einführen oder reaktivieren (Kugel-Baumkronen,
  Kegel-Grasbüschel, Dodekaeder-Steine, Box-Häuser). Das ist ein ausdrückliches Nutzer-Veto.
  Lieber eine leere Welt als eine eckige.
- `STAGE.forest` NICHT verändern und den Wald nicht „nebenbei mitverbessern".
- `physics.ts` / `controls.ts` / `playerState.ts` NICHT umschreiben.
- `gameStore`/`level`/`save` NICHT umbauen, nur additiv — alte Savegames müssen laden.
- Das Level `candy-1` NICHT löschen (steht in `LEVELS`, absichtlich nicht in `WORLD_GROUPS`).
  Dateien generell erst nach ausdrücklicher Bestätigung löschen (CLAUDE.md-Regel).
- KEINE Screenshots gegen `npm run dev` — HMR remountet den Player und setzt ihn auf `startX`
  zurück; das kostet sonst viel Zeit bei der Fehlersuche. Immer `npm run preview` nutzen.
- Bei Levels MIT gemaltem Hintergrund NICHT die prozeduralen Hügel/Wasser aktiv lassen.
- KEINE externen CDNs/Assets (Offline-Bruch); keine unkomprimierten Bilder committen.
- KEINE urheberrechtlich geschützten Assets/Figuren/Musik; keine fremden Marken.
- Querformat/PWA, vite `base` und Deploy-Pipeline NICHT brechen.
- NICHT ungefragt pushen — der Nutzer entscheidet, wann deployt wird.
```
