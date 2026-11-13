/**
 * DRIFT master timeline — the single source of truth for every scroll range.
 * Scroll progress P runs 0 → 1. Segments are contiguous and never overlap.
 * `hold`: camera parked, text/beats play. `travel`: camera moves, no text visible.
 */
export type SegmentType = "hold" | "travel";
export type StationId = "S1" | "S2" | "S3" | "V1" | "V2" | "V3" | "S5";
export type SegmentId =
  | "ignition"
  | "travel-1"
  | "gear"
  | "travel-2"
  | "crew"
  | "travel-3"
  | "voyage-1"
  | "travel-v1v2"
  | "voyage-2"
  | "travel-v2v3"
  | "voyage-3"
  | "travel-4"
  | "arrival";

export interface Segment {
  id: SegmentId;
  type: SegmentType;
  from: number;
  to: number;
  /** HUD chapter number (travel segments show the upcoming chapter). */
  chapter: number;
  /** Camera pose A → B (identical for holds). */
  pose: [StationId, StationId];
  /** Ambience palette index A → B (identical for holds, so ambience only shifts during travel). */
  ambience: [number, number];
}

export const SEGMENTS: Segment[] = [
  {
    id: "ignition",
    type: "hold",
    from: 0,
    to: 0.1,
    chapter: 1,
    pose: ["S1", "S1"],
    ambience: [0, 0],
  },
  {
    id: "travel-1",
    type: "travel",
    from: 0.1,
    to: 0.18,
    chapter: 2,
    pose: ["S1", "S2"],
    ambience: [0, 1],
  },
  {
    id: "gear",
    type: "hold",
    from: 0.18,
    to: 0.38,
    chapter: 2,
    pose: ["S2", "S2"],
    ambience: [1, 1],
  },
  {
    id: "travel-2",
    type: "travel",
    from: 0.38,
    to: 0.45,
    chapter: 3,
    pose: ["S2", "S3"],
    ambience: [1, 2],
  },
  {
    id: "crew",
    type: "hold",
    from: 0.45,
    to: 0.65,
    chapter: 3,
    pose: ["S3", "S3"],
    ambience: [2, 2],
  },
  {
    id: "travel-3",
    type: "travel",
    from: 0.65,
    to: 0.7,
    chapter: 4,
    pose: ["S3", "V1"],
    ambience: [2, 3],
  },
  {
    id: "voyage-1",
    type: "hold",
    from: 0.7,
    to: 0.74,
    chapter: 4,
    pose: ["V1", "V1"],
    ambience: [3, 3],
  },
  {
    id: "travel-v1v2",
    type: "travel",
    from: 0.74,
    to: 0.76,
    chapter: 4,
    pose: ["V1", "V2"],
    ambience: [3, 3],
  },
  {
    id: "voyage-2",
    type: "hold",
    from: 0.76,
    to: 0.8,
    chapter: 4,
    pose: ["V2", "V2"],
    ambience: [3, 3],
  },
  {
    id: "travel-v2v3",
    type: "travel",
    from: 0.8,
    to: 0.82,
    chapter: 4,
    pose: ["V2", "V3"],
    ambience: [3, 3],
  },
  {
    id: "voyage-3",
    type: "hold",
    from: 0.82,
    to: 0.86,
    chapter: 4,
    pose: ["V3", "V3"],
    ambience: [3, 3],
  },
  {
    id: "travel-4",
    type: "travel",
    from: 0.86,
    to: 0.92,
    chapter: 5,
    pose: ["V3", "S5"],
    ambience: [3, 4],
  },
  {
    id: "arrival",
    type: "hold",
    from: 0.92,
    to: 1,
    chapter: 5,
    pose: ["S5", "S5"],
    ambience: [4, 4],
  },
];

export type Range = readonly [number, number];
/** A text element: fades in over `in`, fades out over `out`. */
export interface Beat {
  in: Range;
  out: Range;
}

export const BEATS = {
  ignition: { text: { in: [-1, 0], out: [0.08, 0.1] } as Beat },
  gear: {
    title: { in: [0.18, 0.21], out: [0.36, 0.38] } as Beat,
    spin: [0.21, 0.35] as Range,
    hotspots: [
      { in: [0.23, 0.25], out: [0.36, 0.38] },
      { in: [0.27, 0.29], out: [0.36, 0.38] },
      { in: [0.31, 0.33], out: [0.36, 0.38] },
    ] as [Beat, Beat, Beat],
  },
  crew: {
    title: { in: [0.45, 0.48], out: [0.63, 0.65] } as Beat,
    a: { in: [0.48, 0.495], out: [0.515, 0.53] } as Beat,
    b: { in: [0.53, 0.545], out: [0.565, 0.58] } as Beat,
    c: { in: [0.58, 0.595], out: [0.63, 0.65] } as Beat,
  },
  voyage: [
    { in: [0.7, 0.715], out: [0.725, 0.74] },
    { in: [0.76, 0.775], out: [0.785, 0.8] },
    { in: [0.82, 0.835], out: [0.845, 0.86] },
  ] as [Beat, Beat, Beat],
  arrival: {
    headline: { in: [0.92, 0.945], out: [2, 3] } as Beat,
    sub: { in: [0.95, 0.97], out: [2, 3] } as Beat,
    button: { in: [0.975, 0.99], out: [2, 3] } as Beat,
  },
} as const;

/** Crew clip beats (keyed by beat, triggered only when the beat changes). */
export type CrewBeat = "pre" | "a" | "b" | "c" | "post";
export function crewBeatAt(p: number): CrewBeat {
  const { a, b, c } = BEATS.crew;
  if (p < a.in[0]) return "pre";
  if (p < b.in[0]) return "a";
  if (p < c.in[0]) return "b";
  if (p < c.out[1]) return "c";
  return "post";
}

/** In-page jump targets (P values) for the chapter dots. */
export const CHAPTERS = [
  { id: "ignition", label: "Ignition", p: 0 },
  { id: "gear", label: "Gear", p: 0.34 },
  { id: "crew", label: "Crew", p: 0.5 },
  { id: "voyage", label: "Voyage", p: 0.72 },
  { id: "arrival", label: "Arrival", p: 1 },
] as const;

export const MISSION_SECONDS = 7 * 3600 + 12 * 60;
export const MISSION_AU = 42;

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const smoother = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const segE = (p: number, a: number, b: number) => smoother(seg(p, a, b));

export function segmentIndexAt(p: number): number {
  const x = clamp01(p);
  for (let i = 0; i < SEGMENTS.length; i++) if (x < SEGMENTS[i]!.to) return i;
  return SEGMENTS.length - 1;
}
export const segmentByIndex = (i: number): Segment => SEGMENTS[i] ?? SEGMENTS[0]!;
export const segmentAt = (p: number): Segment => segmentByIndex(segmentIndexAt(p));

export function formatMET(p: number): string {
  const s = Math.round(clamp01(p) * MISSION_SECONDS);
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
