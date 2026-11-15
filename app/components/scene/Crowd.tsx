"use client";

import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { useTeam } from "@/app/context/TeamContext";
import {
  SAMPLES,
  STANDS,
  STAND_ROW_DEPTH,
  STAND_ROW_RISE,
  WALL_OFFSET,
  race,
  sampleCurvature,
  sampleNor,
  samplePos,
  sampleTan,
  type StandSpec,
} from "./circuit";

/* Deterministic PRNG so the crowd is identical on every load. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FAN_COLORS = ["#f2f2ee", "#d8322f", "#f2c230", "#2b3a55", "#e8762c", "#8d99a8", "#1f8a5b", "#101418"];

/** Basis matrix for a stand: local x = along the track, y = up, z = away from it. */
function standBasis(stand: StandSpec) {
  return new THREE.Matrix4().makeBasis(stand.along, new THREE.Vector3(0, 1, 0), stand.out).setPosition(stand.origin);
}

function buildLayout() {
  const random = mulberry32(20260);
  const tiers: THREE.Matrix4[] = [];
  const roofs: THREE.Matrix4[] = [];
  const fascias: THREE.Matrix4[] = [];
  const poles: THREE.Matrix4[] = [];
  const lamps: THREE.Matrix4[] = [];
  const people: THREE.Matrix4[] = [];
  const peopleSeed: number[] = [];
  const flashes: number[] = [];

  const local = new THREE.Matrix4();
  const scale = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const euler = new THREE.Euler();

  for (const stand of STANDS) {
    const basis = standBasis(stand);
    const place = (x: number, y: number, z: number, sx: number, sy: number, sz: number, rx = 0, ry = 0) => {
      quat.setFromEuler(euler.set(rx, ry, 0));
      local.compose(pos.set(x, y, z), quat, scale.set(sx, sy, sz));
      return new THREE.Matrix4().multiplyMatrices(basis, local);
    };

    const depth = stand.rows * STAND_ROW_DEPTH;
    const topY = stand.rows * STAND_ROW_RISE;

    // stepped terraces
    for (let r = 0; r < stand.rows; r++) {
      const h = STAND_ROW_RISE * (r + 1);
      tiers.push(place(0, h / 2, r * STAND_ROW_DEPTH + STAND_ROW_DEPTH / 2, stand.width, h, STAND_ROW_DEPTH));
    }
    // back wall + cantilever roof
    tiers.push(place(0, (topY + 2.9) / 2, depth + 0.12, stand.width, topY + 2.9, 0.24));
    roofs.push(place(0, topY + 2.75, depth * 0.52, stand.width + 0.8, 0.14, depth * 1.02, -0.11));
    // lit fascia along the front edge and the roof lip
    fascias.push(place(0, 0.3, -0.03, stand.width, 0.6, 0.06));
    fascias.push(place(0, topY + 2.2, 0.02, stand.width + 0.8, 0.12, 0.1));

    // floodlight masts at both ends
    for (const end of [-1, 1]) {
      const x = end * (stand.width / 2 + 0.9);
      poles.push(place(x, 5.2, depth + 0.4, 0.2, 10.4, 0.2));
      lamps.push(place(x, 10.5, depth + 0.1, 1.5, 0.7, 0.22, 0.5));
    }

    // spectators
    for (let r = 0; r < stand.rows; r++) {
      const seatY = STAND_ROW_RISE * (r + 1);
      const seatZ = r * STAND_ROW_DEPTH + STAND_ROW_DEPTH * 0.55;
      for (let x = -stand.width / 2 + 0.4; x <= stand.width / 2 - 0.4; x += 0.6) {
        if (random() < 0.1) continue; // a few empty seats
        const size = 0.88 + random() * 0.26;
        people.push(
          place(
            x + (random() - 0.5) * 0.16,
            seatY,
            seatZ + (random() - 0.5) * 0.14,
            size,
            size,
            size,
            0,
            Math.PI + (random() - 0.5) * 0.5 // face the track
          )
        );
        peopleSeed.push(random());
        if (random() < 0.05) {
          const flash = new THREE.Vector3(x, seatY + 0.75, seatZ).applyMatrix4(basis);
          flashes.push(flash.x, flash.y, flash.z);
        }
      }
    }
  }

  // Standing fans packed along the fence all the way round the lap, so there
  // is a crowd in shot from every camera angle, not only near the stands.
  const up = new THREE.Vector3(0, 1, 0);
  const facing = new THREE.Matrix4();
  for (const side of [1, -1]) {
    for (let i = 0; i < SAMPLES; i += 3) {
      // the inside of a corner is squeezed, so thin the crowd out there
      const inside = sampleCurvature[i] * side > 0.03;
      // clumps and gaps rather than an even picket line
      const density = 0.45 + 0.4 * Math.sin(i * 0.021 + side) * Math.sin(i * 0.0047 + 2 * side);
      for (let row = 0; row < (inside ? 1 : 3); row++) {
        if (random() > density) continue;
        const out = sampleNor[i].clone().multiplyScalar(side);
        const along = up.clone().cross(out);
        const size = 0.9 + random() * 0.25;
        pos.copy(samplePos[i])
          .addScaledVector(out, WALL_OFFSET + 0.45 + row * 0.5 + random() * 0.15)
          .addScaledVector(sampleTan[i], (random() - 0.5) * 0.5);
        pos.y = 0.32 * size + row * 0.16; // feet on the ground; back rows on a low bank
        // local +z faces the track
        facing.makeBasis(along.clone().negate(), up, out.clone().negate());
        quat.setFromRotationMatrix(facing);
        people.push(new THREE.Matrix4().compose(pos, quat, scale.set(size, size, size)));
        peopleSeed.push(random());
      }
    }
  }

  return { tiers, roofs, fascias, poles, lamps, people, peopleSeed, flashes };
}

/**
 * One low-poly spectator, facing +z, origin at the hips.
 * Every vertex is tagged so the shader can dress the fan:
 *   aPart 0 = shirt, 1 = skin, 2 = hair / cap, 3 = trousers
 *   aArm  ±1 on the two arms (they swing from the shoulder), 0 elsewhere
 */
function makePersonGeometry() {
  const tag = (geometry: THREE.BufferGeometry, part: number | ((y: number) => number), arm = 0) => {
    const count = geometry.attributes.position.count;
    const parts = new Float32Array(count);
    const arms = new Float32Array(count).fill(arm);
    for (let i = 0; i < count; i++) {
      parts[i] = typeof part === "number" ? part : part(geometry.attributes.position.getY(i));
    }
    geometry.setAttribute("aPart", new THREE.BufferAttribute(parts, 1));
    geometry.setAttribute("aArm", new THREE.BufferAttribute(arms, 1));
    return geometry;
  };

  const pieces = [
    // torso: wider at the shoulders, flattened front to back
    tag(new THREE.CylinderGeometry(0.17, 0.125, 0.5, 6).scale(1, 1, 0.62).translate(0, 0.25, 0), 0),
    // head, then hair (or a cap) over the top half
    tag(new THREE.SphereGeometry(0.105, 6, 5).translate(0, 0.645, 0), 1),
    tag(new THREE.SphereGeometry(0.117, 6, 3, 0, Math.PI * 2, 0, Math.PI * 0.52).translate(0, 0.655, -0.01), 2),
    // legs
    tag(new THREE.BoxGeometry(0.12, 0.32, 0.13).translate(-0.075, -0.16, 0), 3),
    tag(new THREE.BoxGeometry(0.12, 0.32, 0.13).translate(0.075, -0.16, 0), 3),
    // arms hang from the shoulder: sleeve at the top, bare forearm below
    tag(new THREE.BoxGeometry(0.075, 0.36, 0.08).translate(-0.205, 0.26, 0), (y) => (y > 0.26 ? 0 : 1), -1),
    tag(new THREE.BoxGeometry(0.075, 0.36, 0.08).translate(0.205, 0.26, 0), (y) => (y > 0.26 ? 0 : 1), 1),
  ];
  const merged = mergeGeometries(pieces)!;
  pieces.forEach((piece) => piece.dispose());
  return merged;
}

function instanced(geometry: THREE.BufferGeometry, material: THREE.Material, matrices: THREE.Matrix4[]) {
  const mesh = new THREE.InstancedMesh(geometry, material, matrices.length);
  matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  mesh.matrixAutoUpdate = false;
  return mesh;
}

export default function Crowd() {
  const { team } = useTeam();

  const scene = useMemo(() => {
    const layout = buildLayout();
    const uniforms = { uTime: { value: 0 }, uCar: { value: new THREE.Vector3() } };
    const box = new THREE.BoxGeometry(1, 1, 1);

    const concrete = new THREE.MeshStandardMaterial({ color: "#161d27", roughness: 0.85, metalness: 0.1 });
    const roofMat = new THREE.MeshStandardMaterial({ color: "#0d1219", roughness: 0.5, metalness: 0.6 });
    const steel = new THREE.MeshStandardMaterial({ color: "#1c2530", roughness: 0.5, metalness: 0.7 });
    const fasciaMat = new THREE.MeshBasicMaterial({ color: "#ffffff", toneMapped: false });
    const lampMat = new THREE.MeshBasicMaterial({ color: "#f3f7ff", toneMapped: false });

    // Lambert is the cheapest lit material; the cheer animation is injected
    // into its vertex shader so thousands of fans cost one draw call and no JS.
    const fanMat = new THREE.MeshLambertMaterial({ color: "#ffffff" });
    fanMat.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime;
      shader.uniforms.uCar = uniforms.uCar;
      shader.vertexShader = `
        uniform float uTime;
        uniform vec3 uCar;
        attribute float aPart;
        attribute float aArm;
        float fanHash(vec3 p) { return fract(sin(dot(p.xz, vec2(12.9898, 78.233))) * 43758.5453); }
        ${shader.vertexShader}`
        .replace(
          "#include <color_vertex>",
          `#include <color_vertex>
          #ifdef USE_INSTANCING_COLOR
            // instanceColor is the shirt; everything else is derived per fan
            float fh = fanHash(instanceMatrix[3].xyz);
            vec3 skin = mix(vec3(0.80, 0.52, 0.38), vec3(0.20, 0.10, 0.06), smoothstep(0.3, 1.0, fract(fh * 17.31)));
            vec3 hair = mix(vec3(0.02, 0.015, 0.01), vec3(0.24, 0.13, 0.04), step(0.7, fract(fh * 5.7)));
            hair = mix(hair, instanceColor.rgb, step(0.6, fract(fh * 9.1))); // 40% wear a cap in their shirt colour
            vec3 legs = mix(vec3(0.03, 0.045, 0.10), vec3(0.11, 0.10, 0.09), step(0.6, fract(fh * 3.3)));
            if (aPart < 1.0) vColor.rgb = mix(instanceColor.rgb, skin, aPart);
            else if (aPart < 1.5) vColor.rgb = skin;
            else if (aPart < 2.5) vColor.rgb = hair;
            else vColor.rgb = legs;
          #endif`
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
          #ifdef USE_INSTANCING
            vec3 fanPos = instanceMatrix[3].xyz;
            float fanSeed = fanHash(fanPos);
            // the crowd wakes up as the car gets close
            float hype = smoothstep(46.0, 7.0, distance(fanPos.xz, uCar.xz));
            float phase = fanSeed * 6.2831 + fanPos.x * 0.35 + fanPos.z * 0.27;

            // arms: mostly down, thrown up in waves when the car comes by;
            // a few enthusiasts wave the whole time
            float lift = smoothstep(0.2, 1.0, sin(uTime * (1.5 + hype * 5.0) + phase * 1.3)) * (0.1 + 0.9 * hype);
            lift = max(lift, step(0.88, fanSeed) * (0.55 + 0.45 * sin(uTime * 6.0 + phase)));
            if (abs(aArm) > 0.5) {
              vec2 shoulder = vec2(aArm * 0.205, 0.44);
              float angle = aArm * lift * 2.7;
              float c = cos(angle);
              float s = sin(angle);
              vec2 d = transformed.xy - shoulder;
              transformed.xy = shoulder + vec2(c * d.x - s * d.y, s * d.x + c * d.y);
            }

            // idle sway, plus a hop when excited
            transformed.x += sin(uTime * 1.3 + phase) * 0.025 * max(0.0, position.y);
            transformed.y += max(0.0, sin(uTime * (2.4 + hype * 6.0) + phase)) * (0.015 + hype * 0.2);
          #endif`
        );
    };

    const fans = instanced(makePersonGeometry(), fanMat, layout.people);
    fans.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(layout.people.length * 3), 3);

    const group = new THREE.Group();
    group.add(
      instanced(box, concrete, layout.tiers),
      instanced(box, roofMat, layout.roofs),
      instanced(box, steel, layout.poles),
      instanced(box, lampMat, layout.lamps),
      fans
    );
    const fascia = instanced(box, fasciaMat, layout.fascias);
    group.add(fascia);

    // camera flashes twinkling in the stands
    const flashGeo = new THREE.BufferGeometry();
    flashGeo.setAttribute("position", new THREE.Float32BufferAttribute(layout.flashes, 3));
    const seeds = new Float32Array(layout.flashes.length / 3);
    const random = mulberry32(77);
    for (let i = 0; i < seeds.length; i++) seeds[i] = random();
    flashGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    const flashMat = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: `
        attribute float aSeed;
        uniform float uTime;
        varying float vAlpha;
        void main() {
          float cycle = fract(uTime * (0.16 + aSeed * 0.22) + aSeed * 31.0);
          vAlpha = 1.0 - smoothstep(0.0, 0.045, cycle);
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = vAlpha * 150.0 / max(1.0, -mv.z);
        }`,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float glow = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vec3(0.92, 0.96, 1.0) * glow * vAlpha, glow * vAlpha);
        }`,
    });
    const flashes = new THREE.Points(flashGeo, flashMat);
    flashes.frustumCulled = false;
    group.add(flashes);

    // All mutation is wrapped in these closures so React only ever sees an
    // opaque, stable handle.
    const color = new THREE.Color();
    const colors = fans.instanceColor.array as Float32Array;
    return {
      group,
      /** Roughly a third of the crowd wears the team colour. */
      recolor(accent: string, secondary: string) {
        layout.peopleSeed.forEach((seed, i) => {
          if (seed < 0.36) color.set(accent);
          else if (seed < 0.44) color.set(secondary);
          else color.set(FAN_COLORS[Math.floor(((seed - 0.44) / 0.56) * FAN_COLORS.length) % FAN_COLORS.length]);
          color.toArray(colors, i * 3);
        });
        fans.instanceColor!.needsUpdate = true;
        fasciaMat.color.set(accent);
      },
      tick(time: number, carPosition: THREE.Vector3) {
        uniforms.uTime.value = time;
        uniforms.uCar.value.copy(carPosition);
      },
      dispose() {
        group.traverse((child) => {
          const mesh = child as THREE.Mesh;
          mesh.geometry?.dispose();
          (mesh.material as THREE.Material | undefined)?.dispose();
        });
      },
    };
  }, []);

  // Recolour shirts + fascia when the livery changes
  useEffect(() => scene.recolor(team.accent, team.secondary), [scene, team.accent, team.secondary]);
  useEffect(() => () => scene.dispose(), [scene]);
  useFrame((state) => scene.tick(state.clock.elapsedTime, race.position));

  return <primitive object={scene.group} />;
}
