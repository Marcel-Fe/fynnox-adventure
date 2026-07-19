import { useState, useSyncExternalStore } from 'react'
import { useGameStore } from '../store/gameStore'
import { asset } from '../utils/asset'
import { C } from './theme'
import { LevelSelect } from './LevelSelect'
import { AchievementsPanel, CharacterPanel, SettingsPanel } from './MenuPanel'
import { isUnlocked, LEVEL_ORDER, WORLD_GROUPS } from '../game/levels'
import { isMuted, toggleMute, subscribeMusic } from '../audio/music'

interface WorldTile {
  key: string
  name: string
  subtitle: string
  img: string
}

// Die sechs Welten aus dem Konzept-Artwork des Nutzers, inklusive seiner Kurzbeschreibungen.
// Vorher standen hier aus dem Kart-Projekt geerbte Fantasienamen mit Rennstrecken-Bildern.
// Ob eine Welt spielbar ist, ergibt sich aus dem Fortschritt (WORLD_GROUPS), nicht aus
// einem festen Flag.
const WORLDS: WorldTile[] = [
  { key: 'forest', name: 'Sonnenwald', subtitle: 'Lebendige Wälder voller Geheimnisse', img: 'art/previews/w_forest.webp' },
  { key: 'coast', name: 'Küstenbucht', subtitle: 'Strände, Häfen und klares Wasser', img: 'art/previews/w_coast.webp' },
  { key: 'lava', name: 'Lavahöhle', subtitle: 'Hitze, Lavaflüsse und Power-ups', img: 'art/previews/w_lava.webp' },
  { key: 'winter', name: 'Winterwald', subtitle: 'Rutschiges Eis, verborgene Höhlen', img: 'art/previews/w_winter.webp' },
  { key: 'ruins', name: 'Vergessene Stadt', subtitle: 'Alte Ruinen voller Fallen', img: 'art/previews/w_ruins.webp' },
  { key: 'crystal', name: 'Kristallhöhlen', subtitle: 'Schillernde Kristalle, dunkle Seen', img: 'art/previews/w_crystal.webp' },
]

type PanelKind = 'worlds' | 'character' | 'achievements' | 'settings'

// Rechte Navigations-Leiste. Was noch nicht existiert, bleibt ehrlich als „Bald"
// markiert — keine Fake-Buttons (CLAUDE.md §4).
const NAV: { icon: string; label: string; panel?: PanelKind; soon?: boolean }[] = [
  { icon: '🧭', label: 'Welten', panel: 'worlds' },
  { icon: '🦊', label: 'Charakter', panel: 'character' },
  { icon: '📖', label: 'Sammelbuch', soon: true },
  { icon: '🏆', label: 'Erfolge', panel: 'achievements' },
  { icon: '⚙️', label: 'Einstellungen', panel: 'settings' },
]

function HeaderMute() {
  const muted = useSyncExternalStore(subscribeMusic, isMuted, isMuted)
  return (
    <button
      onClick={toggleMute}
      className="fa-glass"
      aria-label={muted ? 'Musik an' : 'Musik aus'}
      title={muted ? 'Musik an' : 'Musik aus'}
      style={{ width: 44, height: 44, borderRadius: 14, color: '#fff', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}

export function MainMenu() {
  const beginLevel = useGameStore((s) => s.beginLevel)
  const save = useGameStore((s) => s.save)
  const [openWorld, setOpenWorld] = useState<string | null>(null)
  const [panel, setPanel] = useState<PanelKind | null>(null)
  const totalStars = Object.values(save.bestStars).reduce((a, b) => a + b, 0)

  // Fortschritt je Welt: Anteil der erreichten Sterne an allen möglichen.
  const progressOf = (key: string) => {
    const g = WORLD_GROUPS.find((w) => w.key === key)
    if (!g) return 0
    const got = g.levels.reduce((a, id) => a + (save.bestStars[id] ?? 0), 0)
    return Math.round((got / (g.levels.length * 3)) * 100)
  }
  const worldOpen = (key: string) => {
    const g = WORLD_GROUPS.find((w) => w.key === key)
    return !!g && isUnlocked(g.levels[0], save)
  }

  // „Spielen" führt dorthin, wo es weitergeht: erstes freigeschaltetes, noch nicht
  // abgeschlossenes Level — sonst zurück ins allererste.
  const continueId = LEVEL_ORDER.find((id) => isUnlocked(id, save) && !save.done[id]) ?? LEVEL_ORDER[0]

  return (
    <div className="fa-menu" style={{ position: 'fixed', inset: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      {/* Cover + Verlauf */}
      {/* Das gemalte Wald-Panorama aus dem Spiel — das alte Preview stammte aus dem
          Kart-Projekt und zeigte eine Rennstrecke, was zu einem Jump-&-Run nicht passt. */}
      <img src={asset('art/bg/wald/far.webp')} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,16,32,0.55) 0%, rgba(8,16,32,0.2) 32%, rgba(8,16,32,0.35) 62%, rgba(6,12,24,0.85) 100%)' }} />

      {/* ---- Kopfzeile ---- */}
      <header style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
        <div className="fa-glass" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px 7px 7px', borderRadius: 16 }}>
          <img src={asset('art/icon.png')} width={38} height={38} alt="" style={{ borderRadius: 10 }} />
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 0.3 }}>
            Fynnox <span style={{ color: C.orange }}>Studios</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="fa-glass" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 16px', borderRadius: 14, fontWeight: 800, fontSize: 16 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img src={asset('art/items/paw_coin.png')} width={22} height={22} alt="" />
              <span style={{ color: C.yellow }}>{save.totalCoins}</span>
            </span>
            <span style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)' }} />
            <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <img src={asset('art/items/star.png')} width={22} height={22} alt="" />
              <span style={{ color: C.yellow }}>{totalStars}</span>
            </span>
          </div>
          <HeaderMute />
        </div>
      </header>

      {/* ---- Hauptbereich ---- */}
      <main style={{ position: 'relative', zIndex: 2, flex: 1, minHeight: 0 }}>
        {/* Hero links */}
        <section style={{ position: 'absolute', left: 30, top: '2%', display: 'flex', alignItems: 'center', gap: 8, maxWidth: '56%' }}>
          {/* Ganzkörper-Fynnox im korrekten Look statt des alten Vektor-Portraits im
              Kreis-Avatar. Frei gestellt und ohne Rahmen — die Figur SOLL aus dem
              Layout herausragen, das wirkt hochwertiger als ein Bildchen im Kreis. */}
          <div className="fa-float" style={{ position: 'relative', flex: '0 0 auto', width: 230, height: 380, alignSelf: 'flex-end' }}>
            <div className="fa-ring" style={{ position: 'absolute', left: '50%', bottom: 6, width: 170, height: 34, transform: 'translateX(-50%)', borderRadius: '50%', background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.45), rgba(0,0,0,0))' }} />
            <img
              src={asset('art/fynnox/hero.webp')}
              alt="Fynnox"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 12px 26px rgba(0,0,0,0.55))' }}
            />
          </div>
          <div>
            <h1 style={{ margin: 0, fontWeight: 900, lineHeight: 0.92, textShadow: '0 4px 0 rgba(0,0,0,0.3)' }}>
              <span style={{ display: 'block', fontSize: 52 }}>Fynnox</span>
              <span style={{ display: 'block', fontSize: 52, color: C.orange }}>Adventure</span>
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 16.5, fontWeight: 600, color: '#eaf6ff', textShadow: '0 2px 8px rgba(0,0,0,0.7)', maxWidth: 340 }}>
              Laufe, springe und sammle mit Fynnox durch bunte Welten! 🐾
            </p>
          </div>
        </section>

        {/* Rechte Navigations-Leiste */}
        <nav style={{ position: 'absolute', right: 26, top: '8%', width: 300, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            className="fa-cta"
            onClick={() => beginLevel(continueId)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: C.orange, color: '#fff', fontSize: 24, fontWeight: 900, border: 'none', borderRadius: 18, padding: '18px 0', cursor: 'pointer', boxShadow: '0 7px 0 #b64d13' }}
          >
            ▶ Spielen
          </button>
          {NAV.map((n) => (
            <button
              key={n.label}
              className="fa-glass"
              disabled={!n.panel}
              onClick={() => {
                if (n.panel === 'worlds') setOpenWorld('forest')
                else if (n.panel) setPanel(n.panel)
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderRadius: 16, color: '#fff', fontSize: 17, fontWeight: 700, cursor: n.panel ? 'pointer' : 'default', opacity: n.panel ? 1 : 0.7, textAlign: 'left' }}
            >
              <span style={{ fontSize: 19, width: 24, textAlign: 'center' }}>{n.icon}</span>
              <span style={{ flex: 1 }}>{n.label}</span>
              {n.soon && <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', background: 'rgba(255,255,255,0.16)', padding: '3px 8px', borderRadius: 999 }}>Bald</span>}
            </button>
          ))}
        </nav>

        {/* Welt-Auswahl unten links */}
        <section style={{ position: 'absolute', left: 20, right: 340, bottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', margin: '0 6px 10px', textShadow: '0 2px 6px rgba(0,0,0,0.7)' }}>
            🍃 Wähle deine Welt
          </div>
          {/* Breite/Abstand so gewählt, dass alle SECHS Welten nebeneinander in den
              Platz links der Navigationsleiste passen (6×142 + 5×9 = 897 < 920). */}
          <div style={{ display: 'flex', gap: 9, overflowX: 'auto', paddingBottom: 8 }}>
            {WORLDS.map((w) => {
              const open = worldOpen(w.key)
              const progress = progressOf(w.key)
              const group = WORLD_GROUPS.find((g) => g.key === w.key)
              return (
                <button
                  key={w.key}
                  className="fa-card"
                  onClick={() => open && setOpenWorld(w.key)}
                  disabled={!open}
                  style={{
                    position: 'relative', flex: '0 0 auto', width: 142, height: 134, borderRadius: 16, overflow: 'hidden',
                    padding: 0, background: '#0b1220', color: '#fff', border: `3px solid ${open ? C.orange : 'rgba(255,255,255,0.22)'}`,
                    boxShadow: open ? `0 10px 26px rgba(0,0,0,0.45), 0 0 22px rgba(255,122,47,0.4)` : '0 8px 20px rgba(0,0,0,0.4)',
                  }}
                >
                  <img className="fa-thumb" src={asset(w.img)} alt={w.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: open ? 1 : 0.5 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 28%, rgba(0,0,0,0.55) 58%, rgba(0,0,0,0.92) 100%)' }} />

                  {open && progress === 0 && (
                    <span style={{ position: 'absolute', left: 8, top: 8, background: C.orange, color: '#fff', fontSize: 12, fontWeight: 900, padding: '3px 10px', borderRadius: 999, boxShadow: '0 3px 8px rgba(0,0,0,0.4)' }}>Neu</span>
                  )}
                  {!open && (
                    <span style={{ position: 'absolute', right: 8, top: 8, width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🔒</span>
                  )}

                  <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', padding: '14px 10px 10px', textAlign: 'left' }}>
                    <div style={{ fontWeight: 800, fontSize: 14.5, lineHeight: 1.15 }}>{w.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, lineHeight: 1.25 }}>
                      {open
                        ? progress > 0
                          ? `Fortschritt: ${progress} %`
                          : `${group?.levels.length ?? 0} Level · Neues Abenteuer`
                        : w.subtitle}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          {/* Karussell-Punkte (dekorativ, passend zur Vorlage) */}
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginTop: 2 }}>
            {WORLDS.map((w, i) => (
              <span key={w.key} style={{ width: i === 0 ? 22 : 8, height: 8, borderRadius: 999, background: i === 0 ? C.orange : 'rgba(255,255,255,0.4)' }} />
            ))}
          </div>
        </section>
      </main>

      {/* ---- Fußzeile ---- */}
      <footer style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 22px 12px', fontSize: 12.5, textShadow: '0 1px 4px rgba(0,0,0,0.8)' }}>
        <span style={{ opacity: 0.9 }}>🎮 Handy: Kreuz + SPRUNG/DASH · PC: Pfeiltasten, Leertaste, Shift</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span className="fa-glass" style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 999, fontWeight: 700 }}>
            💾 <span style={{ color: '#7ff0a6' }}>Fortschritt gespeichert</span>
          </span>
          <span style={{ opacity: 0.8 }}>© 2026 Fynnox Studios</span>
        </div>
      </footer>

      {openWorld && <LevelSelect worldKey={openWorld} onClose={() => setOpenWorld(null)} />}
      {panel === 'achievements' && <AchievementsPanel onClose={() => setPanel(null)} />}
      {panel === 'character' && <CharacterPanel onClose={() => setPanel(null)} />}
      {panel === 'settings' && <SettingsPanel onClose={() => setPanel(null)} />}
    </div>
  )
}
