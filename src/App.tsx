import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { SCENE_COLORS, PLAYER, USE_SCAN_MODEL } from './data/config'
import type { HotspotData } from './data/hotspots'
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
import { LoginModal } from './ui/LoginModal'
import { EditorPanel } from './ui/EditorPanel'
import { useIsMobile } from './hooks/useIsMobile'
import { useAuth } from './hooks/useAuth'
import { useHotspots, makeHotspotId } from './hooks/useHotspots'

// ビューワーモード（既定・公開用）と、認証付き編集モード（ピボット追加/変更/削除）。
export default function App() {
  const isMobile = useIsMobile()
  const auth = useAuth()
  const { list, add, update, remove, replaceAll, resetDefaults, hasLocalEdits } = useHotspots()

  // 再レンダーを避けるため、プレイヤー位置/向き/ドラッグ状態・移動入力は ref で共有する
  const playerPos = useRef(new THREE.Vector3(...PLAYER.start))
  const yawRef = useRef(PLAYER.startYaw)
  const draggingRef = useRef(false)
  const moveInput = useRef({ x: 0, y: 0 })

  const [started, setStarted] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>('view')
  const [showLogin, setShowLogin] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null) // 近接
  const [selectedId, setSelectedId] = useState<string | null>(null) // InfoPanel(view)
  const [editSelId, setEditSelId] = useState<string | null>(null) // 編集対象(edit)

  const isEditing = mode === 'edit'

  const activeSpot = useMemo(() => list.find((s) => s.id === activeId) ?? null, [list, activeId])
  const selectedSpot = useMemo(
    () => list.find((s) => s.id === selectedId) ?? null,
    [list, selectedId],
  )
  const editSelSpot = useMemo(
    () => list.find((s) => s.id === editSelId) ?? null,
    [list, editSelId],
  )

  // 入力を受け付ける条件（編集モードでは歩ける／ログイン中は無効）
  const controlsEnabled = started && !showLogin && (isEditing || !selectedId)

  // プレイヤーの前方・床上の座標（追加/移動に使用）
  const frontPos = (): [number, number, number] => {
    const p = playerPos.current
    const yaw = yawRef.current
    const d = 2.5
    return [+(p.x - Math.sin(yaw) * d).toFixed(2), 0, +(p.z - Math.cos(yaw) * d).toFixed(2)]
  }

  // スポットクリック：view=InfoPanel / edit=編集対象に。ドラッグ視点時は無視
  const selectFromScene = (id: string) => {
    if (draggingRef.current) return
    if (isEditing) setEditSelId(id)
    else setSelectedId(id)
  }

  const enterEdit = () => {
    setSelectedId(null)
    if (auth.isAuthed) setMode('edit')
    else setShowLogin(true)
  }
  const handleLogin = (id: string, pass: string) => {
    const ok = auth.login(id, pass)
    if (ok) {
      setShowLogin(false)
      setMode('edit')
    }
    return ok
  }
  const exitEdit = () => {
    setMode('view')
    setEditSelId(null)
  }

  const addPivot = () => {
    const id = makeHotspotId()
    add({
      id,
      title: '新しいスポット',
      subtitle: '',
      body: 'ここに説明を入力します。',
      position: frontPos(),
      color: SCENE_COLORS.accent,
    })
    setEditSelId(id)
  }
  const deletePivot = (id: string) => {
    remove(id)
    setEditSelId((cur) => (cur === id ? null : cur))
  }

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hotspots.json'
    a.click()
    URL.revokeObjectURL(url)
  }
  const importJSON = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        if (Array.isArray(data)) {
          replaceAll(data as HotspotData[])
          setEditSelId(null)
        } else {
          alert('JSON 形式が正しくありません（配列が必要です）')
        }
      } catch {
        alert('JSON の読み込みに失敗しました')
      }
    }
    reader.readAsText(file)
  }

  // キーボード：Esc（閉じる/戻す）/ E・Enter（view で近接を開く）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showLogin) setShowLogin(false)
        else if (isEditing && editSelId) setEditSelId(null)
        else if (selectedId) setSelectedId(null)
        return
      }
      if (mode === 'view' && controlsEnabled && activeId && (e.code === 'KeyE' || e.key === 'Enter')) {
        setSelectedId(activeId)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, isEditing, controlsEnabled, activeId, selectedId, editSelId, showLogin])

  return (
    <div className="app-root">
      <Canvas
        shadows={!isMobile && !USE_SCAN_MODEL}
        dpr={isMobile ? [1, 1.5] : [1, 2]}
        camera={{ position: PLAYER.start, fov: 70, near: 0.1, far: 200 }}
      >
        <color attach="background" args={[SCENE_COLORS.background]} />
        <fog
          attach="fog"
          args={USE_SCAN_MODEL ? [SCENE_COLORS.fog, 45, 160] : [SCENE_COLORS.fog, 16, 48]}
        />
        <Suspense fallback={null}>
          <Lighting quality={isMobile ? 'low' : 'high'} scan={USE_SCAN_MODEL} />
          {USE_SCAN_MODEL ? <StudioScan /> : <Studio />}
          <Hotspots
            spots={list}
            activeId={activeId}
            selectedId={isEditing ? editSelId : null}
            onSelect={selectFromScene}
          />
        </Suspense>
        <CameraRig
          enabled={controlsEnabled}
          playerPos={playerPos}
          yawRef={yawRef}
          draggingRef={draggingRef}
          moveInput={moveInput}
        />
        <ProximityTracker spots={list} playerPos={playerPos} onActiveChange={setActiveId} />
      </Canvas>

      {/* --- HTML オーバーレイ --- */}
      {started && (
        <>
          <Minimap spots={list} playerPos={playerPos} yawRef={yawRef} activeId={activeId} />

          {isMobile ? (
            <>
              <div className="mobile-guide">
                {isEditing ? '編集モード（歩いて配置）' : 'ドラッグで視点 / スティックで移動'}
              </div>
              {controlsEnabled && !selectedSpot && <Joystick moveRef={moveInput} />}
            </>
          ) : (
            !isEditing && <ControlsLegend />
          )}

          {/* ビューワーモード UI */}
          {!isEditing && (
            <>
              {!selectedSpot && <Hint spot={activeSpot} onOpen={setSelectedId} isMobile={isMobile} />}
              <InfoPanel spot={selectedSpot} onClose={() => setSelectedId(null)} />
              <button className="admin-btn" onClick={enterEdit}>
                {auth.isAuthed ? '✏️ 編集モード' : '🔒 管理者ログイン'}
              </button>
            </>
          )}

          {/* 編集モード UI */}
          {isEditing && (
            <EditorPanel
              spots={list}
              selected={editSelSpot}
              hasLocalEdits={hasLocalEdits}
              onAdd={addPivot}
              onUpdate={update}
              onDelete={deletePivot}
              onMoveToFront={(id) => update(id, { position: frontPos() })}
              onDeselect={() => setEditSelId(null)}
              onExport={exportJSON}
              onImport={importJSON}
              onReset={resetDefaults}
              onLogout={() => {
                auth.logout()
                exitEdit()
              }}
              onExitEdit={exitEdit}
            />
          )}
        </>
      )}

      {showLogin && <LoginModal onSubmit={handleLogin} onCancel={() => setShowLogin(false)} />}
      {!started && <TitleScreen onStart={() => setStarted(true)} isMobile={isMobile} />}
      <Loading />
    </div>
  )
}
