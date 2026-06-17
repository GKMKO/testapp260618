import type { HotspotData } from '../data/hotspots'

interface HintProps {
  /** 近接でアクティブなスポット（無ければ null で非表示） */
  spot: HotspotData | null
  /** 開く操作（クリック/タップ）。Phase 6 で InfoPanel を開く */
  onOpen?: (id: string) => void
  /** モバイル表示（操作文言を出し分け） */
  isMobile?: boolean
}

/** 近接時に画面下部へ "クリック/タップ or キーで見る" ヒントを出す HTML オーバーレイ。 */
export function Hint({ spot, onOpen, isMobile = false }: HintProps) {
  if (!spot) return null

  const action = isMobile ? 'タップ' : 'クリック / [E]'

  return (
    <div className="hint" role="status" aria-live="polite">
      <button
        type="button"
        className="hint__btn"
        onClick={() => onOpen?.(spot.id)}
        style={{ ['--spot-color' as string]: spot.color ?? 'var(--color-accent)' }}
      >
        <span className="hint__dot" />
        <span className="hint__title">{spot.title}</span>
        <span className="hint__action">{action} で見る</span>
      </button>
    </div>
  )
}
