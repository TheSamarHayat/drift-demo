import { Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { useDrift } from "@/lib/drift/store";

/** Starfield that follows the camera; stretches along z during the Relaunch warp. */
export function Starfield() {
  const group = useRef<THREE.Group>(null);
  const isMobile = useDrift((s) => s.isMobile);
  useFrame(({ camera }, delta) => {
    const g = group.current;
    if (!g) return;
    g.position.copy(camera.position);
    const warp = useDrift.getState().warp;
    g.scale.z = THREE.MathUtils.damp(g.scale.z, warp ? 7 : 1, warp ? 5 : 2.5, Math.min(delta, 0.1));
  });
  return (
    <group ref={group}>
      <Stars
        radius={70}
        depth={50}
        count={isMobile ? 1200 : 3000}
        factor={4}
        saturation={0}
        fade
        speed={0.6}
      />
    </group>
  );
}
