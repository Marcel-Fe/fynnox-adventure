import type { CSSProperties } from 'react'

// Gemeinsame Farben/Stile im Look der Referenzbilder (kräftiger Cartoon, navy Pillen).
export const C = {
  navy: '#1f2c4d',
  navyDeep: '#16213c',
  orange: '#ff7a2f',
  yellow: '#ffc23c',
  blue: '#2b7fff',
  green: '#2f9e54',
  cream: '#ffe3c2',
  white: '#ffffff',
}

export const pill: CSSProperties = {
  background: C.navy,
  color: C.white,
  fontWeight: 800,
  borderRadius: 999,
  border: '3px solid rgba(255,255,255,0.16)',
  boxShadow: '0 4px 14px rgba(0,0,0,0.28)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}
