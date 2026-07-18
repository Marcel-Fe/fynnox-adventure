import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdventureScene } from './game/AdventureScene'
import { Hud } from './ui/Hud'
import { TouchControls } from './ui/TouchControls'
import { MainMenu } from './ui/MainMenu'
import { SplashScreen } from './ui/SplashScreen'
import { ResultScreen } from './ui/ResultScreen'
import { StoryPanel } from './ui/StoryPanel'
import { RotateHint } from './ui/RotateHint'
import { MuteButton } from './ui/MuteButton'
import { attachKeyboard } from './game/controls'
import { player } from './game/playerState'
import { shake } from './game/fx'
import { useGameStore } from './store/gameStore'
import { getLevel } from './game/levels'
import { initMusic } from './audio/music'

// Strikte Seitenkamera: fest in Z/Y, folgt Fynnox nur in X (2,5D).
// Zusätzlich: schaut in Laufrichtung voraus und rüttelt kurz bei harten Landungen /
// starken Effekten — das macht die Bewegung spürbar dynamischer.
function CameraFollow() {
  const { camera } = useThree()
  const lead = useRef(0)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    // Vorausschau in Laufrichtung (weich nachgeführt, damit es nicht ruckt)
    const targetLead = Math.max(-3, Math.min(3, player.vx * 0.28))
    lead.current += (targetLead - lead.current) * Math.min(1, dt * 3)

    camera.position.x += (player.x + lead.current - camera.position.x) * Math.min(1, dt * 4)

    // Rüttler abklingen lassen
    shake.amount *= Math.max(0, 1 - dt * 6)
    const s = shake.amount
    const ox = s > 0.001 ? (Math.random() - 0.5) * s : 0
    const oy = s > 0.001 ? (Math.random() - 0.5) * s : 0
    camera.position.y = 4.4 + oy
    camera.lookAt(camera.position.x + ox, 3 + oy, 0)
  })
  return null
}

function GameView() {
  const levelId = useGameStore((s) => s.levelId)
  const runId = useGameStore((s) => s.runId)
  const screen = useGameStore((s) => s.screen)
  const level = getLevel(levelId)

  return (
    <>
      <Canvas
        key={runId}
        shadows="soft"
        dpr={[1, 2]}
        camera={{ position: [level.startX, 4.4, 13.5], fov: 48, near: 0.1, far: 600 }}
        gl={{ antialias: true }}
      >
        <CameraFollow />
        <AdventureScene level={level} />
      </Canvas>

      <Hud />
      <TouchControls />
      {screen === 'result' && <ResultScreen />}
    </>
  )
}

export default function App() {
  const screen = useGameStore((s) => s.screen)
  // Cover-Splash nur beim ersten Laden — nach „Zurück zum Menü" direkt ins Menü.
  const [entered, setEntered] = useState(false)
  useEffect(() => attachKeyboard(), [])
  useEffect(() => initMusic(), [])

  // Story-Kapitel läuft ohne 3D-Szene — spart Akku und lädt schneller.
  if (screen === 'story') {
    return (
      <>
        <StoryPanel />
        <RotateHint />
      </>
    )
  }

  if (screen === 'menu') {
    return (
      <>
        {entered ? <MainMenu /> : <SplashScreen onStart={() => setEntered(true)} />}
        <RotateHint />
      </>
    )
  }

  return (
    <>
      <GameView />
      <MuteButton />
      <RotateHint />
    </>
  )
}
