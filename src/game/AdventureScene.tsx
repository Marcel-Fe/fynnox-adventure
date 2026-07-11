import { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import { Parallax } from '../render/Parallax'
import { makeGroundStripTexture, makeBankTexture } from '../render/paint'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { Coins } from './Coins'
import { Checkpoints, Goal } from './Flags'
import type { LevelDef } from './level'

// Bühne für einen Level im gemalten 2,5D-Look: Parallax-Kulisse + Bodenstreifen als
// Optik-Schicht, davor Plattformen, Münzen, Checkpoints, Ziel und Fynnox. Kein 3D-Wald,
// keine schweren Lichter/Postprocessing mehr — alle Sprites sind „vorbeleuchtet".

const GROUND_H = 7 // Höhe des Boden-Quads (Erde reicht weit nach unten)
const GROUND_TILE = 3 // Weltbreite je Boden-Textur-Kachel

const BANK_H = 3.8 // Höhe der Busch-Bank; Unterkante überlappt die Graslinie

function Ground({ minX, maxX }: { minX: number; maxX: number }) {
  const tex = useMemo(() => makeGroundStripTexture(), [])
  const bank = useMemo(() => makeBankTexture(), [])
  const w = maxX - minX + 200
  const cx = (minX + maxX) / 2
  tex.wrapS = THREE.RepeatWrapping
  tex.repeat.x = w / GROUND_TILE
  bank.wrapS = THREE.RepeatWrapping
  bank.repeat.x = w / 8
  return (
    <>
      {/* Weltfeste Busch-Bank (verdeckt den Kulisse↔Boden-Spalt), hinter dem Spielfeld */}
      <mesh position={[cx, BANK_H / 2 - 0.8, -1]}>
        <planeGeometry args={[w, BANK_H]} />
        <meshBasicMaterial map={bank} transparent alphaTest={0.25} toneMapped={false} fog={false} />
      </mesh>
      {/* Bodenstreifen */}
      <mesh position={[cx, -GROUND_H / 2, -0.5]}>
        <planeGeometry args={[w, GROUND_H]} />
        <meshBasicMaterial map={tex} toneMapped={false} fog={false} />
      </mesh>
    </>
  )
}

export function AdventureScene({ level }: { level: LevelDef }) {
  return (
    <>
      <Parallax />
      <Ground minX={level.startX} maxX={level.goalX} />

      {/* Spielfeld */}
      <Platforms platforms={level.platforms} />
      <Suspense fallback={null}>
        <Coins coins={level.coins} />
        <Checkpoints positions={level.checkpoints} />
        <Goal x={level.goalX} />
        <Player level={level} />
      </Suspense>
    </>
  )
}
