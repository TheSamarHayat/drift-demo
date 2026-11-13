import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { glowTexture } from "./helpers";

interface Props {
  color: string;
  position: THREE.Vector3Tuple;
  scale: number | [number, number, number];
  opacity?: number;
  /** Fade by camera distance to this point: full within `near`, gone beyond `far`. */
  fade?: { from: THREE.Vector3Tuple; near: number; far: number };
}

export function GlowSprite({ color, position, scale, opacity = 1, fade }: Props) {
  const map = useMemo(() => glowTexture(color), [color]);
  const ref = useRef<THREE.Sprite>(null);
  const from = useMemo(() => (fade ? new THREE.Vector3(...fade.from) : null), [fade]);
  useFrame(({ camera }) => {
    if (!fade || !from || !ref.current) return;
    const d = camera.position.distanceTo(from);
    const k = THREE.MathUtils.clamp((fade.far - d) / (fade.far - fade.near), 0, 1);
    ref.current.visible = k > 0.001;
    (ref.current.material as THREE.SpriteMaterial).opacity = opacity * k;
  });
  return (
    <sprite
      ref={ref}
      position={position}
      scale={typeof scale === "number" ? [scale, scale, 1] : scale}
    >
      <spriteMaterial
        map={map}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </sprite>
  );
}
