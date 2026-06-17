# GMO グローバルスタジオ「スタジオツアー体験」要件定義 (source of truth)

> 本書はタスクブリーフから再構成した仕様書です。実装の唯一の正 (source of truth) として扱います。
> 「参考ポスト」は空欄のため無視します。

## 1. 概要

GMO グローバルスタジオの施設を Web/WebGL 上で疑似体験できる、軽量な一人称ウォークスルー
プロトタイプ。ユーザーは WASD/矢印で歩き回り、ドラッグで視点を回し、光るホットスポットに
近づいて見ることで各エリアの説明 (InfoPanel) を読める。文言・配置・スポット追加はすべて
データファイル (`src/data/hotspots.ts`) の編集だけで完結する。

## 2. 技術スタック / 制約

- Vite + React + TypeScript + Three.js + @react-three/fiber + @react-three/drei
- 依存は最新の安定版を使い、`package.json` にバージョンを固定 (exact pin)。`typecheck` スクリプトを追加。
- 状態管理は `useState` / `useMemo` / `useRef` のみ。外部状態管理ライブラリは入れない。
- 軽量プロトタイプ最優先。重いポストプロセス・物理エンジン・本格ゲーム実装はしない。
- 60fps を意識。モバイルは DPR と影品質を落とした簡易表示に分岐できるようにする。

## 3. 実装の勘所

- **カメラ操作**: PointerLock 単独にしない (モバイル不可・クリック判定と競合)。
  WASD/矢印で移動 + ドラッグで視点回転を基本とし、回転に damping/smoothing を入れて 3D 酔いを防ぐ。
  PointerLock はデスクトップ任意の拡張扱い。
- **モバイル**: ドラッグ視点 + 簡易ジョイスティックで最低限の操作。画面に簡易案内を表示。
- **移動制限**: 床の矩形範囲に AABB でクランプ。壁/エリアは Box の簡易当たり判定で十分
  (スタジオ外に出なければ OK)。
- **近接判定**: `useFrame` 内で距離計算するが毎フレーム `setState` しない。
  N フレームごと or 状態変化時のみ React state を更新し再レンダーを抑える。
- **ホットスポット表現**: リングの scale+opacity パルスや emissive で「発光・パルス」を安価に表現。
  近接時に "Press / Click to view" ヒントを出す。
- **UI** (タイトル/操作説明/InfoPanel/ミニマップ/ローディング) は Canvas 外の HTML
  オーバーレイで実装。InfoPanel は Esc とオーバーレイ外クリックで閉じる。
- **色**はすべて CSS 変数で定義し、1 ファイル (`src/styles/theme.css`) で変更可能にする。
- **3D モデル差し替え**: 今はプリミティブで構築しつつ、`useGLTF` で GLB/GLTF に差し替えるための
  専用コンポーネント (`GLTFModel`) と「ここを差し替える」コメントを用意。

## 4. 実装ステップ (= 実装 phase)

1. **基盤構築**: Vite+React+TS+Three+R3F+drei セットアップ、バージョン固定、`typecheck`/`build`
   スクリプト、`.gitignore`、最小 Canvas。
2. **スタジオ空間**: 床・壁・什器をプリミティブで構築、ライティング、GLTF 差し替え用
   `GLTFModel` コンポーネント + 「ここを差し替える」コメント。
3. **カメラ・移動**: WASD/矢印で移動 + ドラッグで視点回転 (damping)、PointerLock は任意拡張、
   床矩形に AABB クランプ。
4. **ホットスポット**: データ駆動 (`src/data/hotspots.ts`)、リングの scale+opacity パルス /
   emissive で安価に発光。
5. **近接判定**: `useFrame` 内で距離計算、毎フレーム `setState` せず N フレームごと/状態変化時のみ
   更新、"Press/Click to view" ヒント。
6. **InfoPanel・UI**: タイトル/操作説明/InfoPanel/ローディングを Canvas 外 HTML オーバーレイで。
   InfoPanel は Esc + 外クリックで閉じる。
7. **ミニマップ**: プレイヤー位置とスポットを 2D 俯瞰表示。
8. **モバイル対応**: ドラッグ視点 + 簡易ジョイスティック移動、DPR・影品質分岐、簡易操作案内。
9. **仕上げ**: 色を CSS 変数で一元管理、README、`tsc --noEmit` / `npm run build` 通過、DoD チェック。

## 5. Definition of Done

- `npm install` → `npm run dev` で起動。
- ブラウザで 3D スタジオ空間が表示される。
- WASD/矢印で移動、マウスドラッグで視点操作できる。
- ホットスポットのクリック/タップで InfoPanel に説明が出る。
- `src/data/hotspots.ts` の編集だけで文言・位置・スポット追加ができる。
- `tsc --noEmit` がクリーン (TypeScript エラーなし)。
- `npm run build` が通る。
- README に「起動方法」と「スポット追加 / 説明変更 / 色変更 / 3D モデル差し替え」の各編集箇所を明記。
