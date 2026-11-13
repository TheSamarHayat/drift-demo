import { useFrame } from "@react-three/fiber";
import { useMemo, type RefObject } from "react";
import * as THREE from "three";
import { useDrift } from "@/lib/drift/store";

/** Hide a station group when it is far from the camera. */
export function useCull(
  ref: RefObject<THREE.Object3D | null>,
  center: THREE.Vector3Tuple,
  dist = 40,
) {
  const c = useMemo(() => new THREE.Vector3(...center), [center]);
  useFrame(({ camera }) => {
    if (ref.current) ref.current.visible = camera.position.distanceTo(c) < dist;
  });
}

export const hoverOn = () => useDrift.getState().set({ hovering: true });
export const hoverOff = () => useDrift.getState().set({ hovering: false });

const glowCache = new Map<string, THREE.CanvasTexture>();
/** Soft radial gradient texture (cached per color). */
export function glowTexture(color: string): THREE.CanvasTexture {
  const hit = glowCache.get(color);
  if (hit) return hit;
  const size = 256;
  const cv = document.createElement("canvas");
  cv.width = cv.height = size;
  const ctx = cv.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, color);
  g.addColorStop(0.35, color + "88");
  g.addColorStop(1, color + "00");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  glowCache.set(color, tex);
  return tex;
}

/** easeOutCubic */
export const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
