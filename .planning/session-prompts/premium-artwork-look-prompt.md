# Premium Artwork-Look ("wie auf den Bildern") — Session-Prompt für Claude Code
## Kopiere den Prompt unten und füge ihn als erste Nachricht in eine neue Claude-Code-Session ein
---

```
Du arbeitest am Projekt Fynnox Adventure (c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure).
Lies ZUERST die CLAUDE.md im Projekt-Stamm (c:\Users\admin\Desktop\Fynnox Adventure APP\CLAUDE.md) —
sie enthält Charakter-Vorgaben (§3), No-Gos (§4), Technik (§5) und Deployment (§11). Antworte auf Deutsch.

## Aufgabe: Premium 2,5D-Artwork-Look statt Low-Poly

### Worum geht es?
Das Spiel läuft live (marcel-fe.github.io/fynnox-adventure/), sieht aber NICHT aus wie die Referenz-
Artworks. Wald + Fynnox + Deko sind aktuell prozedural aus 3D-Grundformen gebaut (Kegel-Bäume,
Primitiv-Fuchs, Kugel-Blumen) → billiger Low-Poly-Look. Ziel: der gemalte, hochwertige 2,5D-Cartoon-Look
der Vorlagen (siehe public/art/previews/wald.png und public/art/fynnox/*). Lösung: Umstieg auf einen
ARTWORK-BASIERTEN Renderer — gemalte Parallax-Hintergründe + Charakter-Sprite mit Animationsframes +
gemalte Plattform-/Deko-Sprites. Die Spiel-LOGIK bleibt unverändert.

### Was SCHON EXISTIERT (nicht neu bauen — nur die Render-Schicht ersetzen)

Lies diese Dateien VOLLSTÄNDIG, bevor du etwas änderst:

1. `src/game/physics.ts` (~90 Z., COMPLETE, VERIFIZIERT) — reine Seitenscroller-Physik: stepPlayer(),
   Einweg-Plattformen, Dash. NICHT anfassen.
2. `src/game/level.ts` (~70 Z., COMPLETE) — LevelDef (platforms/coins/checkpoints/goalX), FOREST_LEVEL,
   computeStars(). Welt-Koordinaten. NICHT die Logik ändern (Optik-Layer liest nur daraus).
3. `src/game/playerState.ts`, `src/game/controls.ts`, `src/store/gameStore.ts`, `src/save/save.ts`
   (COMPLETE) — Spielerzustand, Eingabe, Screen-/Savegame-Store. NICHT anfassen.
4. `src/game/AdventureScene.tsx` (~110 Z., ERSETZEN) — baut aktuell die 3D-Szene zusammen (Scatter,
   Foliage, Boden-Plane, Hügel, drei/Sky, Lichter, Postprocessing) + Player/Coins/Flags. Hier kommt der
   neue Parallax-Hintergrund + gemalte Plattformen rein.
5. `src/game/Fynnox.tsx` (~162 Z., ERSETZEN) — prozedurales 3D-Fuchs-Modell → durch animiertes Sprite ersetzen.
6. `src/game/Platforms.tsx` (~22 Z., ERSETZEN) — braune Box-Plattformen → gemalte Tile-Sprites.
7. `src/game/Coins.tsx`, `src/game/Flags.tsx` (COMPLETE) — sind BEREITS Artwork-Sprites (paw_coin/flag).
   Als Vorbild fürs Sprite-Laden nehmen (useTexture + SRGBColorSpace + alphaTest).
8. `src/App.tsx` (~61 Z., ANPASSEN) — Canvas + CameraFollow (folgt player.x). Kamera ggf. auf
   OrthographicCamera umstellen für sauberen 2,5D-Parallax.

Vorhandene fertige Assets in `public/art/`: fynnox/{front,side,victory,portrait}.png, items/*.png
(paw_coin, star, gem, heart, flag, chest, key, spring), previews/*.png (748x412, ABER top-down —
NICHT als Seiten-Parallax geeignet!), icon.png. Referenz-Prompts im Pack
`../pet_cars_fynnox_adventure_pack_v1.zip` (prompts/characters/fynnox_adventure_poses.prompt.txt listet
Posen: idle, run1-3, jump, fall, landing, collect, victory, surprised).

### Was FEHLT (deine Aufgabe — 5 Lücken schließen)

**Lücke 1: Fehlende Artworks generieren (Voraussetzung für alles)**
- Es gibt KEINE seitlichen, gemalten Parallax-Ebenen und KEINE Fynnox-Lauf-/Sprung-Frames.
- Generiere als transparente/Full-Bleed-PNGs, konsistent zu den Referenzen (Fynnox: orange, SEHR große
  glänzende blaue Augen, blauer Anzug mit P-Abzeichen): (a) Parallax-Layer Wald in Seitenansicht —
  himmel.png (full-bleed), wald_fern.png, wald_mittel.png, wald_vorn.png (transparent), boden_strip.png;
  (b) Fynnox-Frames idle, run1, run2, run3, jump, fall (transparent, gleiche Blickrichtung, seitlich/3-4).
  Nutze die Pack-Prompts als Vorlage; lege Dateien unter public/art/parallax/wald/ und public/art/fynnox/anim/ ab.
- Ansatz: Bild-Generierung über eine verfügbare Design-/AI-Artist-Skill; jedes Bild mit Fynnox-Referenz
  als Stilanker. KEINE fremden Marken/Figuren.

**Lücke 2: Parallax-Hintergrund-System (ersetzt 3D-Wald)**
- Neu: `src/render/Parallax.tsx`. Mehrere breite Textur-Ebenen, je nach cameraX mit eigenem Faktor
  horizontal gescrollt (Himmel ~0.05, fern ~0.2, mittel ~0.5, vorn ~0.85). In AdventureScene einsetzen
  statt Scatter/Foliage/Hügel/Boden-Plane. Kachelung horizontal, damit endlos.

**Lücke 3: Fynnox als animiertes Sprite (ersetzt Fynnox.tsx-3D)**
- `src/game/Fynnox.tsx` neu: Sprite-Plane, Frame-Wechsel je Zustand (steht → idle; |vx|>0 & onGround →
  run1..3 zyklisch; !onGround & vy>0 → jump; vy<0 → fall). Spiegeln über scale.x = facing. Frames aus
  Lücke 1. Vorbild: Coins.tsx (useTexture, alphaTest, depthWrite=false).

**Lücke 4: Gemalte Plattformen/Boden (ersetzt Box-Platforms)**
- `src/game/Platforms.tsx` neu: gemalte Gras-Plattform-Sprites (platform_grass aus dem Pack nach
  public/art/tiles/ kopieren), horizontal gekachelt auf Plattform-Breite. Boden als durchgehender
  gemalter Streifen.

**Lücke 5: Low-Poly entfernen + Kamera säubern**
- `src/world/Scatter.tsx`, `src/world/textures.ts`, `src/game/Foliage.tsx` aus der Szene entfernen
  (Dateien löschen erst nach Bestätigung). Postprocessing/Lichter reduzieren (Sprites sind vorbeleuchtet).
  Kamera in App.tsx auf orthographisch prüfen; CameraFollow (player.x) beibehalten.

### Constraints
- Fynnox-Konsistenz strikt (CLAUDE.md §3): überall gleicher Fuchs, nie gruselig/realistisch.
- Keine fremden Marken/Figuren/Level/UI (CLAUDE.md §4) — eigene Pet-Cars-Welt.
- Mobil-Performance: wenige Draw-Calls, PNGs komprimiert, Assets je Welt lazy laden; PWA bleibt Querformat.
- Spiel-LOGIK unverändert lassen: physics.ts, level.ts, controls.ts, playerState.ts, gameStore.ts, save.ts.
- Deploy-Pipeline (.github/workflows/deploy.yml, vite base '/fynnox-adventure/') NICHT ändern.
- Das separate Repo Marcel-Fe/marcel-fe.github.io (Root-SW-Kill-Switch) NICHT anfassen — es hält die
  Domain sauber. index.html-Selbstheilung ebenfalls belassen.
- CHANGELOG.md (Projekt-Stamm) je Änderung pflegen.

### Workflow
1. Alle gelisteten Dateien KOMPLETT lesen, bevor du planst.
2. Lücke 1 (Assets) zuerst — ohne Artworks bringt der Renderer nichts. Bilder generieren + einordnen.
3. Dann je eine Render-Lücke isoliert umsetzen (Parallax → Fynnox-Sprite → Plattformen → Aufräumen).
4. Nach jeder Lücke: `npm run build` (tsc + vite) grün halten.
5. Nach allen Lücken: Dev-Server + Screenshot (Playwright) zum visuellen Vergleich mit den Referenzen.
6. Ein Commit je Lücke mit klarer Meldung; danach Push (Auto-Deploy) + Live-Check.

### Verification
- cd "c:\Users\admin\Desktop\Fynnox Adventure APP\fynnox-adventure" && npm run build
- npm run dev  (danach Screenshot via Playwright aus dem Kart-Projekt-node_modules, Software-GL:
  --enable-unsafe-swiftshader --use-gl=angle --use-angle=swiftshader; Screenshot-Timeout 120000)
- curl -s -o /dev/null -w "%{http_code}" https://marcel-fe.github.io/fynnox-adventure/   (== 200 nach Deploy)
- Sicht-Check: Fynnox = oranger Fuchs mit großen blauen Augen; Wald = gemalte Parallax-Kulisse (kein Kegel-Wald).

### Was du NICHT tun darfst
- Physik/Spiel-Logik NICHT umschreiben (nur die Render-/Optik-Schicht).
- KEINE Low-Poly-Prozedural-Meshes wieder einführen (Scatter/Foliage/textures sind der alte Look).
- KEINE urheberrechtlich fremden Artworks/Figuren verwenden — nur eigene, Fynnox-konsistente Grafik.
- Querformat/PWA NICHT brechen; vite base nicht ändern.
- Das Root-Kill-Switch-Repo (Marcel-Fe/marcel-fe.github.io) und die index.html-Selbstheilung NICHT verändern.
- Dateien erst nach ausdrücklicher Bestätigung löschen (CLAUDE.md-Regel).
```
