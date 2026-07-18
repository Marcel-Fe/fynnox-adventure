import { useGameStore } from '../store/gameStore'
import { getLevel } from '../game/levels'
import { asset } from '../utils/asset'
import { C, pill } from './theme'

// In-Game-Kopfzeile im Look des Mockups: links Münz-Zähler, rechts Level-Name.
export function Hud() {
  const coins = useGameStore((s) => s.coins)
  const gems = useGameStore((s) => s.gems)
  const stars = useGameStore((s) => s.stars)
  const levelId = useGameStore((s) => s.levelId)
  const level = getLevel(levelId)
  const total = level.coins.length
  const gemTotal = level.gems?.length ?? 0
  const starTotal = level.stars?.length ?? 0

  return (
    <>
      <div style={{ position: 'fixed', left: 16, top: 14, display: 'flex', gap: 10 }}>
        <div style={{ padding: '8px 16px 8px 10px', fontSize: 20, ...pill }}>
          <img src={asset('art/items/paw_coin.png')} width={30} height={30} alt="" style={{ display: 'block' }} />
          <span style={{ color: C.yellow }}>{coins}</span>
          <span style={{ opacity: 0.5, fontSize: 15 }}>/ {total}</span>
        </div>
        {gemTotal > 0 && (
          <div style={{ padding: '8px 14px 8px 9px', fontSize: 20, ...pill }}>
            <img src={asset('art/items/gem.png')} width={26} height={26} alt="" style={{ display: 'block' }} />
            <span style={{ color: '#9fd8ff' }}>{gems}</span>
            <span style={{ opacity: 0.5, fontSize: 15 }}>/ {gemTotal}</span>
          </div>
        )}
        {starTotal > 0 && (
          <div style={{ padding: '8px 14px 8px 9px', fontSize: 20, ...pill }}>
            <img src={asset('art/items/star.png')} width={26} height={26} alt="" style={{ display: 'block' }} />
            <span style={{ color: C.yellow }}>{stars}</span>
            <span style={{ opacity: 0.5, fontSize: 15 }}>/ {starTotal}</span>
          </div>
        )}
      </div>
      <div style={{ position: 'fixed', right: 16, top: 14, padding: '9px 18px', fontSize: 18, ...pill }}>
        {level.name}
      </div>
    </>
  )
}
