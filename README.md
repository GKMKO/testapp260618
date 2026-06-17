# GMO グローバルスタジオ — スタジオツアー体験 (Web/WebGL)

3D スタジオ空間を一人称で歩き回り、光るホットスポットに近づいて各エリアの説明を読める、
軽量な WebGL ツアープロトタイプです。

- **技術**: Vite + React + TypeScript + Three.js + @react-three/fiber + @react-three/drei
- **状態管理**: React の `useState` / `useMemo` / `useRef` のみ（外部ライブラリ不使用）
- 仕様の詳細は [`requirements.md`](./requirements.md) を参照。

---

## 起動方法

```bash
npm install      # 依存をインストール
npm run dev      # 開発サーバ起動（表示された http://localhost:5173 を開く）
```

その他のスクリプト:

```bash
npm run build      # 型チェック + 本番ビルド（dist/）
npm run preview    # 本番ビルドをローカル配信して確認
npm run typecheck  # tsc --noEmit（型チェックのみ）
```

> 動作環境: Node.js 18+ 推奨（開発時は v22 で確認）。WebGL 対応のモダンブラウザが必要です。

---

## 公開（GitHub Pages）

`main` ブランチへの push で、GitHub Actions（`.github/workflows/deploy.yml`）が
自動ビルドして GitHub Pages に公開します。

- 公開 URL: **https://gkmko.github.io/testapp260618/**
- プロジェクトサイトはサブパス配信のため、`vite.config.ts` の `BASE_PATH`
  （= `/testapp260618/`）でアセットの基準パスを合わせています。リポジトリ名変更・
  独自ドメイン・別ホストに置く場合はここを変更してください。
- 初回はリポジトリの **Settings → Pages → Build and deployment → Source = "GitHub Actions"**
  になっている必要があります（ワークフローが自動有効化を試みますが、組織設定で
  ブロックされる場合は手動で選択してください）。

手動デプロイは Actions タブの「Deploy to GitHub Pages」→ Run workflow からも実行できます。

---

## 操作方法

**デスクトップ**

| 操作 | 内容 |
| --- | --- |
| `W` `A` `S` `D` / 矢印キー | 移動 |
| マウスドラッグ | 視点回転 |
| 光るスポットに近づいて **クリック** または `E` / `Enter` | 解説パネルを開く |
| `Esc` / 背景クリック | 解説パネルを閉じる |

**モバイル**

| 操作 | 内容 |
| --- | --- |
| 左下のバーチャルスティック | 移動 |
| 画面ドラッグ | 視点回転 |
| スポットに近づいて **タップ** | 解説パネルを開く |

画面右上にミニマップ（プレイヤー位置・向き・スポット）を表示します。

---

## カスタマイズ（編集箇所まとめ）

軽微な変更はデータ／設定ファイルの編集だけで完結します。

### 1. スポットの追加 / 説明文の変更 → `src/data/hotspots.ts`

`hotspots` 配列を編集するだけです。要素を 1 つ足せばスポットが増えます。

```ts
{
  id: 'new-area',            // 一意な ID
  title: '新エリア',          // パネル見出し
  subtitle: 'New Area',      // 小見出し（任意）
  body: '説明文。\n\n空行で段落を分けられます。',
  position: [3, 0, 2],       // ワールド座標 [x, y, z]（床=y0 / 手前=+Z）
  color: '#00a4ff',          // アクセント色（任意・省略時はテーマ accent）
  activationRadius: 2.8,     // 反応する距離(m)（任意）
}
```

### 2. 色の変更

- **UI（タイトル/パネル/ヒント/ミニマップ等）の色** → `src/styles/theme.css`
  先頭の `:root` にある CSS 変数を変えるだけで全体に反映されます。
- **3D シーンの構造色（床・壁・什器など）** → `src/data/config.ts` の `SCENE_COLORS`
- **スポットごとの色** → `src/data/hotspots.ts` の各 `color`

### 3. 3D モデルの差し替え（プリミティブ → GLB/GLTF） → `src/three/GLTFModel.tsx` / `src/three/Studio.tsx`

現状はプリミティブ（box / cylinder など）でスタジオを構築しています。本番モデルに差し替える手順は
`src/three/GLTFModel.tsx` のコメントに記載しています。概要:

1. `public/models/` に `.glb` を置く（例: `public/models/studio.glb`）
2. `src/three/Studio.tsx` のプリミティブ群を `<GLTFModel url="/models/studio.glb" />` に置き換える
3. 必要に応じて `useGLTF.preload(...)` を有効化（先読み）

### 4. 配置・寸法・移動範囲・プレイヤー挙動 → `src/data/config.ts`

スタジオ寸法 `STUDIO`、歩ける範囲 `MOVEMENT_BOUNDS`、什器アンカー `LANDMARKS`、
移動速度や視点感度・スムージング `PLAYER`、ホットスポット既定値 `HOTSPOT` をまとめています。

---

## ディレクトリ構成

```
src/
├ main.tsx              エントリ
├ App.tsx               画面全体の組み立て（Canvas + HTML オーバーレイ + 状態）
├ data/
│  ├ config.ts          寸法 / 移動範囲 / プレイヤー設定 / SCENE_COLORS など
│  └ hotspots.ts        スポット定義（文言・位置・色）★ここを編集
├ three/
│  ├ Studio.tsx         スタジオ空間（プリミティブ）
│  ├ Lighting.tsx       照明（影品質 high/low 切替）
│  ├ GLTFModel.tsx      3D モデル差し替え用コンポーネント
│  ├ CameraRig.tsx      一人称カメラ（移動・ドラッグ視点・AABB クランプ）
│  ├ Hotspot.tsx        ホットスポット 1 個の表現（パルス発光）
│  ├ Hotspots.tsx       スポット一覧の描画
│  └ ProximityTracker.tsx 近接判定（変化時のみ state 更新）
├ hooks/
│  ├ useKeyboard.ts     WASD/矢印（ref 追跡）
│  └ useIsMobile.ts     モバイル判定
├ ui/                   Canvas 外の HTML オーバーレイ
│  ├ TitleScreen.tsx / InfoPanel.tsx / Hint.tsx
│  ├ Minimap.tsx / ControlsLegend.tsx / Joystick.tsx / Loading.tsx
└ styles/
   ├ theme.css          色（CSS 変数）★色変更はここ
   └ ui.css             UI レイアウト
```

---

## 設計メモ

- カメラは「移動＋ドラッグ視点」を基本にし、PointerLock には依存しません（モバイル不可・クリック競合のため）。
  視点回転にはフレームレート非依存の damping を入れ、3D 酔いを抑えています。
- 近接判定・移動・ミニマップは毎フレームの `setState` を避け、`ref` ＋ `useFrame`/`rAF` で処理。
  React の再レンダーは「アクティブスポットが変化した時」など状態変化時のみ発生します。
- モバイルでは影を無効化し DPR 上限を下げて軽量表示に分岐します。
