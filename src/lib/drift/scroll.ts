import { motionValue } from "framer-motion";
import type Lenis from "lenis";
import { smoother } from "./timeline";

/** Raw page progress 0..1 (from Lenis / native scroll). Overlays read this. */
export const scrollMV = motionValue(0);
/** Camera speed readout for the HUD (km/s, already scaled). */
export const velocityMV = motionValue(0);
/** Active chapter number 1..5. */
export const chapterMV = motionValue(1);

/** Damped progress used by all 3D motion (written once per frame by ScrollDriver). */
export const frameState = { p: 0, segIndex: 0 };

export const lenisRef: { current: Lenis | null } = { current: null };
/** Fixed full-screen layer that drei <Html> hotspots portal into (body is scroll-tall). */
export const htmlLayerRef = { current: null as unknown as HTMLElement };

function limit() {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

export function scrollToProgress(p: number, duration = 2.5, immediate = false) {
  const target = p * limit();
  const lenis = lenisRef.current;
  if (lenis) lenis.scrollTo(target, { duration, easing: smoother, immediate, force: true });
  else window.scrollTo({ top: target, behavior: immediate ? "auto" : "smooth" });
}
