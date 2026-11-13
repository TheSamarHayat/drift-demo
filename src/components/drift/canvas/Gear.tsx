import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { motion, useTransform } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import * as THREE from "three";
import { MODEL_URLS } from "@/lib/drift/models";
import { PLACES } from "@/lib/drift/poses";
import { frameState, htmlLayerRef, scrollMV } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";
import { BEATS, segE, type Beat } from "@/lib/drift/timeline";
import { Character } from "./Character";
import { hoverOff, hoverOn, useCull } from "./helpers";
import { HOTSPOTS } from "./hotspots";

function Hotspot({
  beat,
  title,
  text,
  side,
  mobile,
}: {
  beat: Beat;
  title: string;
  text: string;
  side: string;
  mobile: boolean;
}) {
  const opacity = useTransform(
    scrollMV,
    [beat.in[0], beat.in[1], beat.out[0], beat.out[1]],
    [0, 1, 1, 0],
  );
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  const [open, setOpen] = useState(false);
  const enter = () => {
    setOpen(true);
    hoverOn();
    useDrift.getState().set({ helmetGlow: true });
  };
  const leave = () => {
    setOpen(false);
    hoverOff();
    useDrift.getState().set({ helmetGlow: false });
  };
  return (
    <motion.div
      style={{ opacity, pointerEvents }}
      className="relative"
      onPointerEnter={enter}
      onPointerLeave={leave}
      onClick={() => (open ? leave() : enter())}
    >
      <span
        data-cursor
        className={`block h-3.5 w-3.5 rounded-full bg-ember ${open ? "" : "drift-pulse"}`}
        aria-hidden
      />
      {!mobile && (
        <div
          className={`glass absolute top-1/2 w-56 -translate-y-1/2 p-4 transition-all duration-300 ${
            side === "left" ? "right-6" : "left-6"
          } ${open ? "scale-105 bg-surface-2" : "scale-100"}`}
        >
          <p className="eyebrow">{title}</p>
          <p
            className={`mt-1 text-sm text-foreground transition-opacity duration-300 ${open ? "opacity-100" : "opacity-80"}`}
          >
            {text}
          </p>
        </div>
      )}
    </motion.div>
  );
}

export function Gear() {
  const station = useRef<THREE.Group>(null);
  const helmet = useRef<THREE.Group>(null);
  const mats = useRef<THREE.MeshStandardMaterial[]>([]);
  const extra = useRef({ spin: 0, hover: false, glow: 1 });
  const isMobile = useDrift((s) => s.isMobile);
  useCull(station, PLACES.helmet, 22);

  const onScene = useCallback((o: THREE.Object3D) => {
    const list: THREE.MeshStandardMaterial[] = [];
    o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (m.isMesh) list.push(m.material as THREE.MeshStandardMaterial);
    });
    mats.current = list;
  }, []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const x = extra.current;
    const [a, b] = BEATS.gear.spin;
    // Hover adds speed; when released, the offset settles to a full turn (never fights scroll).
    if (x.hover) x.spin += dt * 2.4;
    else
      x.spin = THREE.MathUtils.damp(
        x.spin,
        Math.round(x.spin / (Math.PI * 2)) * Math.PI * 2,
        3,
        dt,
      );
    if (helmet.current) {
      helmet.current.rotation.y = -0.35 + segE(frameState.p, a, b) * Math.PI * 2 + x.spin;
      helmet.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
    const want = x.hover || useDrift.getState().helmetGlow ? 4 : 1;
    x.glow = THREE.MathUtils.damp(x.glow, want, 5, dt);
    for (const m of mats.current) m.emissiveIntensity = x.glow;
  });

  return (
    <group ref={station} position={PLACES.helmet}>
      <group ref={helmet}>
        <Character
          url={MODEL_URLS.helmet}
          scale={1.3}
          center
          cloneMaterials
          onScene={onScene}
          onOver={(e) => {
            e.stopPropagation();
            extra.current.hover = true;
            hoverOn();
          }}
          onOut={() => {
            extra.current.hover = false;
            hoverOff();
          }}
          onTap={() => (extra.current.hover = !extra.current.hover)}
        />
      </group>
      {HOTSPOTS.map((h, i) => (
        <Html key={h.title} position={h.pos} center zIndexRange={[30, 20]} portal={htmlLayerRef}>
          <Hotspot
            beat={BEATS.gear.hotspots[i]!}
            title={h.title}
            text={h.text}
            side={h.side}
            mobile={isMobile}
          />
        </Html>
      ))}
    </group>
  );
}
