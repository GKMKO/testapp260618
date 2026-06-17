import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages のプロジェクトサイトは https://<user>.github.io/<repo>/ で配信されるため、
// 本番ビルドのみ base をリポジトリ名に合わせる（dev サーバは '/' のまま）。
// リポジトリ名を変えた / 独自ドメインや別ホストに置く場合は BASE_PATH を変更してください。
const BASE_PATH = '/testapp260618/'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? BASE_PATH : '/',
  plugins: [react()],
}))
