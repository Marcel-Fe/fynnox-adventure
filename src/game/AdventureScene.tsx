import { useMemo, Suspense } from 'react'
import { Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Trees3D } from '../render/Trees3D'
import { Scenery } from '../render/Scenery'
import { Water } from '../render/Water'
import { makeGrassTexture } from '../render/paint'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { Coins } from './Coins'
import { Checkpoints, Goal } from './Flags'
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
      <meshStandardMaterial map={tex} color="#5aa564" roughness={1} />
    </mesh>
  )
}

export function AdventureScene({ level }: { level: LevelDef }) {
  return (
    <>
      <Sky sunPosition={[80, 45, 60]} turbidity={3} rayleigh={0.9} mieCoefficient={0.004} mieDirectionalG={0.85} />
      <fog attach="fog" args={['#bfe0e8', 42, 120]} />

      <Suspense fallback={null}>
        <Environment preset="park" background={false} environmentIntensity={0.9} />
      </Suspense>
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#cdeaff', '#6a8a55', 0.7]} />
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

      <Ground minX={level.startX} maxX={level.goalX} />
      <Water minX={level.startX} maxX={level.goalX} />
      <Trees3D minX={level.startX} maxX={level.goalX} />
      <Scenery minX={level.startX} maxX={level.goalX} />

      <Platforms platforms={level.platforms} />
      <Suspense fallback={null}>
        <Coins coins={level.coins} />
        <Checkpoints positions={level.checkpoints} />
        <Goal x={level.goalX} />
        <Player level={level} />
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.45} />
      </EffectComposer>
    </>
  )
}
