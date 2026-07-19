# Was ich für den gemalten Welt-Look brauche (Parallax-Hintergründe)

> Entscheidung vom 2026-07-16: gemalte Hintergründe als Parallax-Ebenen (statt prozeduraler
> Formen). Ziel: die Spielwelt sieht aus wie die Landschaften in Abschnitt 2 des Referenz-Sheets
> („Landschaften — Gameplay-Perspektive").

## Warum ich neue Bilder brauche
Die Landschaften im großen Sheet sind nur ~140×90 px groß — viel zu klein. Ich brauche sie
**einzeln und groß** neu erzeugt.

## Ablage
```
fynnox-adventure/public/art/bg/wald/
   far.png    (Pflicht)
   mid.png    (optional, stärkerer Effekt)
   near.png   (optional, Rahmen)
```
Später je Welt ein eigener Ordner (`candy/`, `vulkan/`, `eis/`, `neon/`).

## Die 3 Ebenen (Wald zuerst)

| Datei | Inhalt | Hintergrund | Bewegt sich |
|---|---|---|---|
| `far.png` | Himmel, Berge, ferner Wald, Dunst | deckend (mit Himmel) | sehr langsam |
| `mid.png` | Dorf, Baumhaus, Hügel, große Bäume | **Magenta #FF00FF** | mittel |
| `near.png` | Büsche/Farne/Äste als Rahmen links+rechts | **Magenta #FF00FF** | schnell |

**Magenta-Hintergrund** statt Transparenz, weil ChatGPT kein sauberes Alpha liefert — ich keye
das Magenta weich raus (gleicher Weg wie beim Fynnox-Sprite, siehe Look-Workflow).

## Technische Anforderungen (wichtig!)
- **Seitenansicht auf Augenhöhe** (wie ein Jump-&-Run-Screenshot) — NICHT von oben/isometrisch.
- **Breites Format:** mind. `2560×1024` (gern `3072×1024`). Je breiter, desto besser.
- **Horizont auf gleicher Höhe** bei allen 3 Ebenen (sonst passen sie nicht zusammen).
- Keine Figuren, keine UI, keine Schrift im Bild.
- Stil konsistent zum Sheet: „stylized 3D, warm colors, cozy fantasy, high quality".

## Fertige Prompts zum Kopieren (ChatGPT)

**1) far.png**
```
Ein breites Hintergrundbild für ein 2,5D-Jump-and-Run, Seitenansicht auf Augenhöhe.
Ferne Landschaft: sanfte Hügel, bewaldete Berge, zarter Morgendunst, warmer blauer Himmel
mit weichen Wolken. Stil: stylized 3D, warm colors, cozy fantasy, high quality, wie ein
modernes Mobile-Adventure. Sehr breites Panorama-Format (2560x1024), Horizont in der
unteren Bildhälfte. Keine Figuren, keine Schrift, keine UI.
```

**2) mid.png**
```
Mittlere Parallax-Ebene für ein 2,5D-Jump-and-Run, Seitenansicht auf Augenhöhe.
Gemütliches Waldbrand-Dorf: Holzhäuser mit warm leuchtenden Fenstern, ein Baumhaus,
große Laubbäume und Tannen, Holzzaun, kleiner Wasserfall. Alles freigestellt auf
einem KOMPLETT EINFARBIGEN MAGENTA-HINTERGRUND (#FF00FF), kein Himmel, keine Wolken.
Stil: stylized 3D, warm colors, cozy fantasy, high quality. Sehr breites Format
(2560x1024). Keine Figuren, keine Schrift, keine UI.
```

**3) near.png**
```
Vordergrund-Ebene für ein 2,5D-Jump-and-Run, Seitenansicht.
Nur Pflanzen im Vordergrund: große Farne, Büsche, Grasbüschel und ein paar Äste,
die den Bildrand links und unten rahmen. Bildmitte bleibt frei. Alles auf einem
KOMPLETT EINFARBIGEN MAGENTA-HINTERGRUND (#FF00FF). Leicht dunkler/satter als der
Hintergrund. Stil: stylized 3D, warm colors, cozy fantasy, high quality.
Sehr breites Format (2560x1024). Keine Figuren, keine Schrift.
```

## Wenn nur EIN Bild möglich ist
Dann nur `far.png` — das allein hebt den Look schon massiv. `mid`/`near` bringen die Tiefe.

## Was ich damit baue
`render/Parallax3D.tsx`: die Ebenen als große Planes bei verschiedenen z-Tiefen hinter dem
Spielfeld; die Seitenkamera erzeugt die Parallaxe automatisch (weiter weg = bewegt sich
langsamer). Prozedurale Hügel/ferne Bäume werden dann ausgedünnt, damit sie nicht
gegen das gemalte Bild arbeiten. Die Lebens-Ebene (Schmetterlinge/Blätter/Vögel) bleibt davor.
