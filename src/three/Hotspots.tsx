import { Hotspot } from './Hotspot'
import type { HotspotData } from '../data/hotspots'

interface HotspotsProps {
  /** 表示するスポット一覧（App が状態として保持） */
  spots: HotspotData[]
  /** 近接でアクティブなスポット ID */
  activeId?: string | null
  /** 編集モードで選択中のスポット ID（ハイライト表示） */
  selectedId?: string | null
  /** スポット選択時（view=InfoPanel / edit=編集対象に） */
  onSelect?: (id: string) => void
}

/** スポット一覧の描画。近接判定ロジックは ProximityTracker が担当。 */
export function Hotspots({ spots, activeId, selectedId, onSelect }: HotspotsProps) {
  return (
    <group>
      {spots.map((spot) => (
        <Hotspot
          key={spot.id}
          spot={spot}
          active={spot.id === activeId}
          selected={spot.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
