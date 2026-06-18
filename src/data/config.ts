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
 * 実写スキャン(GLB)を使うか。
 * - true  : Scaniverse 等の実写スキャンを表示（下記 SCAN）
 * - false : 従来のプリミティブ製スタジオ（Studio.tsx）
 */
export const USE_SCAN_MODEL = true

/**
 * 実写スキャン(GLB)の設定。
 * モデルは public/models/ に置き、GitHub Pages のサブパス配信に対応するため
 * import.meta.env.BASE_URL 経由で参照する。
 * 取り込んだテストモデルの元 bbox: min(-16.44,-0.385,-18.21) / max(15.68,8.14,17.39)。
 * 完全版に差し替える時は url とオフセット/移動範囲(下の SCAN_BOUNDS)を調整するだけ。
 */
export const SCAN = {
  url: import.meta.env.BASE_URL + 'models/studio-scan-test.glb',
  // 床を y=0・水平中心を原点へ寄せるオフセット（= -中心X, -最小Y, -中心Z）
  offset: [0.38, 0.385, 0.41] as [number, number, number],
  scale: 1,
  doubleSide: true, // 不完全スキャンの裏面抜け対策（両面描画）
} as const

/** プリミティブ版スタジオの歩ける範囲。 */
const PRIMITIVE_BOUNDS = {
  minX: -STUDIO.width / 2 + 1.2,
  maxX: STUDIO.width / 2 - 1.2,
  minZ: -STUDIO.depth / 2 + 1.2,
  maxZ: STUDIO.depth / 2 - 1.2,
}

/** スキャン版の歩ける範囲（footprint 内側にマージン。完全版で要再調整）。 */
const SCAN_BOUNDS = { minX: -13, maxX: 13, minZ: -15, maxZ: 15 }

/**
 * プレイヤーが歩ける矩形範囲（AABB）。移動時にこの範囲へクランプする。
 */
export const MOVEMENT_BOUNDS = USE_SCAN_MODEL ? SCAN_BOUNDS : PRIMITIVE_BOUNDS

/**
 * プレイヤー（一人称カメラ）の挙動設定。
 * 数値を上げると速く/感度が高くなる。smoothTime はフレームレート非依存の追従時間（秒）。
 */
export const PLAYER = {
  eyeHeight: 1.6, // 視点の高さ(m)
  // 初期位置（スキャン版はモデル中心付近からスタート / プリミティブ版は受付付近）
  start: (USE_SCAN_MODEL ? [0, 1.6, 6] : [0, 1.6, 8.5]) as [number, number, number],
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

/** ホットスポットの既定値（個別に上書きしたい場合は hotspots.ts の各項目で指定）。 */
export const HOTSPOT = {
  defaultActivationRadius: 2.8, // この距離(m)以内に入るとアクティブ＆ヒント表示
  ringInner: 0.55,
  ringOuter: 0.78,
  beamHeight: 2.8,
  orbHeight: 1.45,
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

/**
 * 編集モードの簡易認証情報。
 * ⚠️ 注意: これはクライアントサイドの「ゲート」であり本当のセキュリティではありません。
 *   資格情報はビルド済み JS に含まれ、閲覧・回避が可能です。
 *   本番で実際の編集者権限を守るには、サーバ側認証＋保存先(CMS/DB)が必要です。
 */
export const AUTH = {
  id: 'admin',
  pass: 'admin',
} as const

/** ブラウザ保存のキー（localStorage: 編集内容 / sessionStorage: ログイン状態）。 */
export const STORAGE = {
  hotspots: 'gmo-studio.hotspots.v1',
  auth: 'gmo-studio.auth.v1',
} as const

/** 描画品質プリセット（Phase 8 でモバイル分岐に使用）。 */
export type Quality = 'high' | 'low'
