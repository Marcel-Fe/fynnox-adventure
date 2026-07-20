# ChatGPT-Prompts für die Küstenbucht (Stand 2026-07-20)

Fortsetzung von `asset-prompts-2026-07-19.md`. Zwei Dinge fehlen der Küste noch:
eine Plattform-Kachel (die Plattformen tragen dort noch eine Wald-Grasnarbe) und
eigene Strand-Deko (aktuell recycelt sie Felsen und Treibholz aus dem Wald-Blatt).

## Die drei Regeln — bitte NICHT kürzen

1. **SEITENANSICHT.** Das Spiel ist ein 2,5D-Seitenscroller. ChatGPT liefert von sich
   aus gern Iso-/Vogelperspektive — die ist unbrauchbar.
2. **MAGENTA-HINTERGRUND (#FF00FF).** Kein Weiß, kein Grau, kein Verlauf.
   („Transparent" liefert ChatGPT oft nicht wirklich.)
3. **EIN freistehendes Objekt, kein Bodenschatten.** Den Schatten macht das Spiel selbst.

> Ausnahme: **K1 (Kachel)** ist eine Material-Textur — die ist vollflächig, ohne Magenta,
> und muss sich nahtlos wiederholen lassen.

---

## K1 — Holzplanken-Kachel für die Strand-Plattformen (WICHTIGSTE, 1 Bild)

Warum zuerst: Die Plattformen in der Bucht zeigen noch die Wald-Kachel mit grüner
Grasnarbe. Holzplanken passen zur Welt („Die alten Stege" ist Level 2-2) und zu den
gemalten Stegen im Hintergrund-Panorama.

```
Eine nahtlos kachelbare Material-Textur aus verwitterten Holzplanken für ein
familienfreundliches Cartoon-Spiel. STRIKT FRONTAL VON DER SEITE gesehen,
orthografisch, KEINE Perspektive, KEINE Vogelperspektive.

Motiv: waagerecht liegende, alte Holzbohlen eines Stegs, übereinander gestapelt,
sichtbare Holzmaserung, abgerundete Kanten, einzelne dunkle Astlöcher, verrostete
Nagelköpfe, an den Rändern leicht abgeschliffen und vom Salzwasser gebleicht.
Warme mittelbraune bis sandbraune Töne, oben etwas heller ausgeblichen.

Stil: hochwertig handgemalter Cartoon-Look, weiche plastische Schattierung,
freundlich, nicht düster, nicht fotorealistisch, nicht schmutzig.

WICHTIG: Die Textur muss sich NAHTLOS wiederholen lassen — der linke Bildrand muss
exakt an den rechten Bildrand passen, ohne sichtbare Naht. Das Muster füllt das Bild
vollflächig aus, gleichmäßig verteilt, KEIN Rahmen, KEIN einzelnes Objekt, KEIN
Hintergrund, KEIN Gras, KEINE Pflanzen, KEIN Himmel.

Exaktes Quadrat. Kein Text, keine Beschriftung, kein Wasserzeichen.
```

*Verarbeitung:* `node scripts/prep-tile.mjs "<datei>.png" platform_planks`
→ Die Nahtmessung muss „kachelt sauber" melden (Randabstand < 30).

---

## K2 — Palme als Baum-Billboard (1 Bild)

Die Küste hat aktuell **gar keine Bäume**, obwohl das Panorama voller Palmen ist.

```
Eine einzelne hohe Kokospalme, gemalte 2D-Spielgrafik für ein familienfreundliches
Cartoon-Adventure. STRIKT SEITENANSICHT auf Augenhöhe, orthografisch, KEINE
Vogelperspektive, KEINE isometrische Ansicht.

Motiv: leicht geschwungener schlanker Stamm mit gemalter Ringstruktur, oben eine
Krone aus großen gefiederten Wedeln, die weit nach außen und unten schwingen,
zwei bis drei braune Kokosnüsse am Kronenansatz, kräftige Wurzelansätze unten.

Stil: hochwertig handgemalter Cartoon-Look, satte frische Grüntöne mit hellen
Wedelspitzen, warmes Sonnenlicht von oben links, weiche plastische
Volumen-Schattierung. Freundlich und einladend, nicht düster, nicht realistisch.

Die Palme füllt das Bild vollständig aus und ist komplett zu sehen (Wurzeln unten,
Wedelspitzen oben, nichts angeschnitten). Sie steht frei, KEIN Boden, KEIN Sand,
KEIN Schatten auf dem Boden, KEINE Landschaft, KEIN Strand.

Hintergrund: einfarbig reines Magenta #FF00FF, absolut gleichmäßig, ohne Verlauf,
ohne Muster, ohne Textur.

Kein Text, keine Beschriftung, kein Rahmen, kein Wasserzeichen, nur dieses eine
Objekt. Hochformat.
```

*Verarbeitung:* `node scripts/cut-asset.mjs "<datei>.png" tree_palm`

**Optional zweite Palme** (damit der Strand nicht kopiert wirkt): denselben Prompt
nochmal, aber „**eine kleinere, breitere Palme mit zwei Stämmen, die sich unten
gabeln, ohne Kokosnüsse**". Name dann `tree_palm2`.

---

## K3 — Strand-Deko als Sammelblatt (1 Bild)

Diese Objekte sind im Spiel klein, deshalb teilen sie sich ein Blatt.

```
Ein Asset-Blatt mit genau 8 einzelnen Strand-Objekten für ein familienfreundliches
Cartoon-Adventure, sauber nebeneinander in EINER Reihe angeordnet, mit deutlichem
Abstand zueinander, sich NICHT berührend und NICHT überlappend.

Die 8 Objekte in dieser Reihenfolge:
1. großer heller Küstenfels mit Muscheln und Seepocken daran
2. mittlerer runder Strandstein, glatt geschliffen
3. gebleichtes Stück Treibholz mit knorrigen Ästen
4. Büschel hohes Strandgras / Dünengras
5. Gruppe aus drei Muscheln (eine große Schneckenmuschel, zwei kleine)
6. roter Seestern
7. altes Holzfass, liegend, mit Metallreifen
8. kurzer verwitterter Steg-Pfahl mit Tau umwickelt

Alle Objekte in STRIKTER SEITENANSICHT auf Augenhöhe, orthografisch, KEINE
Vogelperspektive, KEINE isometrische Ansicht.

Stil: hochwertig handgemalter Cartoon-Look, helle sonnige Strandfarben (Sandbeige,
gebleichtes Holz, Muschelweiß, Korallenrot), weiche plastische Volumen-Schattierung,
warmes Sonnenlicht von oben links. Jedes Objekt frei stehend, KEIN Boden darunter,
KEIN Sand, KEIN Schatten auf dem Boden. KEIN Moos, KEIN grünes Gras an den Steinen.

Hintergrund: einfarbig reines Magenta #FF00FF, absolut gleichmäßig, ohne Verlauf.

Kein Text, keine Beschriftung, keine Nummern, keine Rahmen, keine Trennlinien.
Querformat, die Objekte füllen das Bild möglichst groß aus.
```

*Verarbeitung:* `node scripts/cut-sheet.mjs "<datei>.png" coast_rock coast_pebble
driftwood beachgrass shells starfish barrel post`

---

## Wenn ChatGPT nicht mitspielt

- **Iso-/Schrägansicht:** „Bitte exakt von der Seite, auf Augenhöhe, wie in einem
  2D-Jump-and-Run. Keine Draufsicht."
- **Magenta fleckig:** „Der Hintergrund muss eine einzige völlig gleichmäßige Fläche in
  reinem Magenta #FF00FF sein, ohne jede Schattierung."
- **Schatten unterm Objekt:** „Entferne den Schlagschatten unter dem Objekt vollständig."
- **Kachel hat eine Naht:** „Die Textur muss nahtlos kacheln: der linke Rand muss exakt
  auf den rechten Rand passen und der obere auf den unteren."

## Ablage

PNG einfach in den Ordner `Fynnox Adventure APP/` legen — ich hole sie mir von dort,
rechne Magenta weg, komprimiere nach WebP und baue sie ein.
