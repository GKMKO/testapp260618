import type { HotspotData } from '../data/hotspots'

interface InfoPanelProps {
  /** 表示するスポット（null で非表示） */
  spot: HotspotData | null
  /** 閉じる（Esc は App 側、外側クリックはここで処理） */
  onClose: () => void
}

/**
 * スポット説明パネル（Canvas 外の HTML オーバーレイ）。
 * - 背景（バックドロップ）クリックで閉じる
 * - パネル本体クリックは伝播を止めて閉じない
 * - Esc キーは App のグローバルキーハンドラで処理
 */
export function InfoPanel({ spot, onClose }: InfoPanelProps) {
  if (!spot) return null

  const paragraphs = spot.body.split('\n\n')
  const color = spot.color ?? 'var(--color-accent)'

  return (
    <div className="panel-backdrop" onClick={onClose}>
      <aside
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={spot.title}
        onClick={(e) => e.stopPropagation()}
        style={{ ['--spot-color' as string]: color }}
      >
        <header className="panel__head">
          <div>
            {spot.subtitle && <div className="panel__sub">{spot.subtitle}</div>}
            <h2 className="panel__title">{spot.title}</h2>
          </div>
          <button className="panel__close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </header>

        <div className="panel__body">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <footer className="panel__foot">Esc / 外側クリックで閉じる</footer>
      </aside>
    </div>
  )
}
