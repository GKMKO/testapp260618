import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'
import type { HotspotData } from '../data/hotspots'
import { HOTSPOT } from '../data/config'

interface ProximityTrackerProps {
  /** 判定対象のスポット一覧 */
  spots: HotspotData[]
  /** プレイヤー位置（CameraRig が毎フレーム書き込む） */
  playerPos: RefObject<THREE.Vector3>
  /** アクティブスポットが「変化した時だけ」呼ばれる */
  onActiveChange: (id: string | null) => void
  /** 何フレームに 1 回判定するか（負荷軽減） */
  checkEveryNFrames?: number
}

/**
 * 近接判定。useFrame 内で距離計算するが、毎フレーム setState はしない。
 * N フレームごとに最近傍スポットを求め、前回と変わった時のみ onActiveChange を呼ぶ。
 */
export function ProximityTracker({
  spots,
  playerPos,
  onActiveChange,
  checkEveryNFrames = 6,
}: ProximityTrackerProps) {
  const counter = useRef(0)
  const currentId = useRef<string | null>(null)

  useFrame(() => {
    counter.current = (counter.current + 1) % checkEveryNFrames
    if (counter.current !== 0) return

    const p = playerPos.current
    let bestId: string | null = null
    let bestDist = Infinity

    for (const s of spots) {
      const r = s.activationRadius ?? HOTSPOT.defaultActivationRadius
      const dx = p.x - s.position[0]
      const dz = p.z - s.position[2]
      const d2 = dx * dx + dz * dz
      if (d2 <= r * r && d2 < bestDist) {
        bestDist = d2
        bestId = s.id
      }
    }

    if (bestId !== currentId.current) {
      currentId.current = bestId
      onActiveChange(bestId) // 状態変化時のみ React state を更新
    }
  })

  return null
}
