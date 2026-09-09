import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function Rig() {
  const groupRef = useRef<Group>(null);
  const torsoRef = useRef<Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(elapsed * 0.42) * 0.28;
      groupRef.current.rotation.x = Math.cos(elapsed * 0.22) * 0.04;
    }

    if (torsoRef.current) {
      torsoRef.current.position.y = Math.sin(elapsed * 0.8) * 0.05;
    }
  });

  const weights = useMemo(
    () => [
      [-1.22, 0, 0],
      [1.22, 0, 0]
    ] as const,
    []
  );

  return (
    <group ref={groupRef} position={[0, -0.16, 0]}>
      <mesh ref={torsoRef} position={[0, 0.18, 0]}>
        <capsuleGeometry args={[0.68, 2.05, 12, 20]} />
        <meshStandardMaterial color="#dce6ee" metalness={0.3} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color="#eff3f7" metalness={0.2} roughness={0.15} />
      </mesh>
      <mesh position={[-0.98, 0.78, 0]} rotation={[0, 0, -0.48]}>
        <capsuleGeometry args={[0.18, 1.22, 10, 18]} />
        <meshStandardMaterial color="#d5dee6" metalness={0.22} roughness={0.24} />
      </mesh>
      <mesh position={[0.98, 0.78, 0]} rotation={[0, 0, 0.48]}>
        <capsuleGeometry args={[0.18, 1.22, 10, 18]} />
        <meshStandardMaterial color="#97cdb0" emissive="#24473a" emissiveIntensity={0.18} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.24, 0]}>
        <torusGeometry args={[1.56, 0.06, 18, 80]} />
        <meshStandardMaterial color="#79cfa7" emissive="#173b2b" emissiveIntensity={0.32} />
      </mesh>
      {weights.map((position) => (
        <group key={position[0]} position={position}>
          <mesh>
            <cylinderGeometry args={[0.34, 0.34, 0.12, 28]} />
            <meshStandardMaterial color="#79cfa7" metalness={0.38} roughness={0.16} />
          </mesh>
          <mesh position={[0, 0, position[0] > 0 ? 0.18 : -0.18]}>
            <cylinderGeometry args={[0.28, 0.28, 0.1, 28]} />
            <meshStandardMaterial color="#edf2f6" metalness={0.18} roughness={0.14} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 5.8], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#09131b"]} />
      <fog attach="fog" args={["#09131b", 6.2, 10.5]} />
      <ambientLight intensity={1.35} color="#f6f8fa" />
      <directionalLight position={[3.8, 4.4, 3.2]} intensity={2.15} color="#ffffff" />
      <pointLight position={[-2.6, -1.8, 2]} intensity={1.1} color="#79cfa7" />
      <spotLight
        position={[0, 5.5, 3.5]}
        angle={0.36}
        penumbra={0.8}
        intensity={1.4}
        color="#ffffff"
      />
      <Rig />
    </Canvas>
  );
}
