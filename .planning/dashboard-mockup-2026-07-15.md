# Dashboard-/Menü-Vorlage (Nutzer-Mockup, 2026-07-15)

> Verbindliche Design-Vorlage für das Menü-Redesign. Vom Nutzer als Bild geliefert.
> Ziel: dieses Layout so nah wie möglich in `MainMenu.tsx` nachbauen (premium/modern).
> Zusammenhang: [[ui-premium-erwartung]], [[fynnox-adventure-status]].

## Gesamteindruck
Vollflächiges, gemaltes Wald-Cover (Holzbrücke über türkisem Wasserfall, warme Holzhäuser mit
leuchtenden Fenstern, Weg mit Holzzaun, Nadelbäume, Abendlicht). Darüber eine moderne, dunkle
**Glas-UI** (rounded, backdrop-blur, weiche Schatten). Sehr aufgeräumt, klare Hierarchie.

## Kopfzeile
- **Links:** abgerundete Glas-Pille mit quadratischem Fynnox-Avatar-Icon + „Fynnox **Studios**"
  (Studios in Orange).
- **Rechts:** Glas-Pille mit zwei Zählern — **gelbes Gem 0** und **lila Gem 0** (zwei Währungen!),
  dann runder **Zahnrad-Button** (Einstellungen) + runder **Lautsprecher-Button** (Mute).

## Hero (links)
- **Großer Ganzkörper-Fynnox im KORREKTEN Look** (oranger Fuchs, **Fliegerbrille auf dem Kopf,
  blauer Schal, grüne Tunika, brauner Gürtel/Handschuhe/Stiefel**, große blaue Augen) — NICHT der
  alte blaue „P"-Anzug (front.png/victory.png)! → braucht ein NEUES Hero-Bild in diesem Look
  (Nutzer-ChatGPT-Art, transparenter Hintergrund). Steht auf einer kleinen Gras-Klippe.
- **Titel:** „Fynnox" (weiß, sehr fett) über „Adventure" (orange), mit kleinem Blatt-Akzent am „e".
- **Untertitel:** „Laufe, springe und sammle mit Fynnox durch bunte Welten! 🐾".

## Rechte Navigations-Leiste (vertikale Glas-Buttons)
1. **▶ Spielen** — großer, oranger Primär-Button (hebt sich klar ab).
2. **Welten** (Icon Kompass/Globus)
3. **Charakter** (Icon Fuchs)
4. **Sammelbuch** (Icon Buch)
5. **Erfolge** (Icon Pokal)
6. **Einstellungen** (Icon Zahnrad)
→ Dunkle, halbtransparente, abgerundete Buttons mit Icon links + Label. (Neue Sektionen — aktuell
gibt es nur „Spielen"/„Welten". Rest kann vorerst Platzhalter/„Bald" sein.)

## Welt-Auswahl (unten links)
- Überschrift „🍃 WÄHLE DEINE WELT".
- Karten-Reihe (Glas-Karten, Bild oben, Name + Status unten):
  1. **Sunforest** — Badge „**Neu**", aktiv, oranger Glow-Rahmen, „Fortschritt: 12 %".
  2. **Kristallwüste** — „Gesperrt" (Schloss).
  3. **Vulkanlande** — „Gesperrt".
  4. **Eiswindtundra** — „Gesperrt".
  5. **Sternenstadt** — „Gesperrt".
- Darunter **Karussell-Punkte** (Pagination-Dots), erster aktiv (orange).
- NB: Neue, englisch/fantasievolle Welt-Namen (Sunforest, Kristallwüste, Vulkanlande,
  Eiswindtundra, Sternenstadt) statt der bisherigen (Wald, Zuckerwirbel, Vulkanpfad, Gletscher,
  Neon-Stadt). Mit Nutzer klären, ob umbenennen — Level-`world`-Keys bleiben technisch gleich.

## Fußzeile
- Links: „🎮 Handy: Kreuz • SPRUNG/DASH • PC: Pfeiltasten, Leertaste, Shift".
- Mitte/rechts: Chip „☁ Cloud-Speicherung — **Aktiv**" (grün). (Aktuell nur localStorage → Chip
  ggf. als „Lokal gespeichert" ehrlich benennen, KEINE Cloud vortäuschen.)
- Rechts: „© 2025 Fynnox Studios".

## Umsetzungs-Hinweise
- Bereits vorbereitet: CSS-Klassen in `src/index.css` (`.fa-glass`, `.fa-card`, `.fa-cta`,
  `.fa-splash*`, Animationen). Diese für Glas-Look/Hover nutzen.
- Fehlt noch: `SplashScreen.tsx` (Cover-Popup vor dem Menü), modernes `MainMenu.tsx`, `App.tsx`-Flow.
- Ehrlichkeit (CLAUDE.md §4): keine erfundene „Cloud", keine zweite Fake-Währung ohne Funktion —
  entweder echt umsetzen oder weglassen/umbenennen. Mit Nutzer abstimmen.
- Das Original-Mockup-Bild liegt beim Nutzer; bei Bedarf als `art/mockups/dashboard.png` ablegen.
