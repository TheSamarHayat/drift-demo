import { useThree } from "@react-three/fiber";
import { useEffect } from "react";

/** ?debug=1 only: expose the scene on window for inspection in dev tools. */
export function DebugExpose() {
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("debug") !== "1") return;
    (window as unknown as { __drift: unknown }).__drift = { scene, camera };
  }, [scene, camera]);
  return null;
}
