import { useMemo, Suspense } from 'react'
import { Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Trees3D } from '../render/Trees3D'
import { Scenery } from '../render/Scenery'
import { Houses } from '../render/Houses'
import { Backdrop } from '../render/Parallax3D'
import { Life } from '../render/Life'
import { Water } from '../render/Water'
import { makeGrassTexture } from '../render/paint'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { Coins } from './Coins'
import { Checkpoints, Goal } from './Flags'
import { Npc } from './Npc'
import type { LevelDef } from './level'

// Hochwertige 2,5D-3D-Bühne (Diorama/„New Super Mario Bros"-Anmutung): weiche Beleuchtung
// + Environment für runde Formen, plastische Plattformen, 3D-Tiefen-Wald mit Nebel,
// Schatten für Erdung, sanftes Bloom. Spiel-Logik unverändert.

function Ground({ minX, maxX }: { minX: number; maxX: number }) {
  const tex = useMemo(() => {
    const t = makeGrassTexture()
    t.repeat.set(60, 60)
    return t
  }, [])
  const w = maxX - minX + 240
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(minX + maxX) / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, 400]} />
      <meshStandardMaterial map={tex} color="#5fb069" roughness={0.62} envMapIntensity={1.15} />
    </mesh>
  )
}

export function AdventureScene({ level }: { level: LevelDef }) {
  return (
    <>
      <Sky sunPosition={[80, 45, 60]} turbidity={3} rayleigh={0.9} mieCoefficient={0.004} mieDirectionalG={0.85} />
      <fog attach="fog" args={['#bfe0e8', 42, 120]} />

      {/* Füllicht bewusst sparsam: zu viel Ambient/Hemisphere wäscht alle Farben aus.
          Der Glanz und die Tiefe kommen aus dem starken, warmen Hauptlicht + Environment. */}
      <Suspense fallback={null}>
        <Environment preset="park" background={false} environmentIntensity={0.55} />
      </Suspense>
      <ambientLight intensity={0.22} />
      <hemisphereLight args={['#cdeaff', '#4d6b3f', 0.42]} />
      <directionalLight
        color="#fff2d6"
        position={[35, 60, 30]}
        intensity={2.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0004}
      />

      {level.bg && (
        <Suspense fallback={null}>
          <Backdrop url={level.bg} />
        </Suspense>
      )}

      <Ground minX={level.startX} maxX={level.goalX} />
      {/* Prozedurales Wasser nur ohne gemalten Hintergrund: das Artwork bringt Fluss,
          See und Wasserfälle selbst mit — sonst schweben die Wasserfall-Flächen davor. */}
      {!level.bg && <Water minX={level.startX} maxX={level.goalX} />}
      <Houses minX={level.startX} maxX={level.goalX} />
      <Trees3D minX={level.startX} maxX={level.goalX} />
      <Scenery minX={level.startX} maxX={level.goalX} hills={!level.bg} />
      <Life minX={level.startX} maxX={level.goalX} />

      <Platforms platforms={level.platforms} />
      <Suspense fallback={null}>
        <Coins coins={level.coins} />
        <Checkpoints positions={level.checkpoints} />
        <Goal x={level.goalX} />
        {level.quest && (
          <Npc
            def={{ x: level.quest.npcX, model: level.quest.npcModel, tint: level.quest.npcTint }}
            quest={{ total: level.coins.length, ask: level.quest.ask, ready: level.quest.ready, thanks: level.quest.thanks }}
          />
        )}
        <Player level={level} />
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.45} />
      </EffectComposer>
    </>
  )
}
