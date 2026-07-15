# NPC-Figuren-Pipeline (eigene 3D-Charaktere)

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
