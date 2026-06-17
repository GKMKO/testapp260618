/* =============================================================================
 * ホットスポット定義（このファイルの編集だけで 文言 / 位置 / スポット追加 が完結）
 * -----------------------------------------------------------------------------
 * ■ 説明文を変える     … 対象スポットの title / subtitle / body を編集
 * ■ 位置を変える        … position: [x, y, z]（床=y0。x:左右 / z:前後。手前=+Z）
 *                         歩ける範囲は config.ts の MOVEMENT_BOUNDS 内が目安
 * ■ スポットを追加する  … 配列に要素を 1 つ足すだけ（id は一意に）
 * ■ 色を変える          … color を指定（省略時はテーマの accent 色）
 * ■ 反応する距離を変える… activationRadius を指定（省略時 config.ts の既定値）
 * ===========================================================================*/

export interface HotspotData {
  /** 一意な ID */
  id: string
  /** InfoPanel の見出し */
  title: string
  /** 小見出し（任意） */
  subtitle?: string
  /** 説明本文。段落を分けたいときは空行（\n\n）で区切る */
  body: string
  /** ワールド座標 [x, y, z]（通常 y=0=床） */
  position: [number, number, number]
  /** アクセント色（任意・省略時はテーマ accent） */
  color?: string
  /** 近接で反応する半径(m)（任意・省略時は config.ts の既定値） */
  activationRadius?: number
}

export const hotspots: HotspotData[] = [
  {
    id: 'main-stage',
    title: 'メインステージ',
    subtitle: 'Main Stage',
    body: 'LED バックドロップと可動照明トラスを備えた、配信・収録の中心となる大型ステージです。\n\nライブ配信、番組収録、イベントのキー画づくりまで対応し、背景は用途に合わせて切り替えられます。',
    position: [0, 0, -3],
    color: '#00a4ff',
  },
  {
    id: 'streaming-booth',
    title: '配信ブース',
    subtitle: 'Streaming Booth',
    body: 'リングライトと配信用デスクを備えた、少人数向けのライブ配信ブースです。\n\nゲーム実況やトーク配信、ウェビナーなど、機材セッティング不要ですぐに本番へ入れます。',
    position: [5.5, 0, -1],
    color: '#6cf0ff',
  },
  {
    id: 'editing-room',
    title: '編集ルーム',
    subtitle: 'Editing Room',
    body: '収録した素材をその場で編集・書き出しできるポストプロダクションエリアです。\n\nマルチモニターの編集席を備え、撮影から納品までをスタジオ内で完結できます。',
    position: [-5.5, 0, -1],
    color: '#7c9cff',
  },
  {
    id: 'reception',
    title: '受付ロビー',
    subtitle: 'Reception',
    body: 'スタジオの玄関口となる受付ロビーです。来訪者のチェックインや打ち合わせの待ち合わせに使います。\n\nここがツアーのスタート地点。奥のメインステージへ進んでみましょう。',
    position: [0, 0, 4.5],
    color: '#00a4ff',
  },
  {
    id: 'green-room',
    title: 'グリーンルーム',
    subtitle: 'Green Room',
    body: '出演者がリラックスして本番に備える控室です。ソファとローテーブルを備えています。\n\n打ち合わせや小休憩、メイク直しなどに利用できます。',
    position: [-5.5, 0, 5.5],
    color: '#6cf0ff',
  },
]
