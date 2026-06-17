import { SCENE_COLORS, type Quality } from '../data/config'

/**
 * スタジオ照明。high/low で影マップ解像度と影の有無を切り替え、モバイルを軽量化する。
 */
export function Lighting({ quality = 'high' }: { quality?: Quality }) {
  const enableShadow = quality === 'high'
  const shadowMapSize = quality === 'high' ? 2048 : 1024

  return (
    <>
      {/* 環境光（上＝青み / 下＝暗い反射） */}
      <hemisphereLight args={['#9fb4ff', '#14151d', 0.55]} />
      <ambientLight intensity={0.22} />

      {/* キーライト：天井から斜めに。影はここだけが落とす */}
      <directionalLight
        position={[10, 16, 8]}
        intensity={1.5}
        castShadow={enableShadow}
        shadow-mapSize-width={shadowMapSize}
        shadow-mapSize-height={shadowMapSize}
        shadow-bias={-0.0004}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
      />

      {/* メインステージを照らすアクセント点光源（発光感の演出） */}
      <pointLight
        position={[0, 4.2, -6]}
        intensity={45}
        distance={22}
        decay={2}
        color={SCENE_COLORS.accent}
      />
    </>
  )
}
