"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useTeam } from "@/app/context/TeamContext";
import {
  GRID_T,
  HALF_TRACK,
  SAMPLES,
  TRACK_LENGTH,
  WALL_OFFSET,
  sampleCurvature,
  sampleIndex,
  sampleNor,
  samplePos,
  sampleTan,
} from "./circuit";

const STEP = 2; // sample stride for loop geometry (600 segments)

/** Flat ribbon following the whole lap between two lateral offsets (a > b). */
function loopRibbon(offsetA: number, offsetB: number, y: number, uvRepeat = 1) {
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const segments = SAMPLES / STEP;

  for (let s = 0; s <= segments; s++) {
    const i = (s * STEP) % SAMPLES;
    const p = samplePos[i];
    const n = sampleNor[i];
    positions.push(p.x + n.x * offsetA, y, p.z + n.z * offsetA, p.x + n.x * offsetB, y, p.z + n.z * offsetB);
    normals.push(0, 1, 0, 0, 1, 0);
    const v = (s / segments) * uvRepeat;
    uvs.push(0, v, 1, v);
  }
  for (let s = 0; s < segments; s++) {
    const b = s * 2;
    indices.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  return geometry;
}

/** Vertical wall following the whole lap at a lateral offset. */
function loopWall(offset: number, height: number) {
  const positions: number[] = [];
  const indices: number[] = [];
  const segments = SAMPLES / STEP;

  for (let s = 0; s <= segments; s++) {
    const i = (s * STEP) % SAMPLES;
    const p = samplePos[i];
    const n = sampleNor[i];
    const x = p.x + n.x * offset;
    const z = p.z + n.z * offset;
    positions.push(x, 0, z, x, height, z);
  }
  for (let s = 0; s < segments; s++) {
    const b = s * 2;
    indices.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

class QuadBatch {
  positions: number[] = [];
  uvs: number[] = [];
  indices: number[] = [];

  /** Flat quad from four corners given in the order a(left,back) b(right,back) c(left,front) d(right,front). */
  add(a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3, d: THREE.Vector3, y: number) {
    const base = this.positions.length / 3;
    this.positions.push(a.x, y, a.z, b.x, y, b.z, c.x, y, c.z, d.x, y, d.z);
    this.uvs.push(0, 0, 1, 0, 0, 1, 1, 1);
    this.indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
  }

  build() {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(this.positions, 3));
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(this.uvs, 2));
    geometry.setIndex(this.indices);
    geometry.computeVertexNormals();
    return geometry;
  }
}

const offsetPoint = (i: number, lateral: number) =>
  samplePos[i].clone().addScaledVector(sampleNor[i], lateral);

/** Striped kerbs, only where the track is actually cornering. */
function buildKerbs() {
  const accent = new QuadBatch();
  const white = new QuadBatch();
  const stripe = 6; // samples per stripe (~1.3 units)
  const inner = HALF_TRACK - 0.05;
  const outer = HALF_TRACK + 0.95;

  for (let i = 0; i < SAMPLES; i += stripe) {
    const j = (i + stripe) % SAMPLES;
    const curvature = sampleCurvature[(i + stripe / 2) % SAMPLES];
    if (Math.abs(curvature) < 0.022) continue;
    const batch = (i / stripe) % 2 === 0 ? accent : white;
    // left side, then right side
    batch.add(offsetPoint(i, outer), offsetPoint(i, inner), offsetPoint(j, outer), offsetPoint(j, inner), 0.05);
    batch.add(offsetPoint(i, -inner), offsetPoint(i, -outer), offsetPoint(j, -inner), offsetPoint(j, -outer), 0.05);
  }
  return { accent: accent.build(), white: white.build() };
}

/** Painted grid boxes behind the start line. */
function buildGridSlots() {
  const batch = new QuadBatch();
  const mark = (t: number, lateral: number) => {
    const i = sampleIndex(t);
    const tan = sampleTan[i];
    const nor = sampleNor[i];
    const centre = samplePos[i].clone().addScaledVector(nor, lateral).addScaledVector(tan, 1.95);
    const corner = (along: number, side: number) =>
      centre.clone().addScaledVector(tan, along).addScaledVector(nor, side);
    // front bar
    batch.add(corner(-0.08, 0.95), corner(-0.08, -0.95), corner(0.08, 0.95), corner(0.08, -0.95), 0.04);
    // side ticks
    batch.add(corner(-1.1, 0.95), corner(-1.1, 0.83), corner(-0.08, 0.95), corner(-0.08, 0.83), 0.04);
    batch.add(corner(-1.1, -0.83), corner(-1.1, -0.95), corner(-0.08, -0.83), corner(-0.08, -0.95), 0.04);
  };
  mark(GRID_T, 0);
  for (let k = 1; k <= 7; k++) {
    mark(GRID_T - k * 0.017, k % 2 === 0 ? 1.45 : -1.45);
  }
  return batch.build();
}

function buildStartLine() {
  const batch = new QuadBatch();
  const i = 0;
  const tan = sampleTan[i];
  const nor = sampleNor[i];
  const corner = (along: number, side: number) =>
    samplePos[i].clone().addScaledVector(tan, along).addScaledVector(nor, side);
  batch.add(corner(-0.5, HALF_TRACK), corner(-0.5, -HALF_TRACK), corner(0.5, HALF_TRACK), corner(0.5, -HALF_TRACK), 0.045);
  return batch.build();
}

function makeAsphaltTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#1a1f27";
  ctx.fillRect(0, 0, size, size);
  // aggregate speckle
  for (let n = 0; n < 5200; n++) {
    const shade = 18 + Math.random() * 34;
    ctx.fillStyle = `rgba(${shade + 6}, ${shade + 10}, ${shade + 16}, ${0.25 + Math.random() * 0.4})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random(), 1 + Math.random());
  }
  // rubbered-in racing groove down the middle
  const groove = ctx.createLinearGradient(0, 0, size, 0);
  groove.addColorStop(0.0, "rgba(0,0,0,0)");
  groove.addColorStop(0.3, "rgba(0,0,0,0.05)");
  groove.addColorStop(0.5, "rgba(0,0,0,0.42)");
  groove.addColorStop(0.7, "rgba(0,0,0,0.05)");
  groove.addColorStop(1.0, "rgba(0,0,0,0)");
  ctx.fillStyle = groove;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function makeChequerTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 14;
  canvas.height = 2;
  const ctx = canvas.getContext("2d")!;
  for (let x = 0; x < 14; x++) {
    for (let y = 0; y < 2; y++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#f4f4f0" : "#07080a";
      ctx.fillRect(x, y, 1, 1);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter;
  texture.minFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Start gantry with the five red lights. */
function StartGantry({ accent }: { accent: string }) {
  const { position, rotationY } = useMemo(() => {
    const tan = sampleTan[0];
    return { position: samplePos[0], rotationY: Math.atan2(tan.x, tan.z) };
  }, []);
  const span = WALL_OFFSET * 2 + 0.6;

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * span) / 2, 2.6, 0]}>
          <boxGeometry args={[0.28, 5.2, 0.28]} />
          <meshStandardMaterial color="#141a22" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 5.05, 0]}>
        <boxGeometry args={[span + 0.28, 0.5, 0.42]} />
        <meshStandardMaterial color="#10151c" roughness={0.45} metalness={0.75} />
      </mesh>
      <mesh position={[0, 5.36, 0]}>
        <boxGeometry args={[span + 0.28, 0.08, 0.46]} />
        <meshBasicMaterial color={accent} toneMapped={false} />
      </mesh>
      {[-2, -1, 0, 1, 2].map((slot) => (
        <group key={slot} position={[slot * 0.72, 4.45, -0.02]}>
          <mesh>
            <boxGeometry args={[0.5, 0.78, 0.2]} />
            <meshStandardMaterial color="#07090c" roughness={0.6} />
          </mesh>
          {[0.18, -0.18].map((y) => (
            <mesh key={y} position={[0, y, -0.11]}>
              <circleGeometry args={[0.13, 16]} />
              <meshBasicMaterial color="#ff2a1f" toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Track() {
  const { team } = useTeam();

  const geo = useMemo(() => {
    const kerbs = buildKerbs();
    return {
      asphalt: loopRibbon(HALF_TRACK, -HALF_TRACK, 0.02, Math.round(TRACK_LENGTH / 9)),
      vergeLeft: loopRibbon(WALL_OFFSET, HALF_TRACK - 0.02, 0.008),
      vergeRight: loopRibbon(-HALF_TRACK + 0.02, -WALL_OFFSET, 0.008),
      lineLeft: loopRibbon(HALF_TRACK - 0.18, HALF_TRACK - 0.36, 0.036),
      lineRight: loopRibbon(-HALF_TRACK + 0.36, -HALF_TRACK + 0.18, 0.036),
      wallLeft: loopWall(WALL_OFFSET, 0.62),
      wallRight: loopWall(-WALL_OFFSET, 0.62),
      capLeft: loopRibbon(WALL_OFFSET + 0.09, WALL_OFFSET - 0.09, 0.63),
      capRight: loopRibbon(-WALL_OFFSET + 0.09, -WALL_OFFSET - 0.09, 0.63),
      kerbAccent: kerbs.accent,
      kerbWhite: kerbs.white,
      grid: buildGridSlots(),
      startLine: buildStartLine(),
    };
  }, []);

  const asphaltMap = useMemo(() => makeAsphaltTexture(), []);
  const chequerMap = useMemo(() => makeChequerTexture(), []);

  return (
    <group>
      {/* ground */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[150, 48]} />
        <meshStandardMaterial color="#05080c" roughness={0.95} metalness={0} />
      </mesh>
      <gridHelper args={[280, 70, "#16202b", "#0b1118"]} position={[0, 0, 0]} />

      {/* run-off */}
      <mesh geometry={geo.vergeLeft}>
        <meshStandardMaterial color="#0c1219" roughness={0.9} />
      </mesh>
      <mesh geometry={geo.vergeRight}>
        <meshStandardMaterial color="#0c1219" roughness={0.9} />
      </mesh>

      {/* asphalt + paint */}
      <mesh geometry={geo.asphalt}>
        <meshStandardMaterial map={asphaltMap} color="#aab4c2" roughness={0.78} metalness={0.12} />
      </mesh>
      <mesh geometry={geo.lineLeft}>
        <meshBasicMaterial color="#e9eef3" />
      </mesh>
      <mesh geometry={geo.lineRight}>
        <meshBasicMaterial color="#e9eef3" />
      </mesh>
      <mesh geometry={geo.grid}>
        <meshBasicMaterial color="#e9eef3" />
      </mesh>
      <mesh geometry={geo.startLine}>
        <meshBasicMaterial map={chequerMap} />
      </mesh>

      {/* kerbs */}
      <mesh geometry={geo.kerbAccent}>
        <meshStandardMaterial color={team.accent} roughness={0.5} emissive={team.accent} emissiveIntensity={0.25} />
      </mesh>
      <mesh geometry={geo.kerbWhite}>
        <meshStandardMaterial color="#eef0ee" roughness={0.55} />
      </mesh>

      {/* barriers with a lit cap rail */}
      <mesh geometry={geo.wallLeft}>
        <meshStandardMaterial color="#19212b" roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo.wallRight}>
        <meshStandardMaterial color="#19212b" roughness={0.7} metalness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={geo.capLeft}>
        <meshBasicMaterial color={team.accent} toneMapped={false} />
      </mesh>
      <mesh geometry={geo.capRight}>
        <meshBasicMaterial color="#dfe6ee" />
      </mesh>

      <StartGantry accent={team.accent} />
    </group>
  );
}
