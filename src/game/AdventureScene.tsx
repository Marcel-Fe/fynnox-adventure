import { useMemo, useEffect, Suspense } from 'react'
import { useThree } from '@react-three/fiber'
import { Sky, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { TreeBillboards } from '../render/TreeBillboards'
import { GroundDeco } from '../render/GroundDeco'
import { HouseBillboards } from '../render/HouseBillboards'
import { Scenery } from '../render/Scenery'
import { Backdrop } from '../render/Parallax3D'
import { Life } from '../render/Life'
import { Fx } from '../render/Fx'
import { Water } from '../render/Water'
import { makeGrassTexture, makeSandTexture, makeSprinkleTexture } from '../render/paint'
import { stageFor, type StageLook } from '../world/stage'
import { Player } from './Player'
import { Platforms } from './Platforms'
import { MovingPlatforms } from './MovingPlatforms'
import { buildMovers } from './movers'
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

// Die Boden-Texturen (Gras/Sand/Streusel) liegen in `render/paint.ts` — dieselben
// Funktionen bauen jetzt auch die Oberseite der Plattformen.

function Ground({ minX, maxX, look }: { minX: number; maxX: number; look: StageLook }) {
  const tex = useMemo(() => {
    const t =
      look.groundMap === 'grass' ? makeGrassTexture()
      : look.groundMap === 'sand' ? makeSandTexture()
      : makeSprinkleTexture()
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
          {/* Lage der Panorama-Ebene kommt aus dem Welt-Look: jedes Bild hat seinen
              Horizont woanders, mit festen Werten säße es schief zum 3D-Boden. */}
          <Backdrop url={level.bg} y={look.bgY} height={look.bgHeight} factor={look.bgFactor} />
        </Suspense>
      )}

      <Ground minX={level.startX} maxX={level.goalX} look={look} />
      {/* Prozedurales Wasser nur ohne gemalten Hintergrund: das Artwork bringt Fluss,
          See und Wasserfälle selbst mit — sonst schweben die Wasserfall-Flächen davor.
          Welche Welt überhaupt prozedurales Wasser will, steht im Welt-Look. */}
      {!level.bg && look.water === 'river' && <Water minX={level.startX} maxX={level.goalX} />}
      {look.houseArt.length > 0 && (
        <Suspense fallback={null}>
          <HouseBillboards minX={level.startX} maxX={level.goalX} look={look} />
        </Suspense>
      )}
      {/* Gemalte Bäume. KEIN Rückfall auf die alte Geometrie-Variante: die Kugel-Kronen
          hat der Nutzer ausdrücklich abgelehnt. Fehlt Artwork, bleibt die Welt eben
          baumlos, bis es vorliegt. */}
      {look.treeArt.length > 0 && (
        <Suspense fallback={null}>
          <TreeBillboards minX={level.startX} maxX={level.goalX} look={look} />
        </Suspense>
      )}
      <Scenery minX={level.startX} maxX={level.goalX} hills={!level.bg} deco={look.deco.length === 0} look={look} />
      {look.deco.length > 0 && (
        <Suspense fallback={null}>
          <GroundDeco minX={level.startX} maxX={level.goalX} types={look.deco} />
        </Suspense>
      )}
      <Life minX={level.startX} maxX={level.goalX} />

      <Suspense fallback={null}>
        <Platforms platforms={level.platforms} look={look} />
        <MovingPlatforms defs={movers} live={liveMovers} look={look} />
      </Suspense>
      <Suspense fallback={null}>
        <Coins coins={level.coins} />
        {level.gems && <Gems gems={level.gems} />}
        {level.stars && <Stars stars={level.stars} />}
        {level.springs && <Springs springs={level.springs} />}
        {level.key && <KeyItem def={level.key} />}
        {level.chest && <Chest def={level.chest} />}
        <Checkpoints positions={level.checkpoints} />
        <Goal x={level.goalX} />
        {level.npcs?.map((n, i) => (n.sprite ? <SpriteNpc key={i} def={n} id={i} /> : <Villager key={i} def={n} id={i} />))}
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
