import { Environment } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { AMBIENCE } from "@/lib/drift/poses";
import { frameState } from "@/lib/drift/scroll";
import { segE, segmentByIndex } from "@/lib/drift/timeline";

/** Lights, background and fog. Palette only interpolates during travel segments. */
export function Ambience() {
  const scene = useThree((s) => s.scene);
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const pal = useMemo(
    () =>
      AMBIENCE.map((a) => ({
        bg: new THREE.Color(a.bg),
        key: new THREE.Color(a.key),
        rim: new THREE.Color(a.rim),
      })),
    [],
  );
  const bg = useMemo(() => new THREE.Color(AMBIENCE[0]!.bg), []);
  const fog = useMemo(() => new THREE.Fog(AMBIENCE[0]!.bg, 8, 19), []);

  useLayoutEffect(() => {
    scene.background = bg;
    scene.fog = fog;
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene, bg, fog]);

  useFrame(() => {
    const s = segmentByIndex(frameState.segIndex);
    const t = segE(frameState.p, s.from, s.to);
    const A = pal[s.ambience[0]]!;
    const B = pal[s.ambience[1]]!;
    bg.copy(A.bg).lerp(B.bg, t);
    fog.color.copy(bg);
    key.current?.color.copy(A.key).lerp(B.key, t);
    rim.current?.color.copy(A.rim).lerp(B.rim, t);
  });

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight ref={key} position={[5, 6, 8]} intensity={2.2} />
      <directionalLight ref={rim} position={[-5, 3, -10]} intensity={3} />
      <Environment preset="city" environmentIntensity={0.4} />
    </>
  );
}
