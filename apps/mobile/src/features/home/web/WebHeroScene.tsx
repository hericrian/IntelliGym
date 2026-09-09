import { Canvas, useFrame } from "@react-three/fiber";
import { type JSX, useMemo, useRef } from "react";
import type { Group, Mesh } from "three";

function HeroRig(): JSX.Element {
  const groupRef = useRef<Group>(null);
  const torsoRef = useRef<Mesh>(null);
  const orbitRef = useRef<Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(elapsed * 0.45) * 0.32;
      groupRef.current.rotation.x = Math.cos(elapsed * 0.2) * 0.05;
    }

    if (torsoRef.current) {
      torsoRef.current.position.y = Math.sin(elapsed * 0.8) * 0.06;
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.z = elapsed * 0.55;
      orbitRef.current.rotation.x = Math.sin(elapsed * 0.6) * 0.4;
    }
  });

  const platePositions = useMemo(
    () => [
      [-1.25, 0, 0],
      [1.25, 0, 0]
    ] as const,
    []
  );

  return (
    <group ref={groupRef} position={[0, -0.18, 0]}>
      <mesh ref={torsoRef} position={[0, 0.12, 0]}>
        <capsuleGeometry args={[0.72, 2.1, 14, 22]} />
        <meshStandardMaterial color="#dce5ee" metalness={0.32} roughness={0.2} />
      </mesh>

      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.42, 24, 24]} />
        <meshStandardMaterial color="#eff4f8" metalness={0.2} roughness={0.12} />
      </mesh>

      <mesh position={[-1.02, 0.78, 0]} rotation={[0, 0, -0.48]}>
        <capsuleGeometry args={[0.18, 1.26, 10, 18]} />
        <meshStandardMaterial color="#ccd6df" metalness={0.28} roughness={0.24} />
      </mesh>

      <mesh position={[1.02, 0.78, 0]} rotation={[0, 0, 0.48]}>
        <capsuleGeometry args={[0.18, 1.26, 10, 18]} />
        <meshStandardMaterial color="#8ad6b2" emissive="#1e6a53" emissiveIntensity={0.2} />
      </mesh>

      <mesh ref={orbitRef} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <torusGeometry args={[1.62, 0.06, 18, 80]} />
        <meshStandardMaterial color="#7be0b8" emissive="#225944" emissiveIntensity={0.45} />
      </mesh>

      {platePositions.map((position) => (
        <group key={position[0]} position={position}>
          <mesh>
            <cylinderGeometry args={[0.34, 0.34, 0.14, 32]} />
            <meshStandardMaterial color="#7be0b8" metalness={0.42} roughness={0.18} />
          </mesh>
          <mesh position={[0, 0, position[0] > 0 ? 0.2 : -0.2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.1, 32]} />
            <meshStandardMaterial color="#f4f7fb" metalness={0.25} roughness={0.15} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function WebHeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.15, 5.8], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#09131b"]} />
      <fog attach="fog" args={["#09131b", 6.2, 10.5]} />
      <ambientLight intensity={1.35} color="#f2f7fb" />
      <directionalLight position={[3.8, 4.4, 3.2]} intensity={2.2} color="#f7fbff" />
      <pointLight position={[-2.6, -1.8, 2]} intensity={1.2} color="#7be0b8" />
      <spotLight
        position={[0, 5.5, 3.5]}
        angle={0.36}
        penumbra={0.8}
        intensity={1.45}
        color="#ffffff"
      />
      <HeroRig />
    </Canvas>
  );
}
