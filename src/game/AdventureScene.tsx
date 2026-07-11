import { useMemo, Suspense } from 'react'
import { Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Scatter, type Deco } from '../world/Scatter'
import { makeGroundTexture } from '../world/textures'
import { THEMES } from '../world/themes'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { Coins } from './Coins'
import { Checkpoints, Goal } from './Flags'
import type { LevelDef } from './level'

// Bühne für einen Level: Kulisse (Boden/Bäume/Himmel) hinter dem Spielfeld +
// Plattformen, Münzen, Checkpoints, Ziel und Fynnox. Deko in Tiefen-Bändern (z<0)
// → Parallaxe.
function useBackgroundScatter(minX: number, maxX: number): Deco[] {
  return useMemo(() => {
    const out: Deco[] = []
    const bands = [
      { z: -30, step: 4.5, s: [1.3, 2.2] },
      { z: -18, step: 3.6, s: [1.0, 1.7] },
      { z: -9, step: 4.4, s: [0.8, 1.3] },
    ]
    for (const b of bands) {
      for (let x = minX - 14; x <= maxX + 14; x += b.step) {
        out.push({
          x: x + (Math.random() - 0.5) * b.step * 0.7,
          z: b.z + (Math.random() - 0.5) * 4,
          s: b.s[0] + Math.random() * (b.s[1] - b.s[0]),
          rot: Math.random() * Math.PI * 2,
          variant: Math.floor(Math.random() * 3),
        })
      }
    }
    return out
  }, [minX, maxX])
}

export function AdventureScene({ level }: { level: LevelDef }) {
  const theme = THEMES[level.world]
  const scatter = useBackgroundScatter(level.startX, level.goalX)
  const groundTex = useMemo(() => makeGroundTexture(theme.groundTex), [theme.groundTex])

  return (
    <>
      {theme.sky === 'day' && <Sky sunPosition={[120, 60, 80]} turbidity={4} rayleigh={1.1} mieCoefficient={0.005} />}
      <fog attach="fog" args={[theme.fog, 55, 175]} />

      <Suspense fallback={null}>
        <Environment preset={theme.envPreset} background={false} environmentIntensity={0.95} />
      </Suspense>
      <ambientLight intensity={theme.ambient} />
      <hemisphereLight args={[theme.hemiSky, theme.hemiGround, 0.55]} />
      <directionalLight
        position={[40, 80, 40]}
        intensity={1.55}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-far={260}
      />

      {/* Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[800, 800]} />
        <meshStandardMaterial map={groundTex} color={theme.ground} roughness={1} />
      </mesh>

      {/* Ferne Hügel */}
      {[
        [-40, -90], [60, -110], [140, -95], [220, -120], [-120, -100],
      ].map((h, i) => (
        <mesh key={i} position={[h[0], -6, h[1]]} scale={[40, 22, 40]} receiveShadow>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial color={theme.hemiGround} roughness={1} />
        </mesh>
      ))}

      <Scatter items={scatter} decor={theme.decor} />

      {/* Spielfeld */}
      <Platforms platforms={level.platforms} />
      <Suspense fallback={null}>
        <Coins coins={level.coins} />
        <Checkpoints positions={level.checkpoints} />
        <Goal x={level.goalX} />
        <Player level={level} />
      </Suspense>

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.45} luminanceThreshold={0.8} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.22} darkness={0.5} />
      </EffectComposer>
    </>
  )
}
