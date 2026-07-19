# ChatGPT-Prompts für Einzel-Assets (Stand 2026-07-19)

**Warum diese Liste:** Die Konzept-Bögen vom 19.07. sind großartig als Richtungsgeber, aber
die Einzelobjekte darauf sind nur ca. **65 × 95 Pixel** groß (nachgemessen am Baum-Panel in
`ChatGPT Image 19. Juli 2026, 15_05_51.png`, 1536 × 1024 gesamt). Für Deko, die im Spiel neben
Fynnox steht, brauchen wir ca. **1000 px Höhe** — Faktor 10 mehr. Deshalb: Einzelbilder.

**Reihenfolge nach Nutzwert.** Paket A ist das Wichtigste — damit verschwinden die eckigen Bäume.

---

## Die drei Regeln, an denen es sonst scheitert

1. **SEITENANSICHT.** Das Spiel ist ein 2,5D-Seitenscroller. ChatGPT liefert von sich aus
   gern Iso-/Vogelperspektive — die ist unbrauchbar. Steht in jedem Prompt drin, bitte nicht kürzen.
2. **MAGENTA-HINTERGRUND (#FF00FF).** Kein Weiß, kein Grau, kein Verlauf. Magenta kommt im
   Motiv nirgends vor, deshalb kann ich es sauber wegrechnen. „Transparent" liefert ChatGPT
   oft nicht wirklich.
3. **EIN Objekt, formatfüllend, vollständig im Bild.** Kein Text, keine Beschriftung, keine
   Rahmen, keine Collage, kein zweites Objekt daneben, nichts angeschnitten.

---

## PAKET A — Bäume (bitte zuerst, 6 Bilder)

> Je ein eigenes Bild. Wenn dir das zu viele sind: die ersten drei reichen für den Anfang.

### A1 — Großer Laubbaum

```
Ein einzelner großer Laubbaum, gemalte 2D-Spielgrafik für ein familienfreundliches
Cartoon-Adventure. STRIKT SEITENANSICHT auf Augenhöhe, orthografisch, KEINE
Vogelperspektive, KEINE isometrische Ansicht.

Stil: hochwertig handgemalter Cartoon-Look, satte warme Grüntöne, weiche plastische
Volumen-Schattierung, sichtbare einzelne Blattbüschel und Blattstruktur, kräftiger
brauner Stamm mit gemalter Rindenstruktur und sichtbaren Wurzelansätzen, warmes
Sonnenlicht von oben links, weiche Schatten in der Krone. Freundlich und einladend,
nicht düster, nicht realistisch, nicht fotorealistisch.

Der Baum füllt das Bild vollständig aus und ist komplett zu sehen (Wurzeln unten,
Kronenspitze oben, nichts angeschnitten). Er steht frei, KEIN Boden, KEIN Gras,
KEIN Schatten auf dem Boden, KEINE Landschaft.

Hintergrund: einfarbig reines Magenta #FF00FF, absolut gleichmäßig, ohne Verlauf,
ohne Muster, ohne Textur.

Kein Text, keine Beschriftung, kein Rahmen, kein Wasserzeichen, nur dieses eine Objekt.
Hochformat.
```

### A2 — Nadelbaum / Tanne

```
[A1 kopieren, aber statt „Ein einzelner großer Laubbaum" schreiben:]

Ein einzelner hoher Nadelbaum (Tanne), schlank und spitz zulaufend, mit gestaffelten
Zweig-Etagen und dichten dunkelgrünen Nadeln, kräftiger brauner Stamm.

[Rest des Prompts A1 unverändert übernehmen.]
```

### A3 — Schlanke Birke

```
[A1 kopieren, aber:]

Eine einzelne schlanke Birke mit hellem, weiß-schwarz gemustertem Stamm und locker
herabhängenden, hellgrünen Blattzweigen.

[Rest von A1 unverändert.]
```

### A4 — Busch / Strauch

```
[A1 kopieren, aber:]

Ein einzelner runder, dichter Busch mit vielen kleinen Blättern, ohne sichtbaren
Stamm, breiter als hoch.

[Rest von A1 unverändert, aber am Ende „Hochformat" ersetzen durch „Querformat".]
```

### A5 — Farn / Unterholz-Büschel

```
[A1 kopieren, aber:]

Ein einzelnes Büschel aus großen Farnwedeln, die fächerförmig auseinander wachsen,
sattes Grün mit hellen Spitzen.

[Rest von A1 unverändert, am Ende „Querformat".]
```

### A6 — Bemooster Baumstumpf

```
[A1 kopieren, aber:]

Ein einzelner alter Baumstumpf mit abgesägter Oberfläche, Moospolster und kleinen
Pilzen am Fuß, sichtbare Rindenstruktur und Jahresringe.

[Rest von A1 unverändert, am Ende „Querformat".]
```

---

## PAKET B — Boden-Deko (1 Bild, Sammelblatt reicht)

Diese Objekte sind im Spiel klein, deshalb dürfen sie sich ein Blatt teilen.

```
Ein Asset-Blatt mit genau 8 einzelnen Natur-Objekten für ein familienfreundliches
Cartoon-Adventure, sauber nebeneinander in EINER Reihe angeordnet, mit deutlichem
Abstand zueinander, sich NICHT berührend und NICHT überlappend.

Die 8 Objekte in dieser Reihenfolge:
1. großer grauer Felsblock mit Moos obenauf
2. mittlerer runder Stein
3. kleiner Kieselstein
4. liegender Baumstamm mit Rinde
5. Grasbüschel
6. Gruppe roter Fliegenpilze
7. kleine blaue Waldblumen
8. Gruppe kleiner Steine

Alle Objekte in STRIKTER SEITENANSICHT auf Augenhöhe, orthografisch, KEINE
Vogelperspektive, KEINE isometrische Ansicht.

Stil: hochwertig handgemalter Cartoon-Look, satte Farben, weiche plastische
Volumen-Schattierung, warmes Sonnenlicht von oben links. Jedes Objekt frei stehend,
KEIN Boden darunter, KEIN Schatten auf dem Boden.

Hintergrund: einfarbig reines Magenta #FF00FF, absolut gleichmäßig, ohne Verlauf.

Kein Text, keine Beschriftung, keine Nummern, keine Rahmen, keine Trennlinien.
Querformat, die Objekte füllen das Bild möglichst groß aus.
```

---

## PAKET C — Waldhäuser (3 Bilder)

```
Ein einzelnes gemütliches Fachwerk-Waldhaus, gemalte 2D-Spielgrafik für ein
familienfreundliches Cartoon-Adventure. STRIKT SEITENANSICHT auf Augenhöhe,
orthografisch, das Haus zeigt seine BREITE Längsseite zum Betrachter, KEINE
Eckansicht, KEINE Vogelperspektive, KEINE isometrische Ansicht.

Stil: hochwertig handgemalter Cartoon-Look, warme Holztöne, Fachwerkbalken,
Schindeldach in gedecktem Blau, warm leuchtende Fenster, Steinsockel, Schornstein
mit Rauch, Blumenkästen. Einladend und märchenhaft, leicht schief und
handgezimmert wirkend, nicht steril, nicht realistisch.

Das Haus füllt das Bild vollständig aus und ist komplett zu sehen, nichts
angeschnitten. Es steht frei, KEIN Boden, KEIN Gras, KEIN Weg, KEIN Schatten auf
dem Boden, KEINE Landschaft, KEINE anderen Häuser.

Hintergrund: einfarbig reines Magenta #FF00FF, absolut gleichmäßig, ohne Verlauf.

Kein Text, keine Beschriftung, kein Rahmen, nur dieses eine Gebäude. Querformat.
```

> Für Haus 2 und 3: denselben Prompt nehmen und das Dach variieren
> („rotes Ziegeldach" / „grünes bemoostes Dach") sowie „mit kleinem Anbau und
> Außentreppe" bzw. „mit Windrad auf dem Dach" ergänzen.

---

## PAKET D — Vordergrund-Rahmen (1 Bild)

Das ist der Trick, der Tiefe erzeugt: unscharfe Blätter ganz vorn im Bild.

```
Ein Vordergrund-Overlay für ein 2D-Spiel: dichte, große Blätter und dünne Zweige,
die nur vom oberen Bildrand und von den beiden Seitenrändern nach innen ragen und
die BILDMITTE komplett frei lassen.

Stil: hochwertig handgemalter Cartoon-Look, dunkle sattgrüne Blätter, weiches
Gegenlicht, leicht unscharf wie ein Kamera-Vordergrund.

Die gesamte Bildmitte muss reines Magenta #FF00FF sein, ebenso der untere Bildrand.
Hintergrund insgesamt: einfarbig reines Magenta #FF00FF, absolut gleichmäßig.

Kein Text, kein Rahmen, keine Objekte in der Bildmitte. Breites Querformat 16:9.
```

---

## PAKET E — Fynnox als Menü-Held (1 Bild, für das Dashboard)

Im Menü steht aktuell ein billiger Vektor-Fuchs. Der hier ersetzt ihn.

```
Fynnox, ein junger freundlicher Fuchs-Held, GANZKÖRPER in selbstbewusster
Heldenpose, leicht schräg zum Betrachter gedreht, Blick zum Betrachter, breites
sympathisches Lächeln.

Aussehen (verbindlich): warmes oranges Fell, weiße Brust und Schwanzspitze, SEHR
GROSSE glänzende blaue Augen, Fliegerbrille auf der Stirn, blauer Schal, grüne
Tunika, braune Handschuhe und Stiefel. Süß, mutig, jung, freundlich — niemals
gruselig, niemals aggressiv, niemals realistisch-bedrohlich.

Stil: hochwertig handgemalter 3D-Cartoon-Look wie in einem modernen
Familien-Animationsfilm, weiche plastische Schattierung, warmes Licht von oben
links, sattes kräftiges Farbschema.

Die Figur füllt das Bild vollständig aus, komplett zu sehen von den Stiefeln bis
zu den Ohrspitzen, nichts angeschnitten. KEIN Boden, KEIN Schatten auf dem Boden,
KEINE Landschaft, KEINE Requisiten.

Hintergrund: einfarbig reines Magenta #FF00FF, absolut gleichmäßig, ohne Verlauf.

Kein Text, keine Beschriftung, kein Rahmen, kein Logo. Hochformat.
```

---

## Wenn ChatGPT nicht mitspielt

- **Liefert Iso-/Schrägansicht:** hinterherschieben — „Bitte exakt von der Seite,
  auf Augenhöhe, wie in einem 2D-Jump-and-Run. Keine Draufsicht."
- **Magenta ist fleckig/verlaufend:** „Der Hintergrund muss eine einzige völlig
  gleichmäßige Fläche in reinem Magenta #FF00FF sein, ohne jede Schattierung."
- **Schatten liegt trotzdem unterm Objekt:** „Entferne den Schlagschatten unter dem
  Objekt vollständig." (Den Schatten macht das Spiel selbst — sonst klebt ein
  dunkler Fleck im Bild.)
- **Objekt angeschnitten:** „Zoome heraus, das gesamte Objekt muss mit etwas
  Abstand zum Bildrand vollständig sichtbar sein."

## Ablage

Alles einfach als PNG in den Projektordner `Fynnox Adventure APP/` legen — ich hole sie
mir von dort, rechne Magenta weg, schneide zu, komprimiere nach WebP und baue sie ein.
Dateinamen egal, ich erkenne sie am Datum.
