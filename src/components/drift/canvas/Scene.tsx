import { PerformanceMonitor, Preload, useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { MODEL_URLS } from "@/lib/drift/models";
import { useDrift } from "@/lib/drift/store";
import { Ambience } from "./Ambience";
import { Arrival } from "./Arrival";
import { CameraRig } from "./CameraRig";
import { DebugExpose } from "./DebugExpose";
import { Crew } from "./Crew";
import { Gear } from "./Gear";
import { Ignition } from "./Ignition";
import { ScrollDriver } from "./ScrollDriver";
import { Starfield } from "./Starfield";
import { Voyage } from "./Voyage";

Object.values(MODEL_URLS).forEach((u) => useGLTF.preload(u));

export default function Scene() {
  const isMobile = useDrift((s) => s.isMobile);
  const max = isMobile ? 1.5 : 1.75;
  const [dpr, setDpr] = useState(max);
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, dpr]}
      camera={{ position: [0, 0.3, 6], fov: 50, near: 0.1, far: 300 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      eventSource={document.body}
      eventPrefix="client"
      style={{ position: "fixed", inset: 0, zIndex: 0 }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(max)} />
      <ScrollDriver />
      <DebugExpose />
      <CameraRig />
      <Suspense fallback={null}>
        <Ambience />
        <Starfield />
        <Ignition />
        <Gear />
        <Crew />
        <Voyage />
        <Arrival />
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
