import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
import { InfoPanel } from './ui/InfoPanel'
import { TitleScreen } from './ui/TitleScreen'
import { Loading } from './ui/Loading'

// Phase 6: タイトル / InfoPanel / ローディングを追加し、クリック・E キーで解説を開く。
export default function App() {
  // 再レンダーを避けるため、プレイヤー位置/向き/ドラッグ状態は ref で共有する
  const playerPos = useRef(new THREE.Vector3(...PLAYER.start))
  const yawRef = useRef(PLAYER.startYaw)
  const draggingRef = useRef(false)

  const [started, setStarted] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null) // 近接
  const [selectedId, setSelectedId] = useState<string | null>(null) // InfoPanel 表示中

  const activeSpot = useMemo(
    () => hotspots.find((s) => s.id === activeId) ?? null,
    [activeId],
  )
  const selectedSpot = useMemo(
    () => hotspots.find((s) => s.id === selectedId) ?? null,
    [selectedId],
  )

  // 入力を受け付けるのは「開始済み かつ パネル非表示」のときだけ
  const controlsEnabled = started && !selectedId

  // ホットスポットのクリックで開く。ただしドラッグ視点だった場合は開かない
  const selectFromScene = (id: string) => {
    if (!draggingRef.current) setSelectedId(id)
  }

  // キーボード：Esc で閉じる / E・Enter で近接スポットを開く
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedId) setSelectedId(null)
        return
      }
      if (controlsEnabled && activeId && (e.code === 'KeyE' || e.key === 'Enter')) {
        setSelectedId(activeId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [controlsEnabled, activeId, selectedId])

  return (
    <div className="app-root">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: PLAYER.start, fov: 70, near: 0.1, far: 100 }}
      >
        <color attach="background" args={[SCENE_COLORS.background]} />
        <fog attach="fog" args={[SCENE_COLORS.fog, 16, 48]} />
        <Suspense fallback={null}>
          <Lighting quality="high" />
          <Studio />
          <Hotspots activeId={activeId} onSelect={selectFromScene} />
        </Suspense>
        <CameraRig
          enabled={controlsEnabled}
          playerPos={playerPos}
          yawRef={yawRef}
          draggingRef={draggingRef}
        />
        <ProximityTracker playerPos={playerPos} onActiveChange={setActiveId} />
      </Canvas>

      {/* --- HTML オーバーレイ --- */}
      {started && !selectedSpot && <Hint spot={activeSpot} onOpen={setSelectedId} />}
      <InfoPanel spot={selectedSpot} onClose={() => setSelectedId(null)} />
      {!started && <TitleScreen onStart={() => setStarted(true)} />}
      <Loading />
    </div>
  )
}
