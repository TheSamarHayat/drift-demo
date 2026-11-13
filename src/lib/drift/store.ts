import { create } from "zustand";

interface DriftState {
  isMobile: boolean;
  reducedMotion: boolean;
  /** performance.now() when the intro started (null until the loader is gone). */
  introStartedAt: number | null;
  introDone: boolean;
  warp: boolean;
  /** Something hoverable is under the cursor (grows the custom cursor ring). */
  hovering: boolean;
  helmetGlow: boolean;
  set: (patch: Partial<DriftState>) => void;
}

export const useDrift = create<DriftState>((set) => ({
  isMobile: false,
  reducedMotion: false,
  introStartedAt: null,
  introDone: false,
  warp: false,
  hovering: false,
  helmetGlow: false,
  set: (patch) => set(patch),
}));

/** Seconds since the intro started (0 before it starts). */
export function introElapsed(): number {
  const t = useDrift.getState().introStartedAt;
  return t == null ? 0 : (performance.now() - t) / 1000;
}
