# Lebendige Welt (Häuser, realere Bäume, Aufgaben-Logik, Musik) — Session Prompt für Claude Code
## Kopiere den Prompt unten und füge ihn als erste Nachricht in einer neuen Claude-Code-Session ein
---

```
Du arbeitest am Projekt Fynnox Adventure (c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure).
Lies ZUERST die CLAUDE.md im Projekt-Stamm (c:\Users\admin\Desktop\Fynnox Adventure APP\CLAUDE.md) —
sie enthält Charakter-Vorgaben (§3), No-Gos (§4), Technik (§5) und Deployment (§11). Antworte auf Deutsch.

## Aufgabe: Lebendige Welt — Häuser, realere Bäume, Aufgaben-Logik & Musik

### Worum geht es?
Das Spiel läuft live (marcel-fe.github.io/fynnox-adventure/): 3D-Diorama-Welt, echtes 3D-Fynnox-Modell
(animiert), Landschaft (Hügel/Wasser/Blumen), eine erste NPC-Figur mit Sprechblase. Nutzer-Vision:
„Fynnox erledigt Aufgaben in einer echten, lebendigen Welt wie Super Mario" — mit Häusern, mehreren
Figuren (Gesten + Sprechblasen), spannenden Aufgaben und Abenteuer-Musik. Ziel dieser Session: die Welt
bewohnter & lebendiger machen (Häuser, realere Bäume), echte Quest-Logik und ein Musik-System — alles
ohne die bestehende Optik/Logik zu brechen.

### Was SCHON EXISTIERT (nicht neu bauen — nur erweitern)
Lies diese Dateien VOLLSTÄNDIG, bevor du etwas änderst:

1. `src/game/AdventureScene.tsx` (~70 Z., COMPLETE) — baut die Szene zusammen: Sky/Fog/Environment/
   Lichter, `Ground` (~19), Water, Trees3D, Scenery, Platforms, Coins, Checkpoints, Goal, Npc, Player,
   Postprocessing. `AdventureScene` (~34). HIER kommen Häuser rein und werden Quest/Musik verdrahtet.
2. `src/render/Trees3D.tsx` (~85 Z., COMPLETE, SIMPEL) — `Tree` (~41): Stamm + überlappende Laubkugeln;
   `Trees3D` (~69): gestaffelte Tiefen-Bänder. Optik-Ziel dieser Session: „realer" (Detail/Varianz).
3. `src/render/Scenery.tsx` (~150 Z., COMPLETE) — `DistantHills` (~37), `Scenery` (~74): instancierte
   Deko (Blumen/Felsen/Büsche/Gras) + Hügel. Vorbild fürs Instancing neuer Deko.
4. `src/game/Npc.tsx` (~110 Z., PARTIAL) — `Npc` (~21), `NpcDef` (~16): Begleiter-Figur (getöntes
   Fynnox-Modell als Platzhalter) + Sprechblase (drei `<Html>`) bei Annäherung (<8). Zeigt NUR statischen
   Text — keine Quest-Logik. Vorbild fürs NPC-Laden.
5. `src/store/gameStore.ts` (~58 Z., COMPLETE) — `useGameStore` (~29): screen/levelId/runId/coins/result/
   save + Aktionen start/addCoin/finish/toMenu. Quest-State gehört hier additiv rein (bestehendes NICHT brechen).
6. `src/game/level.ts` (~55 Z., COMPLETE) — `LevelDef` (~11): platforms/coins/checkpoints/goalX. `FOREST_LEVEL`
   (~24), `computeStars` (~51). Hier optional `npcs?`/`houses?`/`quest?` als Daten ergänzen (Optik liest nur).
7. `src/game/Fynnox3D.tsx` (~120 Z., COMPLETE) — Spielfigur als 3D-Modell (`public/models/fynnox.glb`,
   2,4 MB, Meshopt+WebP). NICHT ersetzen. Vorbild: useGLTF + Auto-Scale + prozedurale Knochen-Animation.
8. `src/App.tsx` (~60 Z., COMPLETE) — Canvas (shadows), CameraFollow (player.x). Audio/Mute-UI kann hier
   oder in `src/ui/` andocken. Tastatur via `game/controls.ts`.

Vorhandene Assets: `public/models/fynnox.glb` (Spielfigur). `public/art/…` (Item-Sprites, Fynnox-Referenzen).
KEIN Audio-Ordner, KEINE Haus-/NPC-Modelle bisher.

### Was FEHLT (deine Aufgabe — 5 Lücken)

**Lücke 1: Häuser & Dorf (neu)**
- Es gibt keine Gebäude. Neu: `src/render/Houses.tsx` — plastische 3D-Cartoon-Häuser (Wände/Dach/Tür/
  Fenster als abgerundete Formen, warme Farben), deterministisch an wenigen Stellen in Tiefen-Ebenen (z<0).
- In `AdventureScene.tsx` (~34) einbinden (hinter dem Spielfeld). Instancing/wenige Meshes für Mobile.

**Lücke 2: Bäume „realer"**
- `render/Trees3D.tsx` `Tree` (~41) ist eine simple Kugel-Wolke. Ziel: mehr Detail/Varianz — z. B. mehrere
  Baum-Typen (Laub/Nadel/Busch), Stamm mit Textur/Farbe-Varianz, dichtere Kronen, leichte Wind-Neigung.
- Performance halten (Instancing wo möglich, Ferne über Nebel ausdünnen).

**Lücke 3: Aufgaben-/Quest-Logik**
- `game/Npc.tsx` (~21) zeigt nur statischen Text; `gameStore` (~29) trackt nur `coins`. Es fehlt echte
  Quest-Logik: Ziel (z. B. „alle Münzen sammeln" / „X abliefern"), Fortschritt, Erfüllung, NPC-Reaktion
  („Danke!") + Belohnung/Feedback.
- Ansatz: Quest-State additiv in `gameStore` (aktive Quest, Status), NPC liest/zeigt Fortschritt in der
  Sprechblase, Abschluss triggert Reaktion. Quest-Daten optional in `level.ts` (`quest?`).

**Lücke 4: Musik-System**
- Kein Audio. Neu: `src/audio/music.ts` (Abspielen/Loop, Lautstärke, Stumm) + kleiner Mute-Button in `src/ui/`.
- Spielt `public/audio/musik.mp3` (lizenzfreie Datei, wird VOM NUTZER bereitgestellt — nicht selbst laden).
  Autoplay-Policy beachten (Start bei erster Interaktion). Zustand (an/aus) in `localStorage` merken.

**Lücke 5: NPC-Pipeline für echte Figuren**
- `Npc.tsx` nutzt das getönte Fynnox-Modell. Verallgemeinern: eigenes GLB je Figur laden
  (`public/models/<npc>.glb`), Fallback auf Fynnox-Platzhalter. Pipeline dokumentieren (ChatGPT-Turnaround
  vorne/seite/hinten → Tripo „Multiview to 3D" → GLB → mit `@gltf-transform` auf Meshopt+WebP komprimieren).

### Constraints
- Spiel-LOGIK NICHT umschreiben: `physics.ts`, `controls.ts`, `playerState.ts`, `save.ts`. `gameStore.ts`
  und `level.ts` nur ADDITIV erweitern (bestehende Felder/Aktionen unangetastet).
- Der 3D-Fynnox (`Fynnox3D.tsx` + `public/models/fynnox.glb`) ist die Spielfigur — NICHT ersetzen.
- Mobil-Performance: Instancing, wenige Draw-Calls, Ferne über Nebel ausdünnen. GLB-Modelle IMMER
  komprimieren (Meshopt + WebP, KEIN Draco → externer Decoder bricht Offline).
- OFFLINE & PWA: KEINE externen CDNs (keine Fonts/Musik/Decoder von fremden Hosts). Assets liegen lokal.
- Keine urheberrechtlich geschützten Assets/Figuren/Musik (CLAUDE.md §4). Musik muss lizenzfrei sein.
- Deploy-Pipeline (`.github/workflows/deploy.yml`, vite `base: '/fynnox-adventure/'`) und Querformat/PWA
  NICHT ändern. Das Root-Kill-Switch-Repo `Marcel-Fe/marcel-fe.github.io` NICHT anfassen.
- CHANGELOG.md (Projekt-Stamm) je Änderung pflegen. Assets über `asset('...')` (`src/utils/asset.ts`).

### Workflow
1. Alle gelisteten Dateien KOMPLETT lesen, bevor du planst.
2. Lücken als isolierte, unabhängige Änderungen planen (Häuser → Bäume → Quest → Musik → NPC-Pipeline).
3. Je Lücke: Code-Änderung + `npm run build` (tsc+vite) grün halten.
4. Nach allen Lücken: Dev-Server + Screenshot (Playwright, s. Verification) zum Sicht-Check.
5. Ein Commit je Lücke mit klarer Meldung; danach Push (Auto-Deploy) + Live-Check.

### Verification
- cd "c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure" && npm run build
- npm run dev  → Screenshot via Playwright aus dem Kart-Projekt-node_modules
  (`C:/Users/admin/Desktop/Pet Kart APP Spiel/kart-pets/node_modules/playwright`), Software-GL-Flags
  `--enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader`, `waitUntil:'domcontentloaded'`,
  Start via `window.__game.getState().start('wald-1')`, `page.screenshot({ timeout: 180000 })`.
  Hinweis: Unter SwiftShader läuft die Physik langsam → länger laufen lassen, um NPC/Ziel zu erreichen.
- GLB komprimieren: npx @gltf-transform/cli optimize IN OUT --compress meshopt --texture-compress webp --texture-size 1024
- curl -s -o /dev/null -w "%{http_code}" https://marcel-fe.github.io/fynnox-adventure/   (== 200 nach Deploy; CDN 1–3 Min)
- Sicht-Check: Häuser sichtbar, Bäume detaillierter, Quest-Fortschritt/Abschluss funktioniert, Musik-Mute schaltet.

### Was du NICHT tun darfst
- Spiel-Logik/Physik NICHT umschreiben; `gameStore`/`level` nur additiv erweitern.
- Den 3D-Fynnox NICHT durch das alte Sprite ersetzen; KEINE Low-Poly-Prozedural-Kegel oder den
  verworfenen 2D-Vektor-Renderer (`render/Parallax.tsx`, `render/paintFynnox.ts` sind tot) reaktivieren.
- KEINE externen CDNs/Assets (Offline-Bruch); GLBs NICHT unkomprimiert (>5 MB) committen.
- KEINE urheberrechtlich geschützte Musik/Figuren; keine fremden Marken.
- Querformat/PWA, vite `base` und Deploy-Pipeline NICHT brechen; Root-Kill-Switch-Repo NICHT anfassen.
- Dateien erst nach ausdrücklicher Bestätigung löschen (CLAUDE.md-Regel).
```
