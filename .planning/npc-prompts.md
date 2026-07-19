# Fertige ChatGPT-Prompts für die NPC-Figuren

> Ziel: je Figur ein **Turnaround** (vorne / Seite / hinten) → bei Tripo „Multiview to 3D"
> hochladen → GLB → komprimieren → `public/models/<name>.glb`.
> Ablauf im Detail: `docs/npc-pipeline.md`.

## Wichtig vorab (das entscheidet über die Qualität)
- Die drei Ansichten müssen **dieselbe Figur, dieselbe Pose, dieselbe Größe** zeigen.
- **Neutraler, einfarbiger Hintergrund**, gleichmäßiges Licht, **keine Schlagschatten**.
- **A-Pose**: Arme leicht vom Körper weg, Beine leicht auseinander, gerade stehend.
- Ganzkörper, nichts abgeschnitten, keine Schrift/Wasserzeichen im Bild.

---

## 1) Lumo — der kluge Hase (Auftraggeber der Quest)

```
Erstelle ein Charakter-Turnaround-Blatt für ein 3D-Spiel-Modell.

Figur: „Lumo", ein freundlicher junger Hase. Weiches graubraunes Fell, heller
Bauch, große aufmerksame bernsteinfarbene Augen, lange Ohren (eines leicht
geknickt). Kleidung: eine kurze blaue Weste mit Messingknöpfen, ein kleiner
Ledergurt mit Tasche, Stoffhose. Wirkung: klug, freundlich, hilfsbereit.

Stil: hochwertiger stylized 3D-Cartoon, warme Farben, cozy fantasy,
Spielfigur-Qualität — im selben Stil wie ein moderner Mobile-Adventure-Held.

WICHTIG für die 3D-Erzeugung:
- Zeige GENAU DREI Ansichten nebeneinander: von VORNE, von der SEITE, von HINTEN.
- In allen drei Ansichten exakt dieselbe Figur, dieselbe Größe, dieselbe Pose.
- A-Pose: gerade stehend, Arme leicht vom Körper weg, Beine leicht auseinander.
- Ganzkörper, nichts angeschnitten.
- Komplett einfarbiger, neutral hellgrauer Hintergrund.
- Gleichmäßiges, weiches Licht, KEINE Schlagschatten, kein Boden, keine Bühne.
- Keine Schrift, keine Beschriftungen, kein Wasserzeichen.
- Breites Bildformat, hohe Auflösung.
```

---

## 2) Bo — das Bärenjunge (Bewohner)

```
Erstelle ein Charakter-Turnaround-Blatt für ein 3D-Spiel-Modell.

Figur: „Bo", ein rundliches, gutmütiges Bärenjunges. Warmes braunes Fell,
helle Schnauze, kleine runde Ohren, große freundliche dunkle Augen. Kleidung:
ein rotes Halstuch und ein kleiner Rucksack aus Leder. Wirkung: gemütlich,
herzlich, ein bisschen tollpatschig.

Stil: hochwertiger stylized 3D-Cartoon, warme Farben, cozy fantasy,
Spielfigur-Qualität — im selben Stil wie ein moderner Mobile-Adventure-Held.

WICHTIG für die 3D-Erzeugung:
- Zeige GENAU DREI Ansichten nebeneinander: von VORNE, von der SEITE, von HINTEN.
- In allen drei Ansichten exakt dieselbe Figur, dieselbe Größe, dieselbe Pose.
- A-Pose: gerade stehend, Arme leicht vom Körper weg, Beine leicht auseinander.
- Ganzkörper, nichts angeschnitten.
- Komplett einfarbiger, neutral hellgrauer Hintergrund.
- Gleichmäßiges, weiches Licht, KEINE Schlagschatten, kein Boden, keine Bühne.
- Keine Schrift, keine Beschriftungen, kein Wasserzeichen.
- Breites Bildformat, hohe Auflösung.
```

---

## 3) Vorlage für weitere Figuren

Ersetze nur den Absatz „Figur:", der Rest bleibt gleich.

```
Erstelle ein Charakter-Turnaround-Blatt für ein 3D-Spiel-Modell.

Figur: [HIER BESCHREIBEN — Tierart, Fellfarbe, Augen, Kleidung, Ausstrahlung]

Stil: hochwertiger stylized 3D-Cartoon, warme Farben, cozy fantasy,
Spielfigur-Qualität — im selben Stil wie ein moderner Mobile-Adventure-Held.

WICHTIG für die 3D-Erzeugung:
- Zeige GENAU DREI Ansichten nebeneinander: von VORNE, von der SEITE, von HINTEN.
- In allen drei Ansichten exakt dieselbe Figur, dieselbe Größe, dieselbe Pose.
- A-Pose: gerade stehend, Arme leicht vom Körper weg, Beine leicht auseinander.
- Ganzkörper, nichts angeschnitten.
- Komplett einfarbiger, neutral hellgrauer Hintergrund.
- Gleichmäßiges, weiches Licht, KEINE Schlagschatten, kein Boden, keine Bühne.
- Keine Schrift, keine Beschriftungen, kein Wasserzeichen.
- Breites Bildformat, hohe Auflösung.
```

---

## Wenn das Ergebnis nicht passt — Nachbesser-Sätze

- „Die drei Ansichten zeigen unterschiedliche Figuren. Mache alle drei exakt gleich —
  gleiche Proportionen, gleiche Kleidung, gleiche Farben."
- „Der Hintergrund ist nicht einfarbig. Mache ihn komplett neutral hellgrau, ohne
  Schatten, ohne Boden."
- „Die Figur ist angeschnitten. Zeige den kompletten Körper inklusive Füße."
- „Die Arme liegen am Körper an. Stelle die Arme leicht vom Körper weg (A-Pose)."

## Danach
1. Bild speichern und **in drei Einzelbilder schneiden** (vorne / Seite / hinten).
2. Bei **Tripo → „Multiview to 3D"** hochladen → GLB exportieren.
3. Komprimieren (Pflicht):
   ```
   npx @gltf-transform/cli optimize IN.glb OUT.glb --compress meshopt --texture-compress webp --texture-size 1024
   ```
4. Nach `fynnox-adventure/public/models/lumo.glb` legen — dann trage ich die Figur ins Level ein.
