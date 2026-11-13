import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { chapterMV, frameState, scrollMV } from "@/lib/drift/scroll";
import { segmentByIndex, segmentIndexAt } from "@/lib/drift/timeline";

/** Runs first each frame: damps raw scroll into frameState.p (used by all 3D motion). */
export function ScrollDriver() {
  useFrame((_, delta) => {
    frameState.p = THREE.MathUtils.damp(frameState.p, scrollMV.get(), 6, Math.min(delta, 0.1));
    const i = segmentIndexAt(frameState.p);
    frameState.segIndex = i;
    const ch = segmentByIndex(i).chapter;
    if (chapterMV.get() !== ch) chapterMV.set(ch);
  }, -2);
  return null;
}
