import { hotspots } from '../data/hotspots'
import { Hotspot } from './Hotspot'

interface HotspotsProps {
  /** 近接でアクティブなスポット ID（Phase 5 の近接判定で渡す） */
  activeId?: string | null
  /** スポット選択時（Phase 6 で InfoPanel を開く） */
  onSelect?: (id: string) => void
}

/** hotspots.ts のデータを描画する。近接判定ロジックは ProximityTracker（Phase 5）が担当。 */
export function Hotspots({ activeId, onSelect }: HotspotsProps) {
  return (
    <group>
      {hotspots.map((spot) => (
        <Hotspot
          key={spot.id}
          spot={spot}
          active={spot.id === activeId}
          onSelect={onSelect}
        />
      ))}
    </group>
  )
}
