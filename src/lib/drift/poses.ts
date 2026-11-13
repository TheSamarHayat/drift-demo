import type { StationId } from "./timeline";

export type Vec3 = [number, number, number];

export interface Pose {
  pos: Vec3;
  look: Vec3;
  /** Desktop only: shift the subject this many units to the right of screen center (makes room for left text). */
  shift?: number;
}

/** Camera poses per station (world units). Tune here. */
export const POSES: Record<StationId, Pose> = {
  S1: { pos: [0, 0.3, 6], look: [0, 0, 0] },
  S2: { pos: [0, 0.1, -10.5], look: [0, 0, -16] },
  S3: { pos: [0, 0.4, -26], look: [0, -0.2, -32] },
  V1: { pos: [1, 0.5, -53], look: [-5, 1, -46], shift: 1.8 },
  V2: { pos: [0, 0, -70], look: [6, -1, -62], shift: 2.2 },
  V3: { pos: [2, 0.5, -88], look: [-4, 0, -80], shift: 2.6 },
  S5: { pos: [0, 0.8, -103], look: [0, 0.9, -110] },
};

/** Object placements. */
export const PLACES = {
  astronaut: [0, -1, 0] as Vec3,
  helmet: [0, 0, -16] as Vec3,
  robot: [-2.2, -1, -32] as Vec3,
  fox: [2.2, -1, -32] as Vec3,
  cinder: [-5, 1, -46] as Vec3,
  halo: [6, -1, -62] as Vec3,
  tide: [-4, 0, -80] as Vec3,
  arrival: {
    astronaut: [0, -1, -110] as Vec3,
    robot: [-2.4, -1, -109] as Vec3,
    fox: [2.4, -1, -109] as Vec3,
    helmet: [0, 1.75, -112] as Vec3,
    ground: [0, -41, -110] as Vec3,
  },
};

/** Per-chapter ambience (scene bg/fog, key light, rim light). */
export const AMBIENCE = [
  { bg: "#070A1C", key: "#FFB38A", rim: "#4DE1FF" },
  { bg: "#04101A", key: "#8FE9FF", rim: "#FF6B35" },
  { bg: "#0E0B1C", key: "#FFD9A0", rim: "#7B61FF" },
  { bg: "#120A22", key: "#C9A3FF", rim: "#FF6B35" },
  { bg: "#1A0D14", key: "#FF9A5C", rim: "#4DE1FF" },
];

export const MOBILE = { pullBack: 1.55, xFactor: 0.42, yLift: 0.4, fov: 58 };
export const DESKTOP_FOV = 50;

/** Mobile adjusts x offsets (closer to center) and lifts subjects. */
export function place(v: Vec3, mobile: boolean): Vec3 {
  return mobile ? [v[0] * MOBILE.xFactor, v[1] + MOBILE.yLift, v[2]] : v;
}
