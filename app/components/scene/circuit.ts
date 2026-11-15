import * as THREE from "three";
import { projects } from "@/app/data/portfolio";

/* ────────────────────────────────────────────────────────────────
   Circuit definition — everything that needs to know where the
   track is (asphalt, walls, stands, car, camera) reads from here.
   ──────────────────────────────────────────────────────────────── */

export const TRACK_WIDTH = 7;
export const HALF_TRACK = TRACK_WIDTH / 2;
export const VERGE_WIDTH = 2.5;
export const WALL_OFFSET = HALF_TRACK + VERGE_WIDTH;
export const STAND_OFFSET = WALL_OFFSET + 1.6;

// Hand-placed layout: a long start/finish straight along +z, a sweeping
// first sector, an infield esses section, and a fast final corner.
const LAYOUT: [number, number][] = [
  [6, 30], [-14, 30], [-30, 28], [-40, 18], [-40, 4], [-30, -6], [-24, -16],
  [-24, -26], [-14, -35], [0, -35], [10, -27], [11, -15], [8, -4], [14, 6],
  [27, 8], [38, 6], [46, 15], [42, 26], [30, 30], [18, 30],
];

function buildCurve() {
  const raw = new THREE.CatmullRomCurve3(
    LAYOUT.map(([x, z]) => new THREE.Vector3(x, 0, z)),
    true,
    "centripetal"
  );
  // Relax the spline so no corner is tighter than the walls can follow.
  const count = 240;
  let points = raw.getSpacedPoints(count).slice(0, count);
  for (let pass = 0; pass < 40; pass++) {
    points = points.map((point, i) => {
      const prev = points[(i - 1 + count) % count];
      const next = points[(i + 1) % count];
      return new THREE.Vector3(
        (prev.x + next.x) * 0.25 + point.x * 0.5,
        0,
        (prev.z + next.z) * 0.25 + point.z * 0.5
      );
    });
  }
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");
  curve.arcLengthDivisions = 2000;
  return curve;
}

export const trackCurve = buildCurve();
export const TRACK_LENGTH = trackCurve.getLength();

/* Pre-sampled frames: position, tangent, left-normal, signed curvature. */
export const SAMPLES = 1200;
export const samplePos: THREE.Vector3[] = [];
export const sampleTan: THREE.Vector3[] = [];
export const sampleNor: THREE.Vector3[] = [];
export const sampleCurvature = new Float32Array(SAMPLES);

for (let i = 0; i < SAMPLES; i++) {
  const t = i / SAMPLES;
  const tangent = trackCurve.getTangentAt(t).normalize();
  samplePos.push(trackCurve.getPointAt(t));
  sampleTan.push(tangent);
  // "Left" of the direction of travel
  sampleNor.push(new THREE.Vector3(tangent.z, 0, -tangent.x));
}
for (let i = 0; i < SAMPLES; i++) {
  const a = sampleTan[(i - 4 + SAMPLES) % SAMPLES];
  const b = sampleTan[(i + 4) % SAMPLES];
  let delta = Math.atan2(b.x, b.z) - Math.atan2(a.x, a.z);
  delta = Math.atan2(Math.sin(delta), Math.cos(delta));
  // > 0 turns left, < 0 turns right
  sampleCurvature[i] = delta / ((8 * TRACK_LENGTH) / SAMPLES);
}

export const wrap01 = (t: number) => ((t % 1) + 1) % 1;

export function sampleIndex(t: number) {
  return Math.floor(wrap01(t) * SAMPLES) % SAMPLES;
}

export function curvatureAt(t: number) {
  const f = wrap01(t) * SAMPLES;
  const i = Math.floor(f) % SAMPLES;
  const j = (i + 1) % SAMPLES;
  const k = f - Math.floor(f);
  return sampleCurvature[i] * (1 - k) + sampleCurvature[j] * k;
}

/** Point on the track at lap fraction `t`, shifted sideways (+ = left). */
export function pointAt(t: number, lateral: number, target: THREE.Vector3) {
  const u = wrap01(t);
  trackCurve.getPointAt(u, target);
  if (lateral !== 0) {
    const n = sampleNor[sampleIndex(u)];
    target.x += n.x * lateral;
    target.z += n.z * lateral;
  }
  return target;
}

/* ────────────────────────────────────────────────────────────────
   Scroll → lap mapping
   ──────────────────────────────────────────────────────────────── */

// hero, about, one per project, pit, finish — then the taller resume page
export const SECTOR_IDS = [
  "hero",
  "sector-1",
  ...projects.map((_, i) => `sector-${i + 2}`),
  "sector-pit",
  "sector-finish",
];
const SECTION_COUNT = SECTOR_IDS.length;

/**
 * Scroll is measured in sections scrolled (scrollY / section height), not as a
 * fraction of the whole page, so the lap is unaffected by how tall the resume
 * page below it happens to be. The car takes the flag just as the finish
 * sector settles on screen.
 */
export const FINISH_SCROLL = SECTION_COUNT - 1 + 0.15;
/** The car waits on the grid just behind the line… */
export const GRID_T = -0.012;
/** …and parks just past it after one full lap. */
const LAP_SPAN = 1 - GRID_T + 0.018;

export function scrollToLap(scroll: number) {
  return GRID_T + Math.min(1, Math.max(0, scroll) / FINISH_SCROLL) * LAP_SPAN;
}

/** Lap position of the car when a given sector's panel is centred. */
export function sectorLapT(sectorIndex: number) {
  return scrollToLap(sectorIndex + 0.05);
}

/* ────────────────────────────────────────────────────────────────
   Shared per-frame race state (mutated in useFrame, never React state)
   ──────────────────────────────────────────────────────────────── */

export const race = {
  /** sections scrolled (scrollY / section height), written by the page scroll listener */
  scroll: 0,
  /** smoothed lap position (unwrapped, can exceed 1) */
  t: GRID_T,
  /** lap-fractions per second, signed */
  speed: 0,
  position: new THREE.Vector3().copy(trackCurve.getPointAt(wrap01(GRID_T))),
  tangent: new THREE.Vector3().copy(trackCurve.getTangentAt(wrap01(GRID_T))),
  ready: false,
};

/* ────────────────────────────────────────────────────────────────
   Grandstand placement
   ──────────────────────────────────────────────────────────────── */

export interface StandSpec {
  t: number;
  side: 1 | -1;
  width: number;
  rows: number;
  origin: THREE.Vector3; // front-centre, at ground level
  along: THREE.Vector3; // unit vector along the stand's front edge
  out: THREE.Vector3; // unit vector pointing away from the track
}

export const STAND_ROW_DEPTH = 0.95;
export const STAND_ROW_RISE = 0.55;

function standFits(origin: THREE.Vector3, along: THREE.Vector3, out: THREE.Vector3, width: number, depth: number) {
  const probe = new THREE.Vector3();
  const clearance = WALL_OFFSET + 0.9;
  for (let a = 0; a <= 6; a++) {
    for (let d = 0; d <= 3; d++) {
      probe.copy(origin)
        .addScaledVector(along, (a / 6 - 0.5) * width)
        .addScaledVector(out, (d / 3) * depth);
      for (let i = 0; i < SAMPLES; i += 2) {
        const p = samplePos[i];
        const dx = p.x - probe.x;
        const dz = p.z - probe.z;
        if (dx * dx + dz * dz < clearance * clearance) return false;
      }
    }
  }
  return true;
}

function buildStands() {
  const stands: StandSpec[] = [];
  // One stand a little ahead of where the car sits for every sector, plus
  // fillers so there is always a crowd somewhere in frame.
  const candidates = [
    ...SECTOR_IDS.map((_, i) => sectorLapT(i) + 0.022),
    0.965, 0.045, 0.2, 0.33, 0.47, 0.6, 0.73, 0.86,
  ];

  for (const candidate of candidates) {
    const t = wrap01(candidate);
    const i = sampleIndex(t);
    const curvature = sampleCurvature[i];
    // Prefer the outside of a corner (best view, and the footprint fans away
    // from the track); on a straight prefer the driver's left.
    const preferred: 1 | -1 = curvature > 0.004 ? -1 : 1;
    const options: [1 | -1, number, number][] = [
      [preferred, 24, 9],
      [-preferred as 1 | -1, 24, 9],
      [preferred, 15, 7],
      [-preferred as 1 | -1, 15, 7],
    ];

    for (const [side, width, rows] of options) {
      const out = sampleNor[i].clone().multiplyScalar(side);
      // up × out keeps the stand's local frame right-handed on either side
      const along = new THREE.Vector3(0, 1, 0).cross(out).normalize();
      const origin = samplePos[i].clone().addScaledVector(out, STAND_OFFSET);
      const depth = rows * STAND_ROW_DEPTH + 1.2;
      if (!standFits(origin, along, out, width, depth)) continue;

      // Keep stands from stacking on top of each other
      const crowded = stands.some((s) => s.origin.distanceTo(origin) < (s.width + width) * 0.5 + 3);
      if (crowded) continue;

      stands.push({ t, side, width, rows, origin, along, out });
      break;
    }
  }
  return stands;
}

export const STANDS = buildStands();
