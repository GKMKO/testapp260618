import { useRef } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { HOTSPOT, SCENE_COLORS } from '../data/config'
import type { HotspotData } from '../data/hotspots'

interface HotspotProps {
  spot: HotspotData
  /** 近接でアクティブ（発光・パルスを強める） */
  active?: boolean
  /** 編集モードで選択中（選択リングを表示） */
  selected?: boolean
  /** クリック/タップで選択（view=InfoPanel / edit=編集対象に） */
  onSelect?: (id: string) => void
}

/**
 * 1 つのホットスポット表現。
 * 床リングの scale+opacity パルス・光の柱・浮遊オーブを emissive で安価に「発光」させる。
 * アニメは useFrame 内で ref を直接ミューテート（setState しないので再レンダー無し）。
 */
export function Hotspot({ spot, active = false, selected = false, onSelect }: HotspotProps) {
  const { gl } = useThree()
  const color = spot.color ?? SCENE_COLORS.accent

  const ring = useRef<THREE.Mesh>(null)
  const ringMat = useRef<THREE.MeshBasicMaterial>(null)
  const beamMat = useRef<THREE.MeshBasicMaterial>(null)
  const orb = useRef<THREE.Mesh>(null)
  const orbMat = useRef<THREE.MeshStandardMaterial>(null)

  useFrame((s) => {
    const t = s.clock.elapsedTime
    const pulse = 0.5 + 0.5 * Math.sin(t * 2.2) // 0..1
    const base = active ? 1.25 : 1

    if (ring.current) {
      const sc = base * (1 + 0.14 * pulse)
      ring.current.scale.set(sc, sc, 1)
    }
    if (ringMat.current) ringMat.current.opacity = (active ? 0.55 : 0.3) + 0.35 * pulse
    if (beamMat.current) beamMat.current.opacity = (active ? 0.14 : 0.06) + 0.05 * pulse
    if (orb.current) orb.current.position.y = HOTSPOT.orbHeight + 0.08 * Math.sin(t * 1.6)
    if (orbMat.current) orbMat.current.emissiveIntensity = active ? 2.4 : 1.3
  })

  const select = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onSelect?.(spot.id)
  }
  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    gl.domElement.style.cursor = 'pointer'
  }
  const out = () => {
    gl.domElement.style.cursor = 'grab'
  }

  return (
    <group position={spot.position}>
      {/* 床リング（パルス） */}
      <mesh
        ref={ring}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.03, 0]}
        onClick={select}
        onPointerOver={over}
        onPointerOut={out}
      >
        <ringGeometry args={[HOTSPOT.ringInner, HOTSPOT.ringOuter, 48]} />
        <meshBasicMaterial
          ref={ringMat}
          color={color}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* 光の柱 */}
      <mesh position={[0, HOTSPOT.beamHeight / 2, 0]} raycast={() => null}>
        <cylinderGeometry
          args={[HOTSPOT.ringInner * 0.9, HOTSPOT.ringOuter, HOTSPOT.beamHeight, 24, 1, true]}
        />
        <meshBasicMaterial
          ref={beamMat}
          color={color}
          transparent
          opacity={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 浮遊オーブ（クリック標的を分かりやすく） */}
      <mesh
        ref={orb}
        position={[0, HOTSPOT.orbHeight, 0]}
        onClick={select}
        onPointerOver={over}
        onPointerOut={out}
      >
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial
          ref={orbMat}
          color={color}
          emissive={color}
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>

      {/* 編集モードの選択ハイライト（白い二重リング） */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} raycast={() => null}>
          <ringGeometry args={[HOTSPOT.ringOuter + 0.12, HOTSPOT.ringOuter + 0.24, 48]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.95}
            side={THREE.DoubleSide}
            toneMapped={false}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}
