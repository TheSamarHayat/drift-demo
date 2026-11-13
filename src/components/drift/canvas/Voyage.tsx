import { Sparkles, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { PLACES } from "@/lib/drift/poses";
import { useDrift } from "@/lib/drift/store";
import { useCull } from "./helpers";
import { Planet } from "./Planet";

const CINDER: [string, string] = ["#E8552B", "#7A1E10"];
const HALO: [string, string] = ["#7FD1FF", "#2A4B8F"];
const TIDE: [string, string] = ["#2BC4A8", "#0B3D6B"];

export function Voyage() {
  const station = useRef<THREE.Group>(null);
  const isMobile = useDrift((s) => s.isMobile);
  useCull(station, [0, 0, -66], 55);
  return (
    <group ref={station}>
      <Planet
        position={PLACES.cinder}
        radius={2.5}
        colors={CINDER}
        atmosphere="#FF6B35"
        seed={11}
      />
      <Planet
        position={PLACES.halo}
        radius={3}
        colors={HALO}
        atmosphere="#7FD1FF"
        ring="#CFE8FF"
        seed={23}
      />
      <Planet position={PLACES.tide} radius={4} colors={TIDE} atmosphere="#2BC4A8" seed={41} />
      <Sparkles
        position={[0, 0, -66]}
        scale={[30, 14, 50]}
        count={isMobile ? 60 : 120}
        size={3}
        speed={0.3}
        color="#CFE8FF"
        opacity={0.6}
      />
      <group position={[0, 0, -66]}>
        <Stars
          radius={30}
          depth={20}
          count={isMobile ? 300 : 700}
          factor={3}
          saturation={0.4}
          fade
          speed={0.4}
        />
      </group>
    </group>
  );
}
