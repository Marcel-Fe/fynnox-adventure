// Story-Bogen von Fynnox Adventure. Kurz, warm, familienfreundlich — und komplett
// eigenständig (keine fremden Figuren oder Marken, CLAUDE.md §4).
//
// Roter Faden: Im Sonnenwald verschwindet das Glitzern der Kristalle. Fynnox macht sich
// auf, sie zurückzubringen — und folgt der Spur bis in den Zuckerwirbel.

export type StoryKind = 'intro' | 'outro'

export interface StoryBeat {
  chapter: string // z. B. „Kapitel 1"
  title: string
  text: string[] // Absätze
  portrait: string // Bild links (Pfad unter public/)
  cta?: string // Beschriftung des Weiter-Buttons
}

const INTRO: Record<string, StoryBeat> = {
  'wald-1': {
    chapter: 'Kapitel 1',
    title: 'Ein Morgen ohne Glitzern',
    text: [
      'Sonst funkelt der Sonnenwald schon beim ersten Licht. Heute nicht: die Kristalle sind still und grau.',
      'Fynnox stellt die Ohren auf, schnürt seinen blauen Schal fester — und läuft los.',
    ],
    portrait: 'art/fynnox/portrait.png',
    cta: 'Los geht’s!',
  },
  'wald-2': {
    chapter: 'Kapitel 2',
    title: 'Die Schaukelbrücke',
    text: [
      '„Da hinten schaukeln die alten Holzstege", sagt Bo. „Seit gestern hören sie nicht mehr auf zu wippen."',
      'Fynnox schaut den wandernden Plattformen zu und wartet auf den richtigen Moment.',
    ],
    portrait: 'art/npc/bo_front.webp',
  },
  'wald-3': {
    chapter: 'Kapitel 3',
    title: 'Der Kristallhain',
    text: [
      'Hinter der Brücke steigt der Weg steil an. Ganz oben liegt der Hain, in dem alle Kristalle des Waldes wachsen.',
      'Von hier oben sieht Fynnox zum ersten Mal, wie groß sein Abenteuer wirklich ist.',
    ],
    portrait: 'art/previews/wald.png',
  },
  'candy-1': {
    chapter: 'Kapitel 4',
    title: 'Ein süßer Wind',
    text: [
      'Aus dem Westen weht ein Duft nach Zuckerguss. Die Spur der Kristalle führt genau dorthin.',
      'Fynnox atmet tief durch. Der Zuckerwirbel wartet — weich, klebrig und voller Wirbel.',
    ],
    portrait: 'art/previews/zuckerwirbel.png',
  },
}

const OUTRO: Record<string, StoryBeat> = {
  'wald-1': {
    chapter: 'Kapitel 1',
    title: 'Der erste Funke',
    text: [
      'Am Ende des Weges glimmt ein Kristall wieder auf — leise, aber deutlich.',
      '„Du bist auf der richtigen Fährte", ruft Bo von der Lichtung. „Weiter zur Schaukelbrücke!"',
    ],
    portrait: 'art/fynnox/victory.png',
    cta: 'Weiter',
  },
  'wald-2': {
    chapter: 'Kapitel 2',
    title: 'Eine Spur nach oben',
    text: [
      'Die Stege liegen wieder ruhig. Im Holz steckt ein kleiner Splitter Kristallstaub.',
      'Er glitzert bergauf — genau in Richtung Kristallhain.',
    ],
    portrait: 'art/fynnox/victory.png',
    cta: 'Weiter',
  },
  'wald-3': {
    chapter: 'Kapitel 3',
    title: 'Der Hain leuchtet',
    text: [
      'Ein Kristall nach dem anderen erwacht. Der ganze Sonnenwald liegt wieder im Funkeln.',
      'Doch ein Kristall fehlt — und aus dem Westen weht etwas sehr Süßes herüber.',
    ],
    portrait: 'art/fynnox/victory.png',
    cta: 'Weiter',
  },
  'candy-1': {
    chapter: 'Kapitel 4',
    title: 'Fortsetzung folgt',
    text: [
      'Der Zuckerwirbel dreht sich wieder ruhig, und Fynnox schleckt sich die Pfote sauber.',
      'Drei Welten warten noch: Vulkanlande, Eiswindtundra und Sternenstadt. Fynnox ist bereit.',
    ],
    portrait: 'art/fynnox/portrait.png',
    cta: 'Zum Menü',
  },
}

export function storyFor(levelId: string, kind: StoryKind): StoryBeat | null {
  return (kind === 'intro' ? INTRO : OUTRO)[levelId] ?? null
}
