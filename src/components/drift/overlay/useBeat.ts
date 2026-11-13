import { useTransform } from "framer-motion";
import { scrollMV } from "@/lib/drift/scroll";
import type { Beat } from "@/lib/drift/timeline";

/** Scroll-linked reveal: y 30 → 0 / opacity 0 → 1 in, then 0 → -30 / 1 → 0 out. No re-renders. */
export function useBeat(b: Beat) {
  const keys = [b.in[0], b.in[1], b.out[0], b.out[1]];
  const opacity = useTransform(scrollMV, keys, [0, 1, 1, 0]);
  const y = useTransform(scrollMV, keys, [30, 0, 0, -30]);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  const visibility = useTransform(opacity, (o) => (o < 0.001 ? "hidden" : "visible"));
  return { opacity, y, pointerEvents, visibility };
}
