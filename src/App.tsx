import { Canvas } from '@react-three/fiber'

// Phase 1: 基盤確認用の最小シーン。Phase 2 以降でスタジオ空間・カメラ・UI を載せ替える。
export default function App() {
  return (
    <div className="app-root">
      <Canvas camera={{ position: [0, 1.6, 6], fov: 60 }}>
        <color attach="background" args={['#0e0f15']} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <mesh position={[0, 1, 0]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00a4ff" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#22232c" />
        </mesh>
      </Canvas>
    </div>
  )
}
