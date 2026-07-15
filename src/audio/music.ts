import { asset } from '../utils/asset'

// Hintergrund-Musik (Lücke 4). Ein einzelnes, gelooptes Audio-Element, lizenzfreie
// lokale Datei (`public/audio/musik.mp3`) — kein externer Host (offline/PWA-tauglich).
// Browser blockieren Autoplay ohne Nutzer-Geste → wir starten bei der ersten
// Interaktion. Der Stumm-Zustand wird in localStorage gemerkt.

const SRC = asset('audio/musik.mp3')
const KEY = 'fynnox_muted'
const VOLUME = 0.35

let audio: HTMLAudioElement | null = null
let muted = false
let started = false // wurde nach einer Nutzer-Geste schon einmal gestartet?
const listeners = new Set<() => void>()

function ensureAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(SRC)
    audio.loop = true
    audio.volume = VOLUME
    audio.preload = 'auto'
  }
  return audio
}

function tryPlay() {
  if (muted) return
  ensureAudio()
    .play()
    .catch(() => {}) // noch von der Autoplay-Policy blockiert → nächste Geste versucht es erneut
}

export function initMusic() {
  if (typeof window === 'undefined') return
  muted = localStorage.getItem(KEY) === '1'

  const start = () => {
    started = true
    tryPlay()
    window.removeEventListener('pointerdown', start)
    window.removeEventListener('keydown', start)
  }
  window.addEventListener('pointerdown', start)
  window.addEventListener('keydown', start)
}

export function isMuted(): boolean {
  return muted
}

export function toggleMute() {
  muted = !muted
  try {
    localStorage.setItem(KEY, muted ? '1' : '0')
  } catch {
    /* localStorage evtl. blockiert → nicht kritisch */
  }
  if (muted) audio?.pause()
  else if (started) tryPlay()
  listeners.forEach((l) => l())
}

// Abo für UI-Komponenten (Mute-Button), damit sie sich neu zeichnen.
export function subscribeMusic(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
