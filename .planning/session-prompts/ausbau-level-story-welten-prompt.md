# Ausbau: Level-Abwechslung, Story & zweite Welt — Session Prompt for Claude Code
## Copy the prompt below and paste as first message in a new Claude Code session
---

```
Du arbeitest am Projekt Fynnox Adventure (c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure).
Lies ZUERST die CLAUDE.md im Projekt-Stamm (c:\Users\admin\Desktop\Fynnox Adventure APP\CLAUDE.md) —
sie enthält Charakter-Vorgaben (§3), No-Gos (§4), Technik (§5) und Deployment (§11).
Lies außerdem VISION.md im Projekt-Stamm — das ist das verbindliche Ziel des Nutzers.
Antworte auf Deutsch.

## Aufgabe: Level-Abwechslung, mehrere Level mit Story, zweite Welt

### Worum geht es?
Das Spiel läuft live (marcel-fe.github.io/fynnox-adventure/) und sieht gut aus: gemalter
Parallax-Hintergrund, lebendige Welt (Wind/Schmetterlinge/Blätter), Partikel-Effekte beim
Sammeln, Cover-Splash + Dashboard-Menü, erste Figuren mit Dialogen. ABER: es gibt genau EIN
Level, das aus 18 statischen Plattformen besteht, und nur EINE Welt. Nutzer-Ziel (VISION.md):
„ein schönes animiertes Spiel wie Super Mario, mit schönen Welten und einem super Abenteuer,
Aufgaben erledigen und Sachen einsammeln, reizvoll und Spaß". Diese Session macht aus der
einen Strecke ein Abenteuer: abwechslungsreiche Level-Elemente, mehrere Level mit Story
dazwischen, und die zweite Welt.

### Was SCHON EXISTIERT (nicht neu bauen — nur erweitern)
Lies diese Dateien VOLLSTÄNDIG, bevor du etwas änderst:

1. `src/game/level.ts` (155 Z., COMPLETE) — Level-Datenformat. `LevelDef` (~47) mit
   platforms/coins/checkpoints/gems/stars/springs/npcs/quest/bg. Typen: `Coin` (~6),
   `QuestDef` (~13), `Pickup` (~23), `Spring` (~29), `NpcDefData` (~36).
   `FOREST_LEVEL` (~66, startX -6, goalX 138, 35 Münzen, 4 Gems, 3 Sterne, 3 Federn,
   3 NPCs). `computeStars` (~151). HIER kommen neue Level-Elemente als Daten rein.
2. `src/game/levels.ts` (10 Z., COMPLETE, MINIMAL) — `LEVELS` (~4) enthält NUR `'wald-1'`.
   `getLevel` (~8) fällt auf FOREST_LEVEL zurück. Hier entstehen weitere Level.
3. `src/game/physics.ts` (91 Z., COMPLETE — NICHT UMSCHREIBEN) — `Platform` (~15),
   `PlayerState` (~22), `stepPlayer` (~44). Landung auf Plattformen ~74–84: prüft je Frame
   das übergebene `platforms`-Array (nur von oben, Einweg). WICHTIG: `stepPlayer` liest die
   Plattform-Objekte LIVE → bewegliche Plattformen funktionieren, indem man deren x/y VOR
   dem Physik-Schritt mutiert. Kein Eingriff in physics.ts nötig.
4. `src/game/Platforms.tsx` (32 Z., COMPLETE) — `Platforms` (~8) rendert RoundedBox je
   Plattform, `DEPTH` (~6). Vorbild für die Optik beweglicher Plattformen.
5. `src/store/gameStore.ts` (78 Z., COMPLETE) — `GameState` (~17), `useGameStore` (~39),
   `start` (~50), `addCoin`/`addGem`/`addStar` (~53–57), `completeQuest`, `finish`, `toMenu`.
   Nur ADDITIV erweitern.
6. `src/save/save.ts` (28 Z., COMPLETE) — `SaveData` (~4): `totalCoins` + `bestStars`
   (levelId → 0..3). localStorage-Key `fynnox-adventure-save-v1`. Für Level-Fortschritt
   additiv erweitern (alter Save muss weiter laden!).
7. `src/world/themes.ts` (49 Z., COMPLETE, UNGENUTZT!) — `WorldTheme` (~9) und `THEMES` (~23)
   definieren BEREITS alle 5 Welten (forest/candy/volcano/ice/city) mit sky/fog/ground/
   groundTex/envPreset/ambient/hemiSky/hemiGround. Das ist der Schlüssel für Welt 2.
8. `src/game/AdventureScene.tsx` (120 Z., PARTIAL) — `Ground` (~27), `AdventureScene` (~42).
   PROBLEM: Himmel, Nebel, Lichtfarben und Bodenfarbe sind FEST VERDRAHTET (Wald-Werte) und
   ignorieren `THEMES` komplett. Muss an das Theme gekoppelt werden.
9. `src/ui/MainMenu.tsx` (196 Z., COMPLETE) — `WorldTile` (~7), `WORLDS` (~17, 5 Welten,
   nur forest aktiv), `NAV` (~27), `MainMenu` (~50). Welt-Karten starten direkt `start(levelId)`.
10. `src/game/Player.tsx` (COMPLETE) — `Player` (~13); Ziel-Erkennung ~37: bei `player.x >=
    level.goalX` → `finish({...})`. Hier hängt der Übergang zum nächsten Level/Story an.

Weitere fertige Bausteine (nur lesen, nicht ändern): `game/fx.ts` + `render/Fx.tsx`
(Partikel: `burst('coin'|'gem'|'star'|'jump'|'land'|'run'|'spring', x, y)`, `addShake(v)`),
`game/Pickups.tsx` (Gems/Stars/Springs), `game/SpriteNpc.tsx` (Figuren als Artwork-Billboard),
`render/Parallax3D.tsx` (`Backdrop`), `render/Life.tsx`, `render/Trees3D.tsx`, `render/Houses.tsx`.

### Was FEHLT (deine Aufgabe — 5 Lücken)

**Lücke 1: Bewegliche Plattformen**
- Alle 18 Plattformen stehen still (`FOREST_LEVEL.platforms` ~69). Das ist der größte Grund,
  warum das Level sich gleichförmig anfühlt.
- Neu: `src/game/MovingPlatforms.tsx` + `movers?` in `LevelDef` (~47), z. B.
  `{ x, y, w, h, axis: 'x'|'y', range, speed, phase }`.
- Ansatz: Die Mover erzeugen echte `Platform`-Objekte, die im selben Array landen, das
  `stepPlayer` bekommt. Deren x/y je Frame in einem `useFrame` VOR dem Physik-Schritt
  aktualisieren (Reihenfolge sicherstellen!) — dann trägt die Physik ohne Änderung.
  Für „Spieler wird mitgetragen": steht der Spieler oben drauf (gleiche Prüfung wie
  physics.ts ~74–84), das Delta der Plattform auf `player.x` addieren.

**Lücke 2: Truhe + Schlüssel (Belohnungs-Ziel)**
- Es gibt `public/art/items/key.png` und `chest.png`, beide werden NIRGENDS genutzt.
  Sammeln endet aktuell bei „Zahl hochzählen".
- Neu: `src/game/Chest.tsx`; `key?`/`chest?` in `LevelDef`. Schlüssel einsammeln →
  Truhe öffnet sich bei Annäherung → Belohnung (Münz-Regen über `burst('coin', …)` +
  Gems) + sichtbares Aufgehen des Deckels.
- Ansatz: gleiches Muster wie `game/Pickups.tsx` (Sprite + Distanzprüfung + `burst`).
  Zustand additiv im `gameStore` (`hasKey`, `chestOpen`).

**Lücke 3: Mehrere Level je Welt + Level-Auswahl**
- `levels.ts` (~4) kennt nur `'wald-1'`; das Menü startet direkt dieses eine Level.
- Neu: `wald-2` und `wald-3` in `levels.ts` (eigene Plattform-/Sammel-Layouts, gern kürzer
  und mit neuen Elementen aus Lücke 1+2). Freischaltung: Level N+1 erst nach Abschluss von N.
- Ansatz: `SaveData` (~4) additiv um abgeschlossene Level erweitern (alte Saves müssen
  weiterhin laden → Default-Werte!). Im Menü Welt-Karte → Level-Auswahl (3 Kacheln mit
  Sternen), statt direkt zu starten. Nach `finish` das nächste Level freischalten.

**Lücke 4: Story-Panels zwischen den Leveln**
- Es gibt keinerlei Story, obwohl CLAUDE.md und VISION.md einen Kapitel-Bogen vorsehen
  („die Kristalle verschwinden — Fynnox hilft"). Der Ergebnis-Screen führt direkt zurück.
- Neu: `src/data/story.ts` (Kapitel-Texte je Level) + `src/ui/StoryPanel.tsx` (Panel im
  Look des Menüs: Bild/Portrait links, Text rechts, „Weiter"-Button).
- Ansatz: `Screen`-Typ im `gameStore` (~4) additiv um `'story'` erweitern; vor Level-Start
  bzw. nach `finish` einblenden. Texte kurz, warm, familienfreundlich.

**Lücke 5: Zweite Welt „Zuckerwirbel" — Themes endlich nutzen**
- `THEMES` (`world/themes.ts` ~23) definiert alle 5 Welten bereits vollständig, wird aber
  NIRGENDS gelesen. `AdventureScene.tsx` (~42) hat Wald-Werte fest verdrahtet (Sky, `fog`
  args, `hemisphereLight` args, `directionalLight` color, Ground-Farbe ~27).
- Ansatz: In `AdventureScene` das Theme über `THEMES[level.world]` holen und Sky/Fog/
  Lichter/Bodenfarbe daraus speisen (Standardwerte = heutige Wald-Optik, damit Welt 1
  IDENTISCH aussieht — visuell gegenprüfen!). Danach `candy-1` in `levels.ts` anlegen.
- Artwork: Der Nutzer liefert `public/art/bg/candy/far.webp` (Prompt-Vorlage in
  `.planning/parallax-assets-spec.md`). Ohne Bild: Level ohne `bg` anlegen, dann greifen
  automatisch die prozeduralen Hügel — NICHT blockieren, sondern ohne Bild bauen und
  am Ende sagen, welches Bild fehlt.

### Constraints
- Spiel-LOGIK NICHT umschreiben: `physics.ts`, `controls.ts`, `playerState.ts`.
  `gameStore.ts`, `level.ts`, `save.ts` NUR ADDITIV erweitern (bestehende Felder/Aktionen
  unangetastet; alte localStorage-Saves müssen weiter laden).
- Der 3D-Fynnox (`Fynnox3D.tsx` + `public/models/fynnox.glb`) ist die Spielfigur — NICHT ersetzen.
- Figuren: KEIN Tripo/3D (Nutzer hat kein Budget). Standard ist das freigestellte
  Artwork-Billboard (`game/SpriteNpc.tsx`), Pipeline in `docs/npc-pipeline.md`.
- Wenn ein Level `bg` hat, MÜSSEN prozedurale Hügel (`Scenery hills={false}`) und `Water`
  aus bleiben — sonst arbeiten sie gegen das gemalte Bild (frei schwebende Wasserfälle).
- Mobil-Performance: Instancing, wenige Draw-Calls, Partikel nur über den bestehenden Pool
  (`game/fx.ts`, feste Größe) — keine neuen Per-Frame-Allokationen.
- OFFLINE & PWA: KEINE externen CDNs. Assets lokal. Bilder immer nach WebP wandeln
  (Chromium/Canvas-Weg, siehe `.planning/parallax-assets-spec.md`) — PNGs > 1 MB nicht committen.
- Keine urheberrechtlich geschützten Assets; keine manipulativen Mechaniken (CLAUDE.md §4):
  kein Pay-to-Win, keine Lootboxen, keine künstlichen Wartezeiten, keine Fake-Währungen.
- Deploy-Pipeline (`.github/workflows/deploy.yml`, vite `base: '/fynnox-adventure/'`) und
  Querformat/PWA NICHT ändern. Root-Repo `Marcel-Fe/marcel-fe.github.io` NICHT anfassen.
- CHANGELOG.md (Projekt-Stamm) je Änderung pflegen. Assets über `asset('...')`.

### Workflow
1. Alle gelisteten Dateien KOMPLETT lesen, bevor du planst.
2. Lücken als isolierte, unabhängige Änderungen planen (1 → 2 → 5 → 3 → 4).
3. Je Lücke: Code-Änderung + `npm run build` (tsc+vite) grün halten.
4. Nach allen Lücken: Build als Regressions-Gate + Sicht-Check per Screenshot.
5. Ein Commit je Lücke mit klarer Meldung; danach Push (Auto-Deploy) + Live-Check.

### Verification
- cd "c:/Users/admin/Desktop/Fynnox Adventure APP/fynnox-adventure" && npm run build
- npm run preview -- --port 4180   # NICHT `npm run dev` für Screenshots (siehe unten)
- Screenshot via Playwright aus dem Kart-Projekt
  (`C:/Users/admin/Desktop/Pet Kart APP Spiel/kart-pets/node_modules/playwright`, CommonJS →
  `import pkg from '...'; const { chromium } = pkg`), Flags
  `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`,
  `waitUntil:'domcontentloaded'`, Start via `window.__game.getState().start('wald-1')`,
  `page.screenshot({ timeout: 240000 })`.
- Spieler positionieren: `window.__player.x = N` UND `window.__cam.position.x = N` zusammen
  setzen (sonst fährt die Kamera minutenlang). Dev-Hooks: `__player`, `__game`, `__scene`, `__cam`.
- Szene inspizieren: `o.matrixWorld.elements[12..14]` (NICHT `getWorldPosition({})`).
- curl -s -o /dev/null -w "%{http_code}" https://marcel-fe.github.io/fynnox-adventure/   # 200 nach Deploy
- Sicht-Check: Wald 1-1 sieht AUS WIE VORHER (Theme-Umbau darf nichts verändern), bewegliche
  Plattformen tragen den Spieler, Truhe öffnet mit Schlüssel, Level-Auswahl zeigt Sterne,
  Story-Panel erscheint, Zuckerwirbel hat rosa Stimmung.

### Was du NICHT tun darfst
- `physics.ts` / `controls.ts` / `playerState.ts` NICHT umschreiben — bewegliche Plattformen
  über Mutation der Plattform-Objekte lösen, nicht über neue Kollisions-Logik.
- `gameStore`/`level`/`save` NICHT umbauen, nur additiv — alte Savegames müssen laden.
- Den 3D-Fynnox NICHT ersetzen; KEINE Low-Poly-Kegel und NICHT den toten 2D-Vektor-Renderer
  (`render/Parallax.tsx`, `render/paintFynnox.ts`) reaktivieren.
- KEINE Screenshots gegen `npm run dev` — HMR remountet den Player und setzt ihn auf `startX`
  zurück; das kostet sonst viel Zeit bei der Fehlersuche. Immer `npm run preview` nutzen.
- Bei Levels MIT gemaltem Hintergrund NICHT die prozeduralen Hügel/Wasser aktiv lassen.
- KEINE externen CDNs/Assets (Offline-Bruch); keine unkomprimierten Bilder committen.
- KEINE urheberrechtlich geschützten Assets/Figuren/Musik; keine fremden Marken.
- Querformat/PWA, vite `base` und Deploy-Pipeline NICHT brechen.
- Dateien erst nach ausdrücklicher Bestätigung löschen (CLAUDE.md-Regel).
```
