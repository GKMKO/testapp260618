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
 * プレイヤー（一人称カメラ）の挙動設定。
 * 数値を上げると速く/感度が高くなる。smoothTime はフレームレート非依存の追従時間（秒）。
 */
export const PLAYER = {
  eyeHeight: 1.6, // 視点の高さ(m)
  start: [0, 1.6, 8.5] as [number, number, number], // 初期位置（受付付近からステージを向く）
  startYaw: 0, // 初期の向き（0 = -Z 方向＝ステージ側）
  moveSpeed: 4.6, // 移動速度(m/s)
  lookSensitivity: 0.0026, // 視点回転感度(rad/px)
  pitchLimit: Math.PI / 2 - 0.12, // 上下の見上げ/見下ろし制限(rad)
  lookSmoothTime: 0.08, // 視点回転のスムージング(秒)：大きいほどヌルッと（酔い防止）
  moveSmoothTime: 0.1, // 移動の加減速スムージング(秒)
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
