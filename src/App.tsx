import { Canvas } from '@react-three/fiber'
import { SCENE_COLORS } from './data/config'
import { Lighting } from './three/Lighting'
import { Studio } from './three/Studio'

// Phase 2: スタジオ空間を表示。カメラ移動・視点操作は Phase 3 で差し替える。
export default function App() {
  return (
    <div className="app-root">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.6, 8.5], fov: 62, near: 0.1, far: 100 }}
      >
        <color attach="background" args={[SCENE_COLORS.background]} />
        <fog attach="fog" args={[SCENE_COLORS.fog, 16, 48]} />
        <Lighting quality="high" />
        <Studio />
      </Canvas>
    </div>
  )
}
