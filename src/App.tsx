import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE_COLORS, PLAYER } from './data/config'
import { Lighting } from './three/Lighting'
import { Studio } from './three/Studio'
import { CameraRig } from './three/CameraRig'
import { Hotspots } from './three/Hotspots'

// Phase 4: データ駆動のホットスポット（パルス発光）を表示。
export default function App() {
  // 再レンダーを避けるため、プレイヤー位置/向き/ドラッグ状態は ref で共有する
  const playerPos = useRef(new THREE.Vector3(...PLAYER.start))
  const yawRef = useRef(PLAYER.startYaw)
  const draggingRef = useRef(false)

  return (
    <div className="app-root">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: PLAYER.start, fov: 70, near: 0.1, far: 100 }}
      >
        <color attach="background" args={[SCENE_COLORS.background]} />
        <fog attach="fog" args={[SCENE_COLORS.fog, 16, 48]} />
        <Lighting quality="high" />
        <Studio />
        <Hotspots />
        <CameraRig playerPos={playerPos} yawRef={yawRef} draggingRef={draggingRef} />
      </Canvas>
    </div>
  )
}
