import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE_COLORS, PLAYER, USE_SCAN_MODEL } from './data/config'
import { hotspots } from './data/hotspots'
import { Lighting } from './three/Lighting'
import { Studio } from './three/Studio'
import { StudioScan } from './three/StudioScan'
import { CameraRig } from './three/CameraRig'
import { Hotspots } from './three/Hotspots'
import { ProximityTracker } from './three/ProximityTracker'
import { Hint } from './ui/Hint'
import { InfoPanel } from './ui/InfoPanel'
import { TitleScreen } from './ui/TitleScreen'
import { Loading } from './ui/Loading'
import { Minimap } from './ui/Minimap'
import { ControlsLegend } from './ui/ControlsLegend'
import { Joystick } from './ui/Joystick'
import { useIsMobile } from './hooks/useIsMobile'

// Phase 8: モバイル対応（ジョイスティック / DPR・影品質の分岐 / 簡易案内）。
export default function App() {
  const isMobile = useIsMobile()

  // 再レンダーを避けるため、プレイヤー位置/向き/ドラッグ状態・移動入力は ref で共有する
  const playerPos = useRef(new THREE.Vector3(...PLAYER.start))
  const yawRef = useRef(PLAYER.startYaw)
  const draggingRef = useRef(false)
  const moveInput = useRef({ x: 0, y: 0 }) // ジョイスティック等の外部移動入力

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
        shadows={!isMobile && !USE_SCAN_MODEL}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: PLAYER.start, fov: 70, near: 0.1, far: 200 }}
      >
        <color attach="background" args={[SCENE_COLORS.background]} />
        {/* スキャンは奥行きが大きいのでフォグを遠くに（プリミティブ版は近距離フォグ） */}
        <fog
          attach="fog"
          args={USE_SCAN_MODEL ? [SCENE_COLORS.fog, 45, 160] : [SCENE_COLORS.fog, 16, 48]}
        />
        <Suspense fallback={null}>
          <Lighting quality={isMobile ? 'low' : 'high'} scan={USE_SCAN_MODEL} />
          {USE_SCAN_MODEL ? <StudioScan /> : <Studio />}
          <Hotspots activeId={activeId} onSelect={selectFromScene} />
        </Suspense>
        <CameraRig
          enabled={controlsEnabled}
          playerPos={playerPos}
          yawRef={yawRef}
          draggingRef={draggingRef}
          moveInput={moveInput}
        />
        <ProximityTracker playerPos={playerPos} onActiveChange={setActiveId} />
      </Canvas>

      {/* --- HTML オーバーレイ --- */}
      {started && (
        <>
          <Minimap playerPos={playerPos} yawRef={yawRef} activeId={activeId} />
          {isMobile ? (
            <>
              <div className="mobile-guide">ドラッグで視点 / スティックで移動</div>
              {!selectedSpot && <Joystick moveRef={moveInput} />}
            </>
          ) : (
            <ControlsLegend />
          )}
          {!selectedSpot && <Hint spot={activeSpot} onOpen={setSelectedId} isMobile={isMobile} />}
        </>
      )}
      <InfoPanel spot={selectedSpot} onClose={() => setSelectedId(null)} />
      {!started && <TitleScreen onStart={() => setStarted(true)} isMobile={isMobile} />}
      <Loading />
    </div>
  )
}
