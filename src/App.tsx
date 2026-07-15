import { useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdventureScene } from './game/AdventureScene'
import { Hud } from './ui/Hud'
import { TouchControls } from './ui/TouchControls'
import { MainMenu } from './ui/MainMenu'
import { ResultScreen } from './ui/ResultScreen'
import { RotateHint } from './ui/RotateHint'
import { MuteButton } from './ui/MuteButton'
import { attachKeyboard } from './game/controls'
import { player } from './game/playerState'
import { useGameStore } from './store/gameStore'
import { getLevel } from './game/levels'
import { initMusic } from './audio/music'

// Strikte Seitenkamera: fest in Z/Y, folgt Fynnox nur in X (2,5D).
function CameraFollow() {
  const { camera } = useThree()
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    camera.position.x += (player.x - camera.position.x) * Math.min(1, dt * 4)
    camera.lookAt(camera.position.x, 3, 0)
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
  useEffect(() => attachKeyboard(), [])
  useEffect(() => initMusic(), [])

  return (
    <>
      {screen === 'menu' ? <MainMenu /> : <GameView />}
      <MuteButton />
      <RotateHint />
    </>
  )
}
