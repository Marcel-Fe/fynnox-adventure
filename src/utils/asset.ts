// Baut einen Asset-Pfad relativ zum Vite-base (z. B. '/fynnox-adventure/').
// So funktionieren Bilder lokal ('/') wie auf GitHub Pages ('/fynnox-adventure/').
export function asset(path: string): string {
  return import.meta.env.BASE_URL + path.replace(/^\//, '')
}
