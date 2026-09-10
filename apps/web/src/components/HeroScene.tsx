import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";

// Cores da marca. As placas usam o roxo do logo; a barra fica clara para
// repetir o contraste da arte (roxo e branco sobre preto).
const PLATE = "#7a35e0";
const PLATE_RIM = "#9649f3";
const COLLAR = "#5b21b6";
const BAR = "#e9e4f3";

// Meia-largura do halter em unidades de mundo, usada para caber na viewport.
const HALF_WIDTH = 2.2;

/** Uma anilha: disco roxo com um aro mais claro, como no logo. */
function Plate({
  x,
  radius,
  depth
}: {
  x: number;
  radius: number;
  depth: number;
}) {
  return (
    <group position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, depth, 48]} />
        <meshStandardMaterial color={PLATE} metalness={0.34} roughness={0.38} />
      </mesh>
      {/* Aro: o contorno claro que a arte tem em volta de cada disco. */}
      <mesh>
        <torusGeometry args={[radius, depth * 0.16, 12, 64]} />
        <meshStandardMaterial
          color={PLATE_RIM}
          metalness={0.5}
          roughness={0.26}
        />
      </mesh>
    </group>
  );
}

/** Luva que prende as anilhas na barra. */
function Collar({
  x,
  radius,
  depth
}: {
  x: number;
  radius: number;
  depth: number;
}) {
  return (
    <mesh position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[radius, radius, depth, 28]} />
      <meshStandardMaterial color={COLLAR} metalness={0.6} roughness={0.3} />
    </mesh>
  );
}

function Dumbbell() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (!groupRef.current) return;
    // Giro lento e continuo: mostra que e 3D sem virar carrossel.
    groupRef.current.rotation.y = t * 0.32;
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.06;
    groupRef.current.position.y = Math.sin(t * 0.9) * 0.07;
  });

  // As anilhas espelham nos dois lados, do maior disco para o menor.
  const plates = [
    { offset: 1.16, radius: 0.82, depth: 0.22 },
    { offset: 1.43, radius: 0.67, depth: 0.2 },
    { offset: 1.66, radius: 0.51, depth: 0.18 }
  ];

  return (
    <group ref={groupRef} rotation={[0, 0, -0.13]}>
      {/* Barra */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 4.4, 24]} />
        <meshStandardMaterial color={BAR} metalness={0.86} roughness={0.22} />
      </mesh>
      {/* Pega central, levemente mais grossa */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.115, 0.115, 1.5, 24]} />
        <meshStandardMaterial color={BAR} metalness={0.78} roughness={0.34} />
      </mesh>

      {[-1, 1].map((side) => (
        <group key={side}>
          <Collar x={side * 0.95} radius={0.17} depth={0.16} />
          {plates.map((p) => (
            <Plate
              key={p.offset}
              x={side * p.offset}
              radius={p.radius}
              depth={p.depth}
            />
          ))}
          <Collar x={side * 1.85} radius={0.16} depth={0.16} />
          {/* Ponta da barra */}
          <mesh position={[side * 2.05, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.13, 0.13, 0.24, 24]} />
            <meshStandardMaterial
              color={BAR}
              metalness={0.86}
              roughness={0.24}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/**
 * Reduz a cena quando o palco e estreito. Sem isso o halter, que e largo,
 * sai cortado nas laterais em telas pequenas.
 */
function FitToViewport({ children }: { children: React.ReactNode }) {
  const { viewport } = useThree();
  const scale = Math.min(1, (viewport.width * 0.9) / (HALF_WIDTH * 2));
  return <group scale={scale}>{children}</group>;
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0.2, 5.2], fov: 34 }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.9} color="#f5f2fa" />
      {/* Luz principal, branca, vinda de cima e da frente. */}
      <directionalLight
        position={[3.4, 4.2, 4.2]}
        intensity={2.4}
        color="#ffffff"
      />
      {/* Contraluz roxa: separa o halter do fundo preto. */}
      <pointLight position={[-3.2, -1.4, -2]} intensity={2.6} color="#9649f3" />
      <pointLight position={[2.6, 1.2, -2.4]} intensity={1.4} color="#ac6ef7" />
      <FitToViewport>
        <Dumbbell />
      </FitToViewport>
    </Canvas>
  );
}
