"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useTeam } from "@/app/context/TeamContext";
import { TRACK_LENGTH, curvatureAt, race } from "./circuit";

/**
 * Cars: "2026 Redbull RB22", "2026 Ferrari SF-26" and "2026 Mercedes W17" by
 * Dave Love (sketchfab.com/Tyler_Dave), CC-BY-4.0. Which one loads comes from
 * the selected team (`team.carModel`); only that car is downloaded.
 * Each scene.web.gltf is the original model pointing at web-sized textures
 * (public/modelN/textures_web); the original files are untouched.
 */

/** Model is authored in metres (≈5.4 long); this is its size on our circuit. */
export const CAR_SCALE = 0.6;
const WHEELBASE = 3.4 * CAR_SCALE;

// In the model's own space: x = across the car, y = along it (nose at +y),
// z = down. Wheels spin about x and steer about z.
const SPIN_AXIS = new THREE.Vector3(1, 0, 0);
const STEER_AXIS = new THREE.Vector3(0, 0, -1);
const WHEEL_MATERIALS = /sidewall|wheel_hub|discs|tyre|tread/i;
const TYRE_MATERIALS = /sidewall|tyre|tread/i;

interface Wheel {
  group: THREE.Group;
  front: boolean;
  radius: number;
}

/** Splits a geometry into four pieces around (midX, midY): rear-left, rear-right, front-left, front-right. */
function splitIntoCorners(source: THREE.BufferGeometry, midX: number, midY: number) {
  const geometry = source.index ? source.toNonIndexed() : source;
  const position = geometry.attributes.position;
  const buckets: number[][] = [[], [], [], []];

  for (let tri = 0; tri < position.count / 3; tri++) {
    const a = tri * 3;
    const x = (position.getX(a) + position.getX(a + 1) + position.getX(a + 2)) / 3;
    const y = (position.getY(a) + position.getY(a + 1) + position.getY(a + 2)) / 3;
    buckets[(x >= midX ? 1 : 0) + (y >= midY ? 2 : 0)].push(tri);
  }

  return buckets.map((tris) => {
    const piece = new THREE.BufferGeometry();
    for (const name of Object.keys(geometry.attributes)) {
      const attribute = geometry.attributes[name] as THREE.BufferAttribute;
      const size = attribute.itemSize;
      const from = attribute.array;
      const Ctor = from.constructor as new (length: number) => typeof from;
      const to = new Ctor(tris.length * 3 * size);
      tris.forEach((tri, i) => {
        for (let k = 0; k < 3 * size; k++) to[i * 3 * size + k] = from[tri * 3 * size + k];
      });
      piece.setAttribute(name, new THREE.BufferAttribute(to, size, attribute.normalized));
    }
    return piece;
  });
}

/**
 * The model ships all four wheels fused into shared meshes, so they cannot
 * turn. This cuts the wheel meshes into one group per corner, each pivoting
 * on its own axle.
 */
function rigWheels(root: THREE.Object3D): Wheel[] {
  const wheelMeshes: THREE.Mesh[] = [];
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    if (WHEEL_MATERIALS.test(mesh.material.name)) wheelMeshes.push(mesh);
  });
  if (wheelMeshes.length === 0) return [];

  const parent = wheelMeshes[0].parent!;
  const identity = new THREE.Matrix4();
  if (wheelMeshes.some((mesh) => mesh.parent !== parent || !mesh.matrix.equals(identity))) return [];

  // The axles are not always symmetric about the model origin, so split
  // around the middle of the tyres themselves.
  const allTyres = new THREE.Box3();
  for (const mesh of wheelMeshes) {
    if (!TYRE_MATERIALS.test((mesh.material as THREE.Material).name)) continue;
    mesh.geometry.computeBoundingBox();
    allTyres.union(mesh.geometry.boundingBox!);
  }
  if (allTyres.isEmpty()) return [];
  const mid = allTyres.getCenter(new THREE.Vector3());

  const pieces = wheelMeshes.map((mesh) => ({ mesh, corners: splitIntoCorners(mesh.geometry, mid.x, mid.y) }));
  const wheels: Wheel[] = [];
  const tyreBox = new THREE.Box3();
  const centre = new THREE.Vector3();
  const extent = new THREE.Vector3();

  for (let corner = 0; corner < 4; corner++) {
    // the tyre defines the axle: centre of its bounds
    tyreBox.makeEmpty();
    for (const { mesh, corners } of pieces) {
      if (!TYRE_MATERIALS.test((mesh.material as THREE.Material).name)) continue;
      corners[corner].computeBoundingBox();
      if (!corners[corner].boundingBox!.isEmpty()) tyreBox.union(corners[corner].boundingBox!);
    }
    if (tyreBox.isEmpty()) return [];
    tyreBox.getCenter(centre);
    tyreBox.getSize(extent);

    const group = new THREE.Group();
    group.name = `wheel_${corner}`;
    group.position.copy(centre);
    for (const { mesh, corners } of pieces) {
      const geometry = corners[corner];
      if (geometry.attributes.position.count === 0) continue;
      geometry.translate(-centre.x, -centre.y, -centre.z);
      geometry.computeBoundingSphere();
      group.add(new THREE.Mesh(geometry, mesh.material));
    }
    parent.add(group);
    wheels.push({ group, front: centre.y > mid.y, radius: Math.max(extent.y, extent.z) / 2 });
  }

  wheelMeshes.forEach((mesh) => mesh.removeFromParent());
  return wheels;
}

function makeShadowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  // white with an alpha falloff, so one texture serves both the black
  // shadow and the additive team-colour glow
  gradient.addColorStop(0, "rgba(255,255,255,0.85)");
  gradient.addColorStop(0.55, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

export default function Car() {
  const { team } = useTeam();
  const { scene } = useGLTF(team.carModel);
  const carRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const motion = useRef({
    spin: 0,
    steer: 0,
    roll: 0,
    pitch: 0,
    lastVelocity: 0,
    spinQ: new THREE.Quaternion(),
    steerQ: new THREE.Quaternion(),
  });

  const car = useMemo(() => {
    const root = scene.clone(true);
    root.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        const standard = material as THREE.MeshStandardMaterial;
        if (standard.envMapIntensity !== undefined) standard.envMapIntensity = 1.3;
        // glowing tail / rain light
        if (/rear_light/i.test(material.name) && standard.emissive) {
          standard.emissive.set("#ff1e14");
          standard.emissiveMap = standard.map;
          standard.emissiveIntensity = 2.6;
        }
      });
    });
    return { root, wheels: rigWheels(root) };
  }, [scene]);

  const shadowMap = useMemo(() => makeShadowTexture(), []);

  useFrame((_, rawDelta) => {
    const group = carRef.current;
    const body = bodyRef.current;
    if (!group || !body) return;
    const delta = Math.min(rawDelta, 0.05);
    const m = motion.current;

    group.position.copy(race.position);
    group.rotation.y = Math.atan2(race.tangent.x, race.tangent.z);

    const velocity = race.speed * TRACK_LENGTH; // units / second
    const curvature = curvatureAt(race.t);

    const steerTarget = THREE.MathUtils.clamp(Math.atan(WHEELBASE * curvature) * 2.2, -0.42, 0.42);
    m.steer += (steerTarget - m.steer) * (1 - Math.exp(-delta * 9));

    // lean out of the corner in proportion to lateral load…
    const rollTarget = THREE.MathUtils.clamp(curvature * velocity * 0.035, -0.055, 0.055);
    m.roll += (rollTarget - m.roll) * (1 - Math.exp(-delta * 6));
    // …and squat under acceleration / dive under braking
    const acceleration = delta > 0 ? (velocity - m.lastVelocity) / delta : 0;
    m.lastVelocity = velocity;
    const pitchTarget = THREE.MathUtils.clamp(-acceleration * 0.0009, -0.022, 0.022);
    m.pitch += (pitchTarget - m.pitch) * (1 - Math.exp(-delta * 5));
    body.rotation.z = m.roll;
    body.rotation.x = m.pitch;

    m.steerQ.setFromAxisAngle(STEER_AXIS, m.steer);
    for (const wheel of car.wheels) {
      // each wheel turns by distance / its own radius (rears are larger)
      m.spinQ.setFromAxisAngle(SPIN_AXIS, m.spin / wheel.radius);
      if (wheel.front) wheel.group.quaternion.multiplyQuaternions(m.steerQ, m.spinQ);
      else wheel.group.quaternion.copy(m.spinQ);
    }
    // distance covered, in model units
    m.spin += (velocity * delta) / CAR_SCALE;
  });

  return (
    <group ref={carRef}>
      {/* soft contact shadow — far cheaper than a real shadow map */}
      <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[2.3, 4.6, 1]} renderOrder={1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={shadowMap} color="#000000" transparent depthWrite={false} opacity={0.9} />
      </mesh>
      {/* livery under-glow */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.4, 5.8, 1]} renderOrder={2}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={shadowMap}
          color={team.accent}
          transparent
          depthWrite={false}
          opacity={0.22}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <pointLight position={[0, 1.1, 0.4]} intensity={7} distance={7} decay={2} color={team.accent} />
      <group ref={bodyRef}>
        <primitive object={car.root} scale={CAR_SCALE} />
      </group>
    </group>
  );
}
