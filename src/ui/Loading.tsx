import { useProgress } from '@react-three/drei'

/**
 * 読み込みオーバーレイ（Canvas 外）。
 * 現状は非同期アセットが無いため表示されないが、GLTF/テクスチャ導入時に自動で機能する。
 */
export function Loading() {
  const { active, progress } = useProgress()
  if (!active) return null

  return (
    <div className="loading">
      <div className="loading__bar">
        <span style={{ width: `${progress}%` }} />
      </div>
      <div className="loading__txt">読み込み中… {Math.round(progress)}%</div>
    </div>
  )
}
