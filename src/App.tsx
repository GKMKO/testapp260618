import { useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE_COLORS, PLAYER } from './data/config'
import { hotspots } from './data/hotspots'
import { Lighting } from './three/Lighting'
import { Studio } from './three/Studio'
import { CameraRig } from './three/CameraRig'
import { Hotspots } from './three/Hotspots'
import { ProximityTracker } from './three/ProximityTracker'
import { Hint } from './ui/Hint'

// Phase 5: 近接判定（変化時のみ setState）とヒント表示を追加。
export default function App() {
  // 再レンダーを避けるため、プレイヤー位置/向き/ドラッグ状態は ref で共有する
  const playerPos = useRef(new THREE.Vector3(...PLAYER.start))
  const yawRef = useRef(PLAYER.startYaw)
  const draggingRef = useRef(false)

  // 近接でアクティブなスポット（ProximityTracker が変化時のみ更新）
  const [activeId, setActiveId] = useState<string | null>(null)
  const activeSpot = useMemo(
    () => hotspots.find((s) => s.id === activeId) ?? null,
    [activeId],
  )

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
        <Hotspots activeId={activeId} />
        <CameraRig playerPos={playerPos} yawRef={yawRef} draggingRef={draggingRef} />
        <ProximityTracker playerPos={playerPos} onActiveChange={setActiveId} />
      </Canvas>

      <Hint spot={activeSpot} />
    </div>
  )
}
