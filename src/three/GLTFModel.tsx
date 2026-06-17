import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'

type GroupProps = ThreeElements['group']

/**
 * =============================================================================
 * 【3D モデル差し替えポイント】
 * -----------------------------------------------------------------------------
 * 現状スタジオは Studio.tsx 内のプリミティブ（box / cylinder など）で組んでいます。
 * GLB / GLTF の本番モデルに差し替えたいときは、このコンポーネントを使ってください。
 *
 *   1. モデルを public/models/ に置く（例: public/models/studio.glb）
 *   2. 末尾の useGLTF.preload(...) のコメントを外し、パスを設定（任意・推奨）
 *   3. Studio.tsx のプリミティブ群を、以下のように差し替える:
 *
 *        // import { GLTFModel } from './GLTFModel'
 *        <GLTFModel url="/models/studio.glb" />
 *
 *   4. 影を出す場合は castShadow / receiveShadow を traverse で付与（下記コメント参照）。
 * =============================================================================
 */
export function GLTFModel({ url, ...props }: { url: string } & GroupProps) {
  const { scene } = useGLTF(url)

  // 影を有効化したい場合は、ロードしたメッシュに castShadow/receiveShadow を付与する:
  //   useMemo(() => {
  //     scene.traverse((o) => {
  //       if ((o as THREE.Mesh).isMesh) {
  //         o.castShadow = true
  //         o.receiveShadow = true
  //       }
  //     })
  //   }, [scene])

  return <primitive object={scene} {...props} />
}

// 差し替え時に有効化（先読みでロードのカクつきを軽減）:
// useGLTF.preload('/models/studio.glb')
