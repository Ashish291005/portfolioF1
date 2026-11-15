"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { projects } from "@/app/data/portfolio";
import { SECTOR_IDS, race, scrollToLap, trackCurve, wrap01 } from "./circuit";

/**
 * A camera "shot", expressed in the car's own frame so it follows the car
 * around the lap: metres ahead of (+) / behind (−) the car, to its left (+) /
 * right (−), and above the ground.
 */
interface Shot {
  forward: number;
  side: number;
  height: number;
  /** how far ahead of the car the camera aims */
  lead: number;
  fov: number;
  /** where the car sits in frame: +1 right third, −1 left third */
  frame: number;
  /** slow orbit amplitude, for the more static shots */
  sway: number;
}

const GRID_SHOT: Shot = { forward: 6.4, side: -3.4, height: 1.35, lead: 0, fov: 38, frame: 1, sway: 0.5 };
const CHASE_SHOT: Shot = { forward: -7.6, side: 1.6, height: 3.1, lead: 3.5, fov: 46, frame: -1, sway: 0.35 };
const PIT_SHOT: Shot = { forward: -3.5, side: 7.5, height: 10.5, lead: 1.5, fov: 40, frame: 1, sway: 1.2 };
const FINISH_SHOT: Shot = { forward: 7.2, side: 3, height: 1.25, lead: 0, fov: 40, frame: -1, sway: 0.4 };

// Every project gets its own angle; with more projects than shots they cycle.
const PROJECT_SHOTS: Omit<Shot, "frame">[] = [
  { forward: 1.4, side: 5.3, height: 1.05, lead: 0.6, fov: 40, sway: 0.25 }, // low trackside pan
  { forward: -9.5, side: -5, height: 13, lead: 2.5, fov: 42, sway: 0.9 }, // helicopter
  { forward: 8.2, side: 2.1, height: 0.95, lead: 0, fov: 35, sway: 0.2 }, // nose-on, long lens
  { forward: -5.2, side: -1.7, height: 1.2, lead: 5, fov: 54, sway: 0.15 }, // gearbox-height chase
  { forward: 3.2, side: -5.3, height: 2.5, lead: 0.5, fov: 44, sway: 0.4 }, // marshal post
];

function shotFor(sectorId: string): Shot {
  const index = SECTOR_IDS.indexOf(sectorId);
  if (index <= 0) return GRID_SHOT;
  if (sectorId === "sector-1") return CHASE_SHOT;
  // pit / finish panels keep alternating sides after the last project
  const flip = projects.length % 2 === 0 ? 1 : -1;
  if (sectorId === "sector-pit") return { ...PIT_SHOT, frame: PIT_SHOT.frame * flip };
  if (sectorId === "sector-finish") return { ...FINISH_SHOT, frame: FINISH_SHOT.frame * flip };
  const project = index - 2;
  // Panels alternate left / right; keep the car on the opposite side.
  return { ...PROJECT_SHOTS[project % PROJECT_SHOTS.length], frame: project % 2 === 0 ? 1 : -1 };
}

const damp = (current: number, target: number, rate: number, delta: number) =>
  current + (target - current) * (1 - Math.exp(-rate * delta));

/** Advances the smoothed lap position that the car, camera and crowd all read. */
export function LapDriver() {
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const target = scrollToLap(race.scroll);
    const previous = race.t;
    race.t = race.ready ? damp(race.t, target, 4.2, delta) : target;
    if (Math.abs(target - race.t) < 1e-5) race.t = target;
    race.speed = delta > 0 ? (race.t - previous) / delta : 0;
    race.ready = true;

    const u = wrap01(race.t);
    trackCurve.getPointAt(u, race.position);
    trackCurve.getTangentAt(u, race.tangent).normalize();
  });
  return null;
}

export default function CameraRig({ activeSectorId }: { activeSectorId: string }) {
  const target = useMemo(() => shotFor(activeSectorId), [activeSectorId]);
  const shot = useRef<Shot>({ ...GRID_SHOT });
  const snapped = useRef(false);
  const changedAt = useRef(-10);
  // scratch vectors, reused every frame so the render loop allocates nothing
  const scratch = useRef({
    forward: new THREE.Vector3(0, 0, 1),
    left: new THREE.Vector3(),
    desired: new THREE.Vector3(),
    look: new THREE.Vector3(),
    focus: new THREE.Vector3(),
    right: new THREE.Vector3(),
    toCar: new THREE.Vector3(),
  });

  useEffect(() => {
    changedAt.current = performance.now() / 1000;
  }, [activeSectorId]);

  // Gentle parallax: the camera leans a little toward the pointer.
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((state, rawDelta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const size = state.size;
    const v = scratch.current;
    const delta = Math.min(rawDelta, 0.05);
    const first = !snapped.current;
    const s = shot.current;

    // Ease from the previous shot to the new one. The blend is quick at the
    // moment a new project arrives, so the angle change reads as a camera cut
    // that swings round the car rather than a slow drift.
    const sinceChange = performance.now() / 1000 - changedAt.current;
    const rate = first ? 1e3 : sinceChange < 1.6 ? 3.4 : 2.2;
    s.forward = damp(s.forward, target.forward, rate, delta);
    s.side = damp(s.side, target.side, rate, delta);
    s.height = damp(s.height, target.height, rate, delta);
    s.lead = damp(s.lead, target.lead, rate, delta);
    s.fov = damp(s.fov, target.fov, rate, delta);
    s.frame = damp(s.frame, target.frame, rate, delta);
    s.sway = damp(s.sway, target.sway, rate, delta);

    // Follow the car's heading with a little lag so corners feel weighty.
    if (first) v.forward.copy(race.tangent);
    else v.forward.lerp(race.tangent, 1 - Math.exp(-delta * 5)).normalize();
    v.left.set(v.forward.z, 0, -v.forward.x);

    // 1 on a wide desktop (panel beside the car), 0 on a phone / narrow
    // window (panel stacked above the car), blended in between.
    const aspect = size.width / size.height;
    const wide = THREE.MathUtils.clamp((Math.min(aspect, size.width / 620) - 0.95) / 0.75, 0, 1);
    const time = state.clock.elapsedTime;
    const sway = Math.sin(time * 0.35) * s.sway;
    // Narrow screens get a slightly longer shot so the whole car fits.
    const pull = 1.28 - 0.28 * wide;

    // Low shots stay on the track side of the barrier: beyond it the camera
    // would be standing in the middle of the fence-line crowd.
    let lateral = (s.side + sway) * pull;
    const p = pointer.current;
    p.sx += (p.x - p.sx) * (1 - Math.exp(-delta * 3));
    p.sy += (p.y - p.sy) * (1 - Math.exp(-delta * 3));
    lateral += p.sx * 0.45;
    if (s.height < 4) lateral = THREE.MathUtils.clamp(lateral, -5.4, 5.4);

    v.desired
      .copy(race.position)
      .addScaledVector(v.forward, s.forward * pull)
      .addScaledVector(v.left, lateral);
    v.desired.y = Math.max(0.7, s.height * (1.2 - 0.2 * wide) + Math.cos(time * 0.27) * s.sway * 0.12 - p.sy * 0.22);

    if (first) camera.position.copy(v.desired);
    else camera.position.lerp(v.desired, 1 - Math.exp(-delta * 5.5));

    // Aim point: the car, nudged ahead, then slid sideways in screen space so
    // the car sits clear of the content panel.
    v.look.copy(race.position).addScaledVector(v.forward, s.lead);
    v.look.y = 0.42;
    v.toCar.subVectors(v.look, camera.position);
    const distance = v.toCar.length();
    v.right.set(-v.toCar.z, 0, v.toCar.x).normalize();
    // wide: slide the car to the side opposite the panel
    v.look.addScaledVector(v.right, -s.frame * distance * 0.16 * Math.min(aspect, 2.2) * wide);
    // narrow: drop the car into the lower part of the frame instead
    v.look.y += distance * 0.2 * (1 - wide);

    if (first) v.focus.copy(v.look);
    else v.focus.lerp(v.look, 1 - Math.exp(-delta * 7));
    camera.lookAt(v.focus);

    if (Math.abs(camera.fov - s.fov) > 0.01) {
      camera.fov = s.fov;
      camera.updateProjectionMatrix();
    }
    snapped.current = true;
  });

  return null;
}
