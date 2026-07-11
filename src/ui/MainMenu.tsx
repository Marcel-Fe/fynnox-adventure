import { useGameStore } from '../store/gameStore'
import { asset } from '../utils/asset'
import { C, pill } from './theme'

interface WorldTile {
  world: string
  name: string
  img: string
  levelId?: string
  active: boolean
}

const WORLDS: WorldTile[] = [
  { world: 'forest', name: 'Wald', img: 'art/previews/wald.png', levelId: 'wald-1', active: true },
  { world: 'candy', name: 'Zuckerwirbel', img: 'art/previews/zuckerwirbel.png', active: false },
  { world: 'volcano', name: 'Vulkanpfad', img: 'art/previews/vulkan.png', active: false },
  { world: 'ice', name: 'Gletscher', img: 'art/previews/gletscher.png', active: false },
  { world: 'city', name: 'Neon-Stadt', img: 'art/previews/neon.png', active: false },
]

// Haupt-Menü / Dashboard im Look der Referenzbilder.
export function MainMenu() {
  const start = useGameStore((s) => s.start)
  const save = useGameStore((s) => s.save)
  const bestWald = save.bestStars['wald-1'] ?? 0

  return (
    <div
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: `linear-gradient(180deg,#8fd0ff 0%,#bfe3ff 45%,#2f9e54 46%,#2f8f4e 100%)`,
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Wald-Kulisse als weiche Deko oben */}
      <img
        src={asset('art/previews/wald.png')}
        alt=""
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '46%', objectFit: 'cover', opacity: 0.55, filter: 'saturate(1.1)' }}
      />

      {/* Münz-Konto oben rechts */}
      <div style={{ position: 'absolute', right: 16, top: 14, padding: '8px 16px 8px 10px', fontSize: 18, zIndex: 2, ...pill }}>
        <img src={asset('art/items/paw_coin.png')} width={26} height={26} alt="" />
        <span style={{ color: C.yellow }}>{save.totalCoins}</span>
      </div>

      {/* Kopf: Fynnox + Titel */}
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 26px' }}>
        <img src={asset('art/fynnox/front.png')} alt="Fynnox" style={{ height: 132, filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.3))' }} />
        <div>
          <div style={{ fontSize: 40, fontWeight: 900, color: '#fff', textShadow: '0 3px 0 rgba(0,0,0,0.25)', lineHeight: 1 }}>
            Fynnox <span style={{ color: C.orange }}>Adventure</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#eaf6ff', marginTop: 6 }}>
            Laufe, springe und sammle mit Fynnox! 🦊
          </div>
        </div>
      </div>

      {/* Welt-Auswahl */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {WORLDS.map((w) => (
            <button
              key={w.world}
              onClick={() => w.active && w.levelId && start(w.levelId)}
              disabled={!w.active}
              style={{
                position: 'relative', flex: '0 0 auto', width: 190, height: 132, borderRadius: 18,
                border: `4px solid ${w.active ? C.orange : 'rgba(255,255,255,0.5)'}`, overflow: 'hidden',
                padding: 0, cursor: w.active ? 'pointer' : 'default',
                boxShadow: '0 8px 20px rgba(0,0,0,0.3)', background: '#000',
              }}
            >
              <img src={asset(w.img)} alt={w.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: w.active ? 1 : 0.5 }} />
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', padding: '18px 10px 8px', color: '#fff', fontWeight: 800, textAlign: 'left', background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
                {w.name}
              </div>
              {w.active ? (
                <div style={{ position: 'absolute', right: 8, top: 8, display: 'flex', gap: 2 }}>
                  {[1, 2, 3].map((n) => (
                    <img key={n} src={asset('art/items/star.png')} width={20} height={20} alt="" style={{ opacity: n <= bestWald ? 1 : 0.25, filter: n <= bestWald ? 'none' : 'grayscale(1)' }} />
                  ))}
                </div>
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, textShadow: '0 2px 4px #000' }}>
                  🔒 Bald
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Großer Spielen-Button */}
        <button
          onClick={() => start('wald-1')}
          style={{
            marginTop: 18, alignSelf: 'flex-start', background: C.orange, color: '#fff',
            fontSize: 24, fontWeight: 900, border: 'none', borderRadius: 20, padding: '14px 46px',
            cursor: 'pointer', boxShadow: '0 6px 0 #c85718', letterSpacing: 0.5,
          }}
        >
          ▶ Spielen
        </button>
      </div>
    </div>
  )
}
