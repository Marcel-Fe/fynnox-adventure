import { useGameStore } from '../store/gameStore'
import { getLevel } from '../game/levels'
import { goalDone, goalsOf, totalGemCount, type RunProgress } from '../game/level'
import { asset } from '../utils/asset'
import { C, pill } from './theme'

// In-Game-Kopfzeile im Look des Mockups: links Münz-Zähler, rechts Level-Name.
export function Hud() {
  const coins = useGameStore((s) => s.coins)
  const gems = useGameStore((s) => s.gems)
  const stars = useGameStore((s) => s.stars)
  const levelId = useGameStore((s) => s.levelId)
  const chestOpen = useGameStore((s) => s.chestOpen)
  const questDone = useGameStore((s) => s.questDone)
  const talked = useGameStore((s) => s.talked)
  const level = getLevel(levelId)
  const total = level.coins.length
  const gemTotal = totalGemCount(level)
  const starTotal = level.stars?.length ?? 0

  // Live-Stand der Level-Ziele. Ohne diese Anzeige wüsste niemand, dass es außer
  // „ans Ende laufen" noch etwas zu tun gibt.
  const progress: RunProgress = {
    coins, gems, stars, chestOpen, questDone,
    talkedCount: Object.keys(talked).length,
  }
  const goals = goalsOf(level)

  return (
    <>
      <div style={{ position: 'fixed', left: 16, top: 14, display: 'flex', gap: 10 }}>
        <div style={{ padding: '8px 16px 8px 10px', fontSize: 20, ...pill }}>
          <img src={asset('art/items/paw_coin.png')} width={30} height={30} alt="" style={{ display: 'block' }} />
          <span key={coins} className="fa-count" style={{ color: C.yellow }}>{coins}</span>
          <span style={{ opacity: 0.5, fontSize: 15 }}>/ {total}</span>
        </div>
        {gemTotal > 0 && (
          <div style={{ padding: '8px 14px 8px 9px', fontSize: 20, ...pill }}>
            <img src={asset('art/items/gem.png')} width={26} height={26} alt="" style={{ display: 'block' }} />
            <span key={gems} className="fa-count" style={{ color: '#9fd8ff' }}>{gems}</span>
            <span style={{ opacity: 0.5, fontSize: 15 }}>/ {gemTotal}</span>
          </div>
        )}
        {starTotal > 0 && (
          <div style={{ padding: '8px 14px 8px 9px', fontSize: 20, ...pill }}>
            <img src={asset('art/items/star.png')} width={26} height={26} alt="" style={{ display: 'block' }} />
            <span key={stars} className="fa-count" style={{ color: C.yellow }}>{stars}</span>
            <span style={{ opacity: 0.5, fontSize: 15 }}>/ {starTotal}</span>
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', right: 16, top: 14, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <div style={{ padding: '9px 18px', fontSize: 18, ...pill }}>{level.name}</div>

        {/* Ziel-Liste. Das „finish"-Ziel wird weggelassen — dass man ans Ende laufen
            muss, versteht sich von selbst und würde nur Platz kosten. */}
        <div
          style={{
            background: 'rgba(31,44,77,0.82)', backdropFilter: 'blur(4px)', color: '#fff',
            // marginTop schafft Platz für den globalen Mute-Knopf, der unter der
            // Level-Pille sitzt — sonst überlappen beide.
            marginTop: 40,
            borderRadius: 14, padding: '9px 13px', maxWidth: 260,
            border: '2px solid rgba(255,255,255,0.16)', boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: 0.9, textTransform: 'uppercase', opacity: 0.72, marginBottom: 4 }}>
            Aufgaben
          </div>
          {goals.filter((g) => g.kind !== 'finish').map((g, i) => {
            const done = goalDone(g, level, progress)
            return (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12.5,
                  fontWeight: 700, lineHeight: 1.3, padding: '2px 0',
                  color: done ? '#7ff0a6' : '#e6ecf7',
                  opacity: done ? 0.85 : 1,
                }}
              >
                <span>{done ? '✅' : '⬜'}</span>
                <span>{g.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
