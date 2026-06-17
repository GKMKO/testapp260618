/* =============================================================================
 * スタジオの寸法・移動範囲・3D シーンの構造色を集中管理するファイル。
 * -----------------------------------------------------------------------------
 * - UI の色は src/styles/theme.css（CSS 変数）
 * - 3D シーンの構造色は下記 SCENE_COLORS
 * - スポットの文言/位置/色は src/data/hotspots.ts
 * ===========================================================================*/

/** スタジオ（部屋）の寸法。X=幅(左右) / Z=奥行き / Y=高さ */
export const STUDIO = {
  width: 26, // X 方向
  depth: 20, // Z 方向
  wallHeight: 5,
  wallThickness: 0.3,
} as const

/**
 * プレイヤーが歩ける矩形範囲（壁の内側にマージンを取った AABB）。
 * Phase 3 の移動でこの範囲にクランプする。
 */
export const MOVEMENT_BOUNDS = {
  minX: -STUDIO.width / 2 + 1.2,
  maxX: STUDIO.width / 2 - 1.2,
  minZ: -STUDIO.depth / 2 + 1.2,
  maxZ: STUDIO.depth / 2 - 1.2,
} as const

/**
 * 主要セットピース（什器）のアンカー座標。
 * hotspots.ts のスポット位置はこれらに合わせて配置している。
 */
export const LANDMARKS = {
  mainStage: [0, 0, -6] as const,
  streamingBooth: [8, 0, -1] as const,
  editingRoom: [-8, 0, -1] as const,
  reception: [0, 0, 7] as const,
  greenRoom: [-8, 0, 6] as const,
} as const

/** 3D シーンの構造色（UI 色ではない。UI 色は theme.css を編集）。 */
export const SCENE_COLORS = {
  background: '#0e0f15',
  fog: '#0e0f15',
  floor: '#23252f',
  wall: '#191b24',
  wallTrim: '#00a4ff',
  ceiling: '#121420',
  stage: '#2a2d3a',
  stageTop: '#34384a',
  furniture: '#2f3340',
  furnitureDark: '#23262f',
  screen: '#0b2233',
  accent: '#00a4ff',
} as const

/** 描画品質プリセット（Phase 8 でモバイル分岐に使用）。 */
export type Quality = 'high' | 'low'
