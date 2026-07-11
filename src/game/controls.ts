// Eingabe-Singleton. Touch-Buttons und Tastatur schreiben hier hinein; der Player
// liest je Frame. `jump` und `dash` sind flankengetriggert (eine Aktion je Druck):
// werden bei Druck/Tap true gesetzt und vom Player nach dem Lesen wieder false.
export const controls = {
  left: false,
  right: false,
  jump: false,
  dash: false,
}

// Tastatur (Desktop): Pfeile / A D laufen, Leertaste/W/↑ springen, Shift dashen.
export function attachKeyboard(): () => void {
  const down = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        controls.left = true
        break
      case 'ArrowRight':
      case 'KeyD':
        controls.right = true
        break
      case 'ArrowUp':
      case 'KeyW':
      case 'Space':
        if (!e.repeat) controls.jump = true
        break
      case 'ShiftLeft':
      case 'ShiftRight':
      case 'KeyK':
        if (!e.repeat) controls.dash = true
        break
    }
  }
  const up = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        controls.left = false
        break
      case 'ArrowRight':
      case 'KeyD':
        controls.right = false
        break
    }
  }
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
  }
}
