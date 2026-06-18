import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SCAN } from '../data/config'

/**
 * 実写スキャン(GLB)の表示コンポーネント。
 * - Scaniverse 等のスキャンは baseColor がベイク済みなので、ライティングに依存しない
 *   MeshBasicMaterial（アンライト）に置き換えて「撮影したまま」の見た目で表示する。
 * - 不完全スキャンの裏面抜け対策として両面描画（DoubleSide）。
 * - 影は使わない（castShadow/receiveShadow=false）。
 * - 床を y=0・水平中心を原点へ寄せるオフセットを group に適用。
 *
 * 完全版 GLB に差し替える時は config.ts の SCAN.url を変えるだけ
 * （必要に応じて offset / SCAN_BOUNDS / PLAYER.start を再調整）。
 */
export function StudioScan() {
  const { scene } = useGLTF(SCAN.url)

  const prepared = useMemo(() => {
    // useGLTF はシーンをキャッシュするため、マテリアル差し替えで汚さないよう複製
    const root = scene.clone(true)
    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return

      const src = mesh.material as THREE.MeshStandardMaterial | undefined
      const map = src && 'map' in src ? src.map : null
      const unlit = new THREE.MeshBasicMaterial({
        map: map ?? null,
        color: 0xffffff,
        side: SCAN.doubleSide ? THREE.DoubleSide : THREE.FrontSide,
        toneMapped: false, // ベイク済み色をそのまま出す
      })
      mesh.material = unlit
      mesh.castShadow = false
      mesh.receiveShadow = false
      mesh.frustumCulled = true
    })
    return root
  }, [scene])

  return (
    <group position={SCAN.offset} scale={SCAN.scale}>
      <primitive object={prepared} />
    </group>
  )
}

// 先読みでロードのカクつきを軽減
useGLTF.preload(SCAN.url)
