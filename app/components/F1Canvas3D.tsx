"use client";

import { Suspense, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, PerformanceMonitor, Stars } from "@react-three/drei";
import { useTeam } from "@/app/context/TeamContext";
import CameraRig, { LapDriver } from "./scene/CameraRig";
import Car from "./scene/Car";
import Crowd from "./scene/Crowd";
import Track from "./scene/Track";

interface F1Canvas3DProps {
  /** Which content sector is on screen — picks the camera shot. */
  activeSectorId: string;
  /** True once the resume page fully covers the canvas; rendering stops. */
  paused: boolean;
}

function LoadingFallback() {
  const { team } = useTeam();
  return (
    <mesh position={[6, 0.4, 30]}>
      <boxGeometry args={[1.2, 0.5, 3]} />
      <meshBasicMaterial color={team.accent} wireframe />
    </mesh>
  );
}

/**
 * Scroll position is deliberately NOT a prop: it lives in a mutable store
 * (`race.scroll`) read inside the render loop, so scrolling never re-renders
 * React — only a sector change does.
 */
export default function F1Canvas3D({ activeSectorId, paused }: F1Canvas3DProps) {
  const { team } = useTeam();
  // Resolution adapts to the device: starts sharp, backs off if frames drop.
  const [maxDpr, setMaxDpr] = useState(1.5);

  return (
    <div className="w-full h-full relative bg-[var(--background)] overflow-hidden">
      <Canvas
        camera={{ position: [10, 2, 28], fov: 40, near: 0.5, far: 420 }}
        className="w-full h-full"
        dpr={[0.75, maxDpr]}
        frameloop={paused ? "never" : "always"}
        gl={{ antialias: true, alpha: false, stencil: false, powerPreference: "high-performance" }}
      >
        <PerformanceMonitor
          bounds={() => [42, 58]}
          flipflops={4}
          onChange={({ factor }) => setMaxDpr(Math.round((0.8 + 0.7 * factor) * 10) / 10)}
          onFallback={() => setMaxDpr(0.9)}
        />

        <color attach="background" args={["#030509"]} />
        <fog attach="fog" args={["#030509", 48, 165]} />

        <hemisphereLight intensity={1.15} color="#b9d4ff" groundColor="#07111d" />
        <directionalLight position={[30, 46, 22]} intensity={2.7} />
        <directionalLight position={[-28, 20, -24]} intensity={1.5} color={team.accent} />

        {/* Procedural studio reflections for the car paint — rendered once, no HDR download */}
        <Environment resolution={128} frames={1} environmentIntensity={0.85}>
          <color attach="background" args={["#04060a"]} />
          <Lightformer form="rect" intensity={5} position={[0, 8, 0]} rotation-x={Math.PI / 2} scale={[14, 4, 1]} />
          <Lightformer form="rect" intensity={2.4} position={[-9, 2.5, 3]} rotation-y={Math.PI / 2} scale={[12, 1.2, 1]} />
          <Lightformer form="rect" intensity={2.4} position={[9, 2.5, -3]} rotation-y={-Math.PI / 2} scale={[12, 1.2, 1]} />
          <Lightformer form="ring" intensity={3} position={[0, 4, -10]} scale={4} color={team.accent} />
          <Lightformer form="rect" intensity={1.6} position={[0, 3, 10]} rotation-y={Math.PI} scale={[8, 2, 1]} color="#cfe0ff" />
        </Environment>

        <Stars radius={190} depth={60} count={1400} factor={5} saturation={0} fade speed={0.3} />

        <LapDriver />
        <Track />
        <Crowd />
        <CameraRig activeSectorId={activeSectorId} />
        <Suspense fallback={<LoadingFallback />}>
          <Car key={team.id} />
        </Suspense>
      </Canvas>
    </div>
  );
}
