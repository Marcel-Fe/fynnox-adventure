# NPC-Figuren-Pipeline

## Weg A — Artwork-Billboard (KOSTENLOS, empfohlen)

Kein 3D-Tool nötig. Aus dem ChatGPT-Turnaround wird die Vorderansicht freigestellt und
als Billboard in die 3D-Welt gestellt (dreht sich leicht zum Spieler, wippt, wirft Schatten).

1. **Turnaround in ChatGPT erzeugen** (Prompts: `.planning/npc-prompts.md`) —
   wichtig: **einfarbiger, neutraler Hintergrund**, keine Schlagschatten.
2. **Freistellen + zuschneiden**: Der Hintergrund wird per Farb-Distanz zur Ecken-Farbe
   entfernt (weicher Rand), danach auf die Figur getrimmt und als WebP gespeichert.
   Skript-Vorlage: `scratchpad/cutnpc.mjs` (Chromium/Canvas, kein sharp nötig).
   Ergebnis z. B. → `public/art/npc/bo_front.webp`
3. **Im Level eintragen:**
   ```ts
   npcs: [
     { x: 72, sprite: 'art/npc/bo_front.webp', height: 2.5, lines: ['Hallo!', '…'] },
   ]
   ```
   `height` in Welt-Einheiten (Fynnox ist 2,6). Gerendert von `game/SpriteNpc.tsx`.

**Warum das gut aussieht:** Das Spiel ist ein 2,5D-Seitenscroller — die Kamera schaut
seitlich, Figuren stehen frontal zum Spieler. Ein hochwertiges Artwork-Billboard wirkt
dabei plastischer als ein billiges 3D-Modell. Fynnox selbst lief anfangs genauso.

---

## Weg B — echtes 3D-Modell (kostet ggf. Geld)

So bekommt eine NPC-Figur ihr **eigenes** 3D-Modell statt des getönten Fynnox-Platzhalters.
Gleicher Weg wie beim Spieler-Fynnox — offline-tauglich, ohne externen Decoder.

## Schritte

1. **Turnaround erzeugen (ChatGPT / Bild-KI).**
   Drei saubere Ansichten der Figur auf neutralem Hintergrund: **vorne, Seite, hinten**.
   Konsistenter Stil (Cartoon, gleiche Proportionen), Ganzkörper, gerade Pose (T-/A-Pose).

2. **Multiview → 3D (Tripo).**
   In Tripo „**Multiview to 3D**" die drei Ansichten hochladen → gerigtes **GLB** exportieren.
   Möglichst mit Skelett (dann greifen dieselben prozeduralen Knochen-Gesten wie bei Fynnox).

3. **Komprimieren (Pflicht — sonst zu groß / bricht Offline).**
   ```
   npx @gltf-transform/cli optimize IN.glb OUT.glb \
     --compress meshopt --texture-compress webp --texture-size 1024
   ```
   Ziel: **wenige MB**. **Kein Draco** (externer Decoder bricht Offline-Betrieb).

4. **Ablegen.**
   Datei nach `public/models/<name>.glb` (z. B. `public/models/lumo.glb`).

5. **Im Level eintragen.**
   In `src/game/level.ts` beim `quest`-Feld (oder künftig einer `npcs`-Liste) den Dateinamen setzen:
   ```ts
   quest: {
     npcX: 2,
     npcModel: 'lumo.glb', // eigenes GLB unter public/models/
     ask: '…', ready: '…', thanks: '…',
   }
   ```
   Ohne `npcModel` nutzt `src/game/Npc.tsx` automatisch das getönte Fynnox-Modell als
   Platzhalter (Fallback). Mit `npcTint` lässt sich der Platzhalter einfärben.

## Hinweise
- Die Bewegung (Nicken/Winken) läuft **prozedural über die Knochennamen**
  (`Head`, `R_Upperarm` …) — nutzt die Tripo-Rig dieselben Namen wie Fynnox, funktioniert es
  ohne Anpassung. Andernfalls in `Npc.tsx` die gesuchten Namen ergänzen.
- GLB-Endung ist im PWA-Precache (`vite.config.ts` → `globPatterns`) enthalten → offline verfügbar.
- Datei-Größenlimit des Precache: 8 MB (`maximumFileSizeToCacheInBytes`).
