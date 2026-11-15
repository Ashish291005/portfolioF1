"use client";

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, useGLTF } from "@react-three/drei";
import { useTeam } from "@/app/context/TeamContext";
import * as THREE from "three";

interface F1Canvas3DProps {
  scrollProgress: number;
}

// 3D CatmullRomCurve3 forming a grand F1 circuit loop
const trackCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-15, 0, -5),
    new THREE.Vector3(-12, 0, -11),
    new THREE.Vector3(-4, 0, -14),
    new THREE.Vector3(5, 0, -13),
    new THREE.Vector3(13, 0, -9),
    new THREE.Vector3(16, 0, -2),
    new THREE.Vector3(13, 0, 5),
    new THREE.Vector3(15, 0, 10),
    new THREE.Vector3(9, 0, 14),
    new THREE.Vector3(1, 0, 13),
    new THREE.Vector3(-5, 0, 10),
    new THREE.Vector3(-11, 0, 13),
    new THREE.Vector3(-16, 0, 8),
    new THREE.Vector3(-17, 0, 2),
    new THREE.Vector3(-12, 0, -2),
  ],
  true,
  "catmullrom",
  0.32
);

function createTrackRibbonGeometry(width = 3.2, segments = 420) {
  const vertices: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const progress = i / segments;
    const point = trackCurve.getPointAt(progress);
    const tangent = trackCurve.getTangentAt(progress).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const left = point.clone().add(normal.clone().multiplyScalar(width / 2));
    const right = point.clone().add(normal.multiplyScalar(-width / 2));

    vertices.push(left.x, left.y + 0.015, left.z, right.x, right.y + 0.015, right.z);
    uvs.push(0, progress * 18, 1, progress * 18);
  }

  for (let i = 0; i < segments; i++) {
    const base = i * 2;
    indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function FinishLine() {
  const stripes = useMemo(() => {
    const progress = 0.91;
    const point = trackCurve.getPointAt(progress);
    const tangent = trackCurve.getTangentAt(progress).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const rotation = Math.atan2(tangent.x, tangent.z);

    return Array.from({ length: 10 }, (_, index) => ({
      index,
      position: point.clone().add(normal.clone().multiplyScalar((index - 4.5) * 0.32)),
      rotation,
    }));
  }, []);

  return (
    <group>
      {stripes.map((stripe) => (
        <mesh
          key={stripe.index}
          position={[stripe.position.x, stripe.position.y + 0.08, stripe.position.z]}
          rotation={[0, stripe.rotation, 0]}
        >
          <boxGeometry args={[0.3, 0.035, 1.1]} />
          <meshStandardMaterial
            color={stripe.index % 2 === 0 ? "#f7f7f2" : "#050505"}
            roughness={0.42}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

function Track3D() {
  const { team } = useTeam();

  const trackAsphaltGeo = useMemo(() => {
    return createTrackRibbonGeometry(3.05, 520);
  }, []);

  // Center glowing telemetry line
  const centerLineGeo = useMemo(() => {
    return new THREE.TubeGeometry(trackCurve, 240, 0.025, 6, true);
  }, []);

  // Inner & Outer glowing edge rails
  const innerEdgeGeo = useMemo(() => {
    // Offset path points slightly inward
    const points = trackCurve.getPoints(200);
    const innerPoints = points.map((pt, i) => {
      const tangent = trackCurve.getTangentAt(i / 200);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      return pt.clone().add(normal.multiplyScalar(1.58));
    });
    const innerCurve = new THREE.CatmullRomCurve3(innerPoints, true);
    return new THREE.TubeGeometry(innerCurve, 240, 0.045, 6, true);
  }, []);

  const outerEdgeGeo = useMemo(() => {
    const points = trackCurve.getPoints(200);
    const outerPoints = points.map((pt, i) => {
      const tangent = trackCurve.getTangentAt(i / 200);
      const normal = new THREE.Vector3(tangent.z, 0, -tangent.x).normalize();
      return pt.clone().add(normal.multiplyScalar(1.58));
    });
    const outerCurve = new THREE.CatmullRomCurve3(outerPoints, true);
    return new THREE.TubeGeometry(outerCurve, 240, 0.045, 6, true);
  }, []);

  const curbs = useMemo(
    () => Array.from({ length: 96 }, (_, index) => {
      const progress = index / 96;
      const point = trackCurve.getPointAt(progress);
      const tangent = trackCurve.getTangentAt(progress);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      return {
        index,
        rotation: Math.atan2(tangent.z, tangent.x),
        inner: point.clone().add(normal.clone().multiplyScalar(1.77)).add(new THREE.Vector3(0, 0.06, 0)),
        outer: point.clone().add(normal.multiplyScalar(-1.77)).add(new THREE.Vector3(0, 0.06, 0)),
      };
    }),
    []
  );

  return (
    <group>
      <mesh geometry={trackAsphaltGeo}>
        <meshStandardMaterial
          color="#11151b"
          roughness={0.74}
          metalness={0.28}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={centerLineGeo}>
        <meshBasicMaterial color="#f0f2f5" />
      </mesh>
      <mesh geometry={innerEdgeGeo}>
        <meshBasicMaterial color={team.accent} />
      </mesh>
      <mesh geometry={outerEdgeGeo}>
        <meshBasicMaterial color="#e8edf2" />
      </mesh>
      {curbs.map((curb) => [curb.inner, curb.outer].map((position, side) => (
        <mesh key={`${curb.index}-${side}`} position={position} rotation={[0, -curb.rotation, 0]}>
          <boxGeometry args={[0.7, 0.08, 0.28]} />
          <meshStandardMaterial color={curb.index % 2 === 0 ? team.accent : "#f4f4f2"} roughness={0.45} metalness={0.18} />
        </mesh>
      )))}
      <FinishLine />
      <mesh position={[0, -1.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[26, 96]} />
        <meshStandardMaterial color="#05070b" roughness={0.88} metalness={0.1} />
      </mesh>
      <gridHelper args={[44, 44, "#1b2530", "#0e141c"]} position={[0, -1.01, 0]} />
    </group>
  );
}

function CameraRig({ scrollProgress }: { scrollProgress: number }) {
  const focusRef = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const clampedProgress = Math.max(0, Math.min(0.999, scrollProgress));
    const point = trackCurve.getPointAt(clampedProgress);
    const tangent = trackCurve.getTangentAt(clampedProgress).normalize();
    const before = trackCurve.getTangentAt(Math.max(0, clampedProgress - 0.012));
    const after = trackCurve.getTangentAt(Math.min(0.999, clampedProgress + 0.012));
    const turn = Math.max(-1, Math.min(1, before.cross(after).y * 18));
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    const drift = Math.sin(state.clock.elapsedTime * 0.42) * 0.35;
    const cameraTarget = point.clone()
      .add(tangent.clone().multiplyScalar(-8.2))
      .add(side.multiplyScalar(2.2 + turn * 2.2 + drift))
      .add(new THREE.Vector3(0, 5.1 + Math.abs(turn) * 1.2, 0));
    const lookTarget = point.clone().add(tangent.multiplyScalar(3.7)).add(new THREE.Vector3(0, 0.45, 0));
    const cameraLerp = 1 - Math.exp(-delta * 1.8);
    const focusLerp = 1 - Math.exp(-delta * 2.6);

    state.camera.position.lerp(cameraTarget, cameraLerp);
    focusRef.current.lerp(lookTarget, focusLerp);
    state.camera.lookAt(focusRef.current);
  });

  return null;
}

function CarModel({ scrollProgress }: { scrollProgress: number }) {
  const { scene } = useGLTF("/models/f1_car.glb");
  const { team } = useTeam();
  const carRef = useRef<THREE.Group>(null);
  const carScene = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const materials = Array.isArray(child.material) ? child.material : [child.material];
      const isLiveryPart = /wing|spoiler|stripe|accent/i.test(
        `${child.name} ${materials.map((material) => material.name).join(" ")}`
      );

      if (isLiveryPart) {
        child.material = materials.map((material) => {
          const liveryMaterial = material.clone();
          if ("color" in liveryMaterial && liveryMaterial.color instanceof THREE.Color) {
            liveryMaterial.color.set(team.carColor);
          }
          if ("emissive" in liveryMaterial && liveryMaterial.emissive instanceof THREE.Color) {
            liveryMaterial.emissive.set(team.accent);
          }
          if ("emissiveIntensity" in liveryMaterial) {
            liveryMaterial.emissiveIntensity = 0.04;
          }
          return liveryMaterial;
        });
      }

      child.castShadow = true;
      child.receiveShadow = true;
    });
    return cloned;
  }, [scene, team.accent, team.carColor]);

  useFrame(() => {
    if (!carRef.current) return;

    const clampedProgress = Math.max(0, Math.min(0.999, scrollProgress));
    const point = trackCurve.getPointAt(clampedProgress);
    const tangent = trackCurve.getTangentAt(clampedProgress);

    carRef.current.position.copy(point).add(new THREE.Vector3(0, 0.07, 0));
    const lookTarget = point.clone().add(tangent);
    carRef.current.lookAt(lookTarget);
  });

  return (
    <group ref={carRef}>
      <pointLight position={[0, 0.28, -0.8]} intensity={5} distance={2.4} decay={2} color={team.accent} />
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.76, 0.32, 1]}>
        <circleGeometry args={[1, 28]} />
        <meshBasicMaterial color={team.accent} transparent opacity={0.14} />
      </mesh>
      <primitive object={carScene} scale={0.72} />
    </group>
  );
}

useGLTF.preload("/models/f1_car.glb");

function LoadingFallback() {
  const { team } = useTeam();
  return (
    <mesh position={[0, 0.2, 0]}>
      <boxGeometry args={[2, 0.5, 1]} />
      <meshStandardMaterial color={team.accent} wireframe />
    </mesh>
  );
}

export default function F1Canvas3D({ scrollProgress }: F1Canvas3DProps) {
  const { team } = useTeam();

  return (
    <div className="w-full h-full relative flex flex-col items-center justify-center bg-[var(--background)] overflow-hidden">
      <Canvas
        camera={{ position: [0, 7, 15], fov: 43 }}
        className="w-full h-full"
        dpr={[1, 1.5]}
        shadows
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#030509"]} />
        <fog attach="fog" args={["#030509", 17, 42]} />
        <ambientLight intensity={1.1} />
        <hemisphereLight intensity={1.4} color="#b9d4ff" groundColor="#07111d" />
        <directionalLight position={[12, 18, 10]} intensity={3.6} castShadow />
        <directionalLight
          position={[-12, 10, -10]}
          intensity={2.4}
          color={team.accent}
        />
        <pointLight position={[0, 8, 0]} intensity={45} distance={22} decay={2} color="#dbe8ff" />
        <pointLight position={[-10, 4, -4]} intensity={24} distance={15} decay={2} color={team.accent} />
        <Stars radius={70} depth={42} count={1800} factor={3} saturation={0} fade speed={0.35} />
        <Track3D />
        <CameraRig scrollProgress={scrollProgress} />
        <Suspense fallback={<LoadingFallback />}>
          <CarModel scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
