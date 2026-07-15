import { useSyncExternalStore } from 'react'
import { isMuted, toggleMute, subscribeMusic } from '../audio/music'
import { pill } from './theme'

// Kleiner Musik-Schalter (oben rechts, unter der Level-Pille). Zeigt an, ob die
// Abenteuer-Musik läuft, und merkt den Zustand (localStorage über music.ts).
export function MuteButton() {
  const muted = useSyncExternalStore(subscribeMusic, isMuted, isMuted)

  return (
    <button
      onClick={toggleMute}
      aria-label={muted ? 'Musik an' : 'Musik aus'}
      title={muted ? 'Musik an' : 'Musik aus'}
      style={{
        ...pill,
        position: 'fixed',
        right: 16,
        top: 58,
        width: 46,
        height: 46,
        justifyContent: 'center',
        fontSize: 22,
        cursor: 'pointer',
        padding: 0,
      }}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
