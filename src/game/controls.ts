// Eingabe-Singleton. Touch-Buttons und Tastatur schreiben hier hinein; der Player
// liest die Werte je Frame. `jump` ist flankengetriggert (ein Sprung je Druck):
// wird bei Tastendruck/Tap auf true gesetzt und vom Player nach dem Lesen wieder
// auf false gesetzt.
export const controls = {
  left: false,
  right: false,
  jump: false,
}

// Tastatur (Desktop): Pfeile / A D / Leertaste. Gibt eine Aufräum-Funktion zurück.
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
