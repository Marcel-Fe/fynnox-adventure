import { useState, useSyncExternalStore, type ReactNode } from 'react'
import { useGameStore } from '../store/gameStore'
import { achievementsFor, isUnlockedAchievement } from '../data/achievements'
import { isMuted, toggleMute, subscribeMusic } from '../audio/music'
import { asset } from '../utils/asset'
import { C } from './theme'

// Gemeinsame Hülle für die Menü-Bereiche (Erfolge, Charakter, Einstellungen).
// Bewusst als Overlay über dem Menü statt als eigener Screen im Store: die Bereiche
// sind reine Ansichten ohne Spielzustand.
function Panel({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 30, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 16, padding: 20,
        background: 'rgba(8,16,32,0.74)', backdropFilter: 'blur(6px)', color: '#fff',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.75 }}>
          {subtitle}
        </div>
        <h2 style={{ margin: '3px 0 0', fontSize: 32, fontWeight: 900, textShadow: '0 3px 0 rgba(0,0,0,0.35)' }}>{title}</h2>
      </div>

      <div style={{ width: 'min(94vw, 780px)', maxHeight: '58vh', overflowY: 'auto' }}>{children}</div>

      <button
        onClick={onClose}
        className="fa-glass"
        style={{ padding: '11px 28px', borderRadius: 16, color: '#fff', fontSize: 16.5, fontWeight: 800, cursor: 'pointer' }}
      >
        ← Zurück
      </button>
    </div>
  )
}

// --- Erfolge ---------------------------------------------------------------
export function AchievementsPanel({ onClose }: { onClose: () => void }) {
  const save = useGameStore((s) => s.save)
  const list = achievementsFor(save)
  const done = list.filter(isUnlockedAchievement).length

  return (
    <Panel title="Erfolge" subtitle={`${done} von ${list.length} geschafft`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {list.map((a) => {
          const unlocked = isUnlockedAchievement(a)
          const pct = Math.round((a.have / a.need) * 100)
          return (
            <div
              key={a.id}
              style={{
                display: 'flex', gap: 11, alignItems: 'center', padding: '11px 13px', borderRadius: 15,
                background: unlocked ? 'rgba(47,158,84,0.22)' : 'rgba(255,255,255,0.07)',
                border: `2px solid ${unlocked ? C.green : 'rgba(255,255,255,0.14)'}`,
              }}
            >
              <div style={{ fontSize: 26, filter: unlocked ? 'none' : 'grayscale(1)', opacity: unlocked ? 1 : 0.5 }}>
                {a.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{a.name}</div>
                <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.8, lineHeight: 1.3 }}>{a.hint}</div>
                {/* Fortschrittsbalken nur, wo es etwas zu zählen gibt */}
                {a.need > 1 && (
                  <div style={{ marginTop: 5, height: 6, borderRadius: 999, background: 'rgba(0,0,0,0.32)', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: unlocked ? C.green : C.orange, borderRadius: 999 }} />
                  </div>
                )}
              </div>
              {a.need > 1 && (
                <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.85, whiteSpace: 'nowrap' }}>
                  {a.have} / {a.need}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

// --- Charakter -------------------------------------------------------------
export function CharacterPanel({ onClose }: { onClose: () => void }) {
  const save = useGameStore((s) => s.save)
  const stars = Object.values(save.bestStars).reduce((a, b) => a + b, 0)
  const levels = Object.values(save.done).filter(Boolean).length

  const stat = (label: string, value: string | number, icon: string) => (
    <div className="fa-glass" style={{ flex: 1, minWidth: 130, padding: '13px 15px', borderRadius: 15, textAlign: 'center' }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div style={{ fontSize: 25, fontWeight: 900, color: C.yellow, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.82 }}>{label}</div>
    </div>
  )

  return (
    <Panel title="Fynnox" subtitle="Dein Held" onClose={onClose}>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <img
          src={asset('art/fynnox/hero.webp')}
          alt="Fynnox"
          style={{ height: 230, filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.5))' }}
        />
        <div style={{ flex: 1, minWidth: 280 }}>
          <p style={{ margin: '0 0 14px', fontSize: 14.5, fontWeight: 600, lineHeight: 1.5, color: '#eaf6ff' }}>
            Ein junger Fuchs mit Fliegerbrille und blauem Schal. Neugierig, mutig und immer
            unterwegs, wenn im Sonnenwald etwas nicht stimmt.
          </p>
          <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
            {stat('Pfotenmünzen', save.totalCoins, '🪙')}
            {stat('Sterne', stars, '⭐')}
            {stat('Level geschafft', levels, '🚩')}
          </div>
        </div>
      </div>
    </Panel>
  )
}

// --- Einstellungen ---------------------------------------------------------
export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const muted = useSyncExternalStore(subscribeMusic, isMuted, isMuted)
  const resetSave = useGameStore((s) => s.resetSave)
  // Zurücksetzen ist nicht rückgängig zu machen → bewusst zwei Klicks.
  const [confirmReset, setConfirmReset] = useState(false)

  const row = (label: string, hint: string, action: ReactNode) => (
    <div
      className="fa-glass"
      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderRadius: 15, marginBottom: 9 }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15.5 }}>{label}</div>
        <div style={{ fontSize: 11.5, fontWeight: 600, opacity: 0.78, lineHeight: 1.3 }}>{hint}</div>
      </div>
      {action}
    </div>
  )

  return (
    <Panel title="Einstellungen" subtitle="Ton und Spielstand" onClose={onClose}>
      {row(
        'Musik',
        muted ? 'Die Hintergrundmusik ist aus.' : 'Die Hintergrundmusik läuft.',
        <button
          onClick={toggleMute}
          style={{
            background: muted ? 'rgba(255,255,255,0.16)' : C.green, color: '#fff', border: 'none',
            borderRadius: 12, padding: '9px 20px', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {muted ? '🔇 Aus' : '🔊 An'}
        </button>,
      )}

      {row(
        'Speicherort',
        'Dein Fortschritt liegt nur auf diesem Gerät. Es werden keine Daten verschickt.',
        <span style={{ fontSize: 12.5, fontWeight: 800, color: '#7ff0a6', whiteSpace: 'nowrap' }}>Lokal</span>,
      )}

      {row(
        'Fortschritt zurücksetzen',
        confirmReset
          ? 'Wirklich? Alle Sterne, Münzen und freigeschalteten Level gehen verloren.'
          : 'Setzt Sterne, Münzen und freigeschaltete Level zurück.',
        confirmReset ? (
          <div style={{ display: 'flex', gap: 7 }}>
            <button
              onClick={() => { resetSave(); setConfirmReset(false) }}
              style={{ background: '#d13b3b', color: '#fff', border: 'none', borderRadius: 12, padding: '9px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Ja, löschen
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none', borderRadius: 12, padding: '9px 16px', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}
            >
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            style={{ background: 'rgba(255,255,255,0.16)', color: '#fff', border: 'none', borderRadius: 12, padding: '9px 20px', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Zurücksetzen
          </button>
        ),
      )}
    </Panel>
  )
}
