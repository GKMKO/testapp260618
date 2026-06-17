import { useEffect, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { MOVEMENT_BOUNDS, PLAYER } from '../data/config'
import { useKeyboard } from '../hooks/useKeyboard'

// 毎フレームの新規確保を避けるためのスクラッチ（リグは 1 つだけなので module スコープで安全）
const _forward = new THREE.Vector3()
const _right = new THREE.Vector3()
const _move = new THREE.Vector3()
const _desiredVel = new THREE.Vector3()

export interface CameraRigProps {
  /** false の間は入力を受け付けない（InfoPanel 表示中など）。慣性は止める */
  enabled?: boolean
  /** プレイヤーの現在位置の書き込み先（ミニマップ・近接判定が読む） */
  playerPos?: RefObject<THREE.Vector3>
  /** プレイヤーの向き(yaw)の書き込み先（ミニマップが読む） */
  yawRef?: RefObject<number>
  /** モバイルジョイスティック等の外部移動入力 (x:左右 / y:前後, -1..1) */
  moveInput?: RefObject<{ x: number; y: number }>
  /** ドラッグ中フラグの書き込み先（クリック/ドラッグの区別に使用） */
  draggingRef?: RefObject<boolean>
}

/**
 * 一人称カメラのリグ。
 * - WASD/矢印 + （任意の）ジョイスティックで移動。yaw 基準の水平移動のみ（見上げても歩行は水平）。
 * - ドラッグで視点回転。target に積んで current を時定数で追従させ damping（3D 酔い防止）。
 * - 位置は MOVEMENT_BOUNDS に AABB クランプ。
 * - PointerLock 中は movementX/Y を使う（デスクトップ任意拡張）。
 */
export function CameraRig({
  enabled = true,
  playerPos,
  yawRef,
  moveInput,
  draggingRef,
}: CameraRigProps) {
  const { camera, gl } = useThree()
  const keys = useKeyboard()

  // 回転（current は実際の値、target はドラッグで積む目標値）
  const rot = useRef2(PLAYER.startYaw)
  // 位置・速度
  const state = useStateRefs()

  // 初期化：カメラを開始位置・向きへ
  useEffect(() => {
    camera.rotation.order = 'YXZ'
    state.pos.set(...PLAYER.start)
    camera.position.copy(state.pos)
    camera.rotation.set(0, PLAYER.startYaw, 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ドラッグ / PointerLock による視点入力
  useEffect(() => {
    const el = gl.domElement
    let dragging = false
    let lastX = 0
    let lastY = 0

    const applyDelta = (dx: number, dy: number) => {
      rot.targetYaw -= dx * PLAYER.lookSensitivity
      rot.targetPitch -= dy * PLAYER.lookSensitivity
      rot.targetPitch = Math.max(
        -PLAYER.pitchLimit,
        Math.min(PLAYER.pitchLimit, rot.targetPitch),
      )
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return
      dragging = true
      if (draggingRef) draggingRef.current = false // まだ「ドラッグ」ではない（移動量で判定）
      lastX = e.clientX
      lastY = e.clientY
      el.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      const locked = document.pointerLockElement === el
      if (locked) {
        applyDelta(e.movementX, e.movementY)
        return
      }
      if (!dragging) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      if (draggingRef && (Math.abs(dx) > 2 || Math.abs(dy) > 2)) {
        draggingRef.current = true // 一定以上動いたらドラッグ確定（クリックと区別）
      }
      applyDelta(dx, dy)
    }
    const onUp = () => {
      dragging = false
      el.style.cursor = 'grab'
    }

    el.style.cursor = 'grab'
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [gl, draggingRef])

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05) // タブ復帰時などの大ジャンプを抑制

    // --- 視点回転の damping（フレームレート非依存の追従） ---
    const lookA = 1 - Math.exp(-dt / PLAYER.lookSmoothTime)
    rot.yaw += (rot.targetYaw - rot.yaw) * lookA
    rot.pitch += (rot.targetPitch - rot.pitch) * lookA

    // --- 移動入力（キーボード + 外部ジョイスティック）---
    let strafe = (keys.current.right ? 1 : 0) - (keys.current.left ? 1 : 0)
    let forward = (keys.current.forward ? 1 : 0) - (keys.current.back ? 1 : 0)
    if (moveInput?.current) {
      strafe += moveInput.current.x
      forward += moveInput.current.y
    }

    // yaw からの水平な前方/右方ベクトル
    const sin = Math.sin(rot.yaw)
    const cos = Math.cos(rot.yaw)
    _forward.set(-sin, 0, -cos)
    _right.set(cos, 0, -sin)

    _move.set(0, 0, 0)
    if (enabled) {
      _move.addScaledVector(_forward, forward)
      _move.addScaledVector(_right, strafe)
      if (_move.lengthSq() > 1) _move.normalize() // 斜め移動が速くならないように
    }
    _desiredVel.copy(_move).multiplyScalar(PLAYER.moveSpeed)

    // 速度のスムージング（加減速）
    const moveA = 1 - Math.exp(-dt / PLAYER.moveSmoothTime)
    state.vel.x += (_desiredVel.x - state.vel.x) * moveA
    state.vel.z += (_desiredVel.z - state.vel.z) * moveA

    // 位置更新 + AABB クランプ
    state.pos.x += state.vel.x * dt
    state.pos.z += state.vel.z * dt
    state.pos.x = clamp(state.pos.x, MOVEMENT_BOUNDS.minX, MOVEMENT_BOUNDS.maxX)
    state.pos.z = clamp(state.pos.z, MOVEMENT_BOUNDS.minZ, MOVEMENT_BOUNDS.maxZ)
    state.pos.y = PLAYER.eyeHeight

    // カメラへ反映
    camera.position.copy(state.pos)
    camera.rotation.set(rot.pitch, rot.yaw, 0)

    // 外部公開（ミニマップ・近接判定用）
    if (playerPos) playerPos.current.copy(state.pos)
    if (yawRef) yawRef.current = rot.yaw
  })

  return null
}

function clamp(v: number, min: number, max: number) {
  return v < min ? min : v > max ? max : v
}

// --- 小さな ref ヘルパー（再レンダーを起こさない可変状態） -------------------

function useRef2(startYaw: number) {
  const ref = useRef({
    yaw: startYaw,
    pitch: 0,
    targetYaw: startYaw,
    targetPitch: 0,
  })
  return ref.current
}

function useStateRefs() {
  const ref = useRef({
    pos: new THREE.Vector3(...PLAYER.start),
    vel: new THREE.Vector3(),
  })
  return ref.current
}
