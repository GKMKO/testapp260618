import { Grid } from '@react-three/drei'
import { STUDIO, SCENE_COLORS, LANDMARKS } from '../data/config'

/* =============================================================================
 * スタジオ空間（プリミティブ製）。
 * 本番の GLB/GLTF に差し替える場合は GLTFModel.tsx のコメント参照。
 * 各セットピースの座標は config.ts の LANDMARKS と一致させている
 * （hotspots.ts のスポット位置もこれに合わせて配置）。
 * ===========================================================================*/

// ---- 再利用パーツ ----------------------------------------------------------

/** デスク + モニター（配信ブース / 編集ルーム用） */
function Desk({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* 天板 */}
      <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.08, 0.8]} />
        <meshStandardMaterial color={SCENE_COLORS.furniture} roughness={0.7} />
      </mesh>
      {/* 脚（左右の板脚） */}
      <mesh position={[-0.7, 0.37, 0]} castShadow>
        <boxGeometry args={[0.08, 0.75, 0.7]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
      <mesh position={[0.7, 0.37, 0]} castShadow>
        <boxGeometry args={[0.08, 0.75, 0.7]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
      {/* モニター（発光スクリーン） */}
      <mesh position={[0, 1.18, -0.18]} castShadow>
        <boxGeometry args={[0.9, 0.52, 0.05]} />
        <meshStandardMaterial
          color={SCENE_COLORS.screen}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 0.86, -0.14]}>
        <boxGeometry args={[0.1, 0.28, 0.1]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
    </group>
  )
}

/** 簡易チェア */
function Chair({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number]
  rotation?: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
      <mesh position={[0, 0.75, -0.22]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.08]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
    </group>
  )
}

// ---- 区画（セットピース） --------------------------------------------------

/** メインステージ：円形の段上げ + LED バックドロップ */
function MainStage() {
  return (
    <group position={LANDMARKS.mainStage}>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[3, 3, 0.3, 48]} />
        <meshStandardMaterial color={SCENE_COLORS.stageTop} roughness={0.65} />
      </mesh>
      {/* LED バックドロップ（発光パネル） */}
      <mesh position={[0, 2.3, -2.4]} castShadow>
        <boxGeometry args={[6.4, 3.8, 0.2]} />
        <meshStandardMaterial
          color={SCENE_COLORS.screen}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={0.55}
        />
      </mesh>
      {/* 照明トラス（簡易：横バー） */}
      <mesh position={[0, 4.3, -1]} castShadow>
        <boxGeometry args={[6.5, 0.15, 0.15]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** 配信ブース：デスク + チェア + 配信ライト */
function StreamingBooth() {
  return (
    <group position={LANDMARKS.streamingBooth}>
      <Desk position={[0, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Chair position={[1, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
      {/* リングライト風スタンド */}
      <mesh position={[-0.4, 1.6, 1]} castShadow>
        <torusGeometry args={[0.35, 0.06, 12, 32]} />
        <meshStandardMaterial
          color={SCENE_COLORS.screen}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={0.6}
        />
      </mesh>
      <mesh position={[-0.4, 0.8, 1]}>
        <cylinderGeometry args={[0.04, 0.04, 1.6, 8]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
    </group>
  )
}

/** 編集ルーム：デスク 2 台 */
function EditingRoom() {
  return (
    <group position={LANDMARKS.editingRoom}>
      <Desk position={[0, 0, -1]} rotation={[0, Math.PI / 2, 0]} />
      <Desk position={[0, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
      <Chair position={[-1, 0, -1]} rotation={[0, Math.PI / 2, 0]} />
      <Chair position={[-1, 0, 1]} rotation={[0, Math.PI / 2, 0]} />
    </group>
  )
}

/** 受付ロビー：カウンター + ロゴパネル */
function Reception() {
  return (
    <group position={LANDMARKS.reception}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 1.1, 1]} />
        <meshStandardMaterial color={SCENE_COLORS.furniture} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.13, 0]} castShadow>
        <boxGeometry args={[4.3, 0.07, 1.25]} />
        <meshStandardMaterial color={SCENE_COLORS.stageTop} />
      </mesh>
      {/* ロゴパネル */}
      <mesh position={[0, 2.5, 0.85]} castShadow>
        <boxGeometry args={[3, 1.2, 0.1]} />
        <meshStandardMaterial
          color={SCENE_COLORS.screen}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={0.45}
        />
      </mesh>
    </group>
  )
}

/** グリーンルーム（控室）：ソファ + ローテーブル */
function GreenRoom() {
  return (
    <group position={LANDMARKS.greenRoom}>
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.4, 0.9]} />
        <meshStandardMaterial color={SCENE_COLORS.furniture} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.75, -0.4]} castShadow>
        <boxGeometry args={[2.2, 0.6, 0.2]} />
        <meshStandardMaterial color={SCENE_COLORS.furniture} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.25, 1.1]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 0.1, 0.7]} />
        <meshStandardMaterial color={SCENE_COLORS.furnitureDark} />
      </mesh>
    </group>
  )
}

// ---- 構造（床・壁・天井） --------------------------------------------------

function Shell() {
  const { width: w, depth: d, wallHeight: h, wallThickness: t } = STUDIO
  return (
    <group>
      {/* 床 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={SCENE_COLORS.floor} roughness={0.92} metalness={0.05} />
      </mesh>
      {/* 床のグリッドライン（スタジオ床らしさ） */}
      <Grid
        position={[0, 0.012, 0]}
        args={[w, d]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#2c3142"
        sectionSize={5}
        sectionThickness={1}
        sectionColor={SCENE_COLORS.accent}
        fadeDistance={42}
        fadeStrength={1.2}
        followCamera={false}
        infiniteGrid={false}
      />

      {/* 壁 4 枚 */}
      <mesh position={[0, h / 2, -d / 2]} receiveShadow castShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>
      <mesh position={[0, h / 2, d / 2]} receiveShadow castShadow>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>
      <mesh position={[-w / 2, h / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[t, h, d]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[t, h, d]} />
        <meshStandardMaterial color={SCENE_COLORS.wall} roughness={0.95} />
      </mesh>

      {/* 天井 */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, h, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color={SCENE_COLORS.ceiling} roughness={1} side={2} />
      </mesh>

      {/* 壁上部のアクセントトリム（背面） */}
      <mesh position={[0, h - 0.4, -d / 2 + t]}>
        <boxGeometry args={[w, 0.08, 0.04]} />
        <meshStandardMaterial
          color={SCENE_COLORS.accent}
          emissive={SCENE_COLORS.accent}
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  )
}

export function Studio() {
  return (
    <group>
      <Shell />
      <MainStage />
      <StreamingBooth />
      <EditingRoom />
      <Reception />
      <GreenRoom />
    </group>
  )
}
