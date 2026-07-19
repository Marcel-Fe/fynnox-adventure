import { useMemo, useEffect, Suspense } from 'react'
import { useThree } from '@react-three/fiber'
import { Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { Trees3D } from '../render/Trees3D'
import { TreeBillboards } from '../render/TreeBillboards'
import { GroundDeco } from '../render/GroundDeco'
import { Scenery } from '../render/Scenery'
import { Houses } from '../render/Houses'
import { Backdrop } from '../render/Parallax3D'
import { Life } from '../render/Life'
import { Fx } from '../render/Fx'
import { Water } from '../render/Water'
import { makeGrassTexture } from '../render/paint'
import { stageFor, type StageLook } from '../world/stage'
import * as THREE from 'three'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { MovingPlatforms, buildMovers } from './MovingPlatforms'
import { Coins } from './Coins'
import { Checkpoints, Goal } from './Flags'
import { Gems, Stars, Springs } from './Pickups'
import { Chest, KeyItem } from './Chest'
import { Npc } from './Npc'
import { Villager } from './Villager'
import { SpriteNpc } from './SpriteNpc'
import type { LevelDef, MoverDef } from './level'

// Stabile Referenz für Level ohne bewegliche Plattformen (sonst neues Array je Render).
const EMPTY_MOVERS: MoverDef[] = []

// Hochwertige 2,5D-3D-Bühne (Diorama/„New Super Mario Bros"-Anmutung): weiche Beleuchtung
// + Environment für runde Formen, plastische Plattformen, 3D-Tiefen-Wald mit Nebel,
// Schatten für Erdung, sanftes Bloom. Spiel-Logik unverändert.

// Streusel-Boden für die Zucker-Welt: helle Grundfläche mit bunten Sprenkeln. Rein
// prozedural (keine Datei) und einmal erzeugt — im Gras-Look würde eine rosa Tönung auf
// der grünen Gras-Textur nur schlammig aussehen.
function makeSprinkleTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, 256, 256)
  let s = 4711
  const r = () => ((s = (s * 1664525 + 1013904223) >>> 0), s / 0xffffffff)
  const cols = ['#ffd6ea', '#ffe9a8', '#c9f0ff', '#ffc2d8', '#e0d0ff']
  for (let i = 0; i < 220; i++) {
    ctx.save()
    ctx.translate(r() * 256, r() * 256)
    ctx.rotate(r() * Math.PI)
    ctx.fillStyle = cols[(r() * cols.length) | 0]
    ctx.fillRect(-5, -1.6, 10, 3.2)
    ctx.restore()
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  return t
}

function Ground({ minX, maxX, look }: { minX: number; maxX: number; look: StageLook }) {
  const tex = useMemo(() => {
    const t = look.groundMap === 'grass' ? makeGrassTexture() : makeSprinkleTexture()
    t.repeat.set(60, 60)
    // Der Boden wird extrem flach betrachtet (Seitenkamera dicht über der Wiese).
    // Ohne anisotrope Filterung zerfällt die Textur dabei in sichtbare Kachel-Bahnen.
    t.anisotropy = 8
    return t
  }, [look.groundMap])
  const w = maxX - minX + 240
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(minX + maxX) / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w, 400]} />
      <meshStandardMaterial map={tex} color={look.ground} roughness={0.62} envMapIntensity={1.15} />
    </mesh>
  )
}

export function AdventureScene({ level }: { level: LevelDef }) {
  // Dev-Hilfe: Szene/Kamera im Browser inspizierbar (wie window.__player / __game).
  const { scene, camera } = useThree()
  useEffect(() => {
    ;(window as unknown as { __scene?: unknown; __cam?: unknown }).__scene = scene
    ;(window as unknown as { __scene?: unknown; __cam?: unknown }).__cam = camera
  }, [scene, camera])

  // Bewegliche Plattformen: einmal je Level erzeugt und dann PRO FRAME MUTIERT.
  // Sie landen im selben Array wie die festen Plattformen → die Physik trägt sie mit.
  const movers = level.movers ?? EMPTY_MOVERS
  const liveMovers = useMemo(() => buildMovers(movers), [movers])
  const allPlatforms = useMemo(() => [...level.platforms, ...liveMovers], [level.platforms, liveMovers])

  // Welt-Stimmung: Himmel, Nebel, Licht, Boden- und Deko-Farben kommen aus EINER Tabelle
  // (world/stage.ts). Der Wald-Eintrag dort enthält exakt die früher hier fest
  // verdrahteten Werte — Welt 1 sieht dadurch unverändert aus.
  const look = stageFor(level.world)

  return (
    <>
      <Sky sunPosition={look.sunPosition} turbidity={look.skyTurbidity} rayleigh={look.skyRayleigh} mieCoefficient={0.004} mieDirectionalG={0.85} />
      <fog attach="fog" args={[look.fog, look.fogNear, look.fogFar]} />

      {/* Füllicht bewusst sparsam: zu viel Ambient/Hemisphere wäscht alle Farben aus.
          Der Glanz und die Tiefe kommen aus dem starken, warmen Hauptlicht + Environment. */}
      <Suspense fallback={null}>
        <Environment preset={look.envPreset} background={false} environmentIntensity={look.envIntensity} />
      </Suspense>
      <ambientLight intensity={look.ambient} />
      <hemisphereLight args={[look.hemiSky, look.hemiGround, look.hemiIntensity]} />
      <directionalLight
        color={look.sunColor}
        position={[35, 60, 30]}
        intensity={look.sunIntensity}
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

      <Ground minX={level.startX} maxX={level.goalX} look={look} />
      {/* Prozedurales Wasser nur ohne gemalten Hintergrund: das Artwork bringt Fluss,
          See und Wasserfälle selbst mit — sonst schweben die Wasserfall-Flächen davor.
          Und nur im Wald: ein blauer Fluss in der Zuckerwelt wäre fehl am Platz. */}
      {!level.bg && level.world === 'forest' && <Water minX={level.startX} maxX={level.goalX} />}
      {look.houses && <Houses minX={level.startX} maxX={level.goalX} />}
      {/* Gemalte Bäume, sobald für diese Welt Artwork vorliegt — sonst die alte
          Geometrie-Variante als Übergangslösung. */}
      {look.treeArt.length > 0 ? (
        <Suspense fallback={null}>
          <TreeBillboards minX={level.startX} maxX={level.goalX} look={look} />
        </Suspense>
      ) : (
        <Trees3D minX={level.startX} maxX={level.goalX} look={look} />
      )}
      <Scenery minX={level.startX} maxX={level.goalX} hills={!level.bg} deco={!look.groundDeco} look={look} />
      {look.groundDeco && (
        <Suspense fallback={null}>
          <GroundDeco minX={level.startX} maxX={level.goalX} />
        </Suspense>
      )}
      <Life minX={level.startX} maxX={level.goalX} />

      <Platforms platforms={level.platforms} />
      <MovingPlatforms defs={movers} live={liveMovers} />
      <Suspense fallback={null}>
        <Coins coins={level.coins} />
        {level.gems && <Gems gems={level.gems} />}
        {level.stars && <Stars stars={level.stars} />}
        {level.springs && <Springs springs={level.springs} />}
        {level.key && <KeyItem def={level.key} />}
        {level.chest && <Chest def={level.chest} />}
        <Checkpoints positions={level.checkpoints} />
        <Goal x={level.goalX} />
        {level.npcs?.map((n, i) => (n.sprite ? <SpriteNpc key={i} def={n} /> : <Villager key={i} def={n} />))}
        {level.quest && (
          <Npc
            def={{ x: level.quest.npcX, model: level.quest.npcModel, tint: level.quest.npcTint }}
            quest={{ total: level.coins.length, ask: level.quest.ask, ready: level.quest.ready, thanks: level.quest.thanks }}
          />
        )}
        <Player level={level} platforms={allPlatforms} />
      </Suspense>

      {/* Effekt-Ebene ganz vorn: Funken, Staub, Glitzer */}
      <Fx />

      <EffectComposer enableNormalPass={false}>
        <Bloom intensity={0.5} luminanceThreshold={0.82} luminanceSmoothing={0.3} mipmapBlur />
        <Vignette eskil={false} offset={0.25} darkness={0.45} />
      </EffectComposer>
    </>
  )
}
