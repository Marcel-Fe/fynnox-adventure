import { useMemo, Suspense } from 'react'
import { Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Scatter, type Deco } from '../world/Scatter'
import { makeGroundTexture } from '../world/textures'
import { THEMES, type DecorKind } from '../world/themes'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { Coins } from './Coins'
import { FOREST_LEVEL } from './level'

// Wald-Szene für die erste spielbare Version: Kulisse (Boden/Bäume/Himmel) +
// Plattformen + Münzen + Fynnox mit Lauf-/Sprung-Physik. Die Deko liegt in
// Tiefen-Bändern HINTER dem Spielfeld (z < 0) → Parallaxe, keine Verdeckung.

function useBackgroundScatter(): Deco[] {
  return useMemo(() => {
    const out: Deco[] = []
    const bands = [
      { z: -28, step: 4.5, s: [1.2, 2.1] },
      { z: -17, step: 3.6, s: [1.0, 1.7] },
      { z: -9, step: 4.4, s: [0.8, 1.3] },
    ]
    for (const b of bands) {
      for (let x = -52; x <= 60; x += b.step) {
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
  }, [])
}

export function AdventureScene({ world = 'forest' }: { world?: DecorKind }) {
  const theme = THEMES[world]
  const scatter = useBackgroundScatter()
  const groundTex = useMemo(() => makeGroundTexture(theme.groundTex), [theme.groundTex])

  return (
    <>
      <Sky sunPosition={[120, 60, 80]} turbidity={5} rayleigh={1.2} mieCoefficient={0.005} />
      <fog attach="fog" args={[theme.fog, 60, 170]} />

      <Suspense fallback={null}>
        <Environment preset={theme.envPreset} background={false} environmentIntensity={0.9} />
      </Suspense>
      <ambientLight intensity={theme.ambient} />
      <hemisphereLight args={[theme.hemiSky, theme.hemiGround, 0.5]} />
      <directionalLight
        position={[40, 70, 40]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
        shadow-camera-far={240}
      />

      {/* Boden */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial map={groundTex} color={theme.ground} roughness={1} />
      </mesh>

      {/* Ferne Hügel */}
      {[
        [-70, -80], [90, -100], [10, -130], [-130, -110], [150, -90],
      ].map((h, i) => (
        <mesh key={i} position={[h[0], -6, h[1]]} scale={[38, 20, 38]} receiveShadow>
          <sphereGeometry args={[1, 40, 28]} />
          <meshStandardMaterial color={theme.hemiGround} roughness={1} />
        </mesh>
      ))}

      {/* Vegetation (instanziert + Wind) — Kulisse hinter dem Spielfeld */}
      <Scatter items={scatter} decor={theme.decor} />

      {/* Spielfeld */}
      <Platforms platforms={FOREST_LEVEL.platforms} />
      <Coins coins={FOREST_LEVEL.coins} />
      <Player platforms={FOREST_LEVEL.platforms} startX={FOREST_LEVEL.startX} />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.4} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.55} />
      </EffectComposer>
    </>
  )
}
