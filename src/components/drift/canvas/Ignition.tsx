import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { MODEL_URLS } from "@/lib/drift/models";
import { PLACES, type Vec3 } from "@/lib/drift/poses";
import { introElapsed, useDrift } from "@/lib/drift/store";
import { smoother } from "@/lib/drift/timeline";
import { Character } from "./Character";
import { easeOut, hoverOff, hoverOn, useCull } from "./helpers";

/** Reusable astronaut behavior: float, slow rotation, quick 360° spin on hover/tap. */
export function useSpin() {
  const start = useRef<number | null>(null);
  const trigger = () => {
    if (start.current == null) start.current = performance.now();
  };
  const offset = () => {
    if (start.current == null) return 0;
    const t = (performance.now() - start.current) / 900;
    if (t >= 1) {
      start.current = null;
      return 0;
    }
    return smoother(t) * Math.PI * 2;
  };
  return { trigger, offset };
}

export function Ignition() {
  const station = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const spin = useSpin();
  const isMobile = useDrift((s) => s.isMobile);
  useCull(station, PLACES.astronaut, 22);
  const pos: Vec3 = isMobile ? [0, -0.5, 0] : [1.7, -1, 0];

  useFrame((state) => {
    const g = body.current;
    if (!g) return;
    const time = state.clock.elapsedTime;
    const { reducedMotion } = useDrift.getState();
    // Intro glide: z -10 → 0 between 1.0 s and 3.0 s.
    const e = reducedMotion ? 10 : introElapsed();
    const glide = easeOut((e - 1) / 2);
    g.position.z = -10 + 10 * glide;
    g.position.y = Math.sin(time * 1.1) * 0.08;
    const settle = (1 - glide) * 0.8;
    g.rotation.y = -0.35 + Math.sin(time * 0.25) * 0.5 + settle + spin.offset();
    g.rotation.z = Math.sin(time * 0.6) * 0.05;
  });

  return (
    <group ref={station} position={pos}>
      <group ref={body}>
        <Character
          url={MODEL_URLS.astronaut}
          height={2}
          onOver={(e) => {
            e.stopPropagation();
            hoverOn();
            spin.trigger();
          }}
          onOut={hoverOff}
          onTap={spin.trigger}
        />
      </group>
    </group>
  );
}
