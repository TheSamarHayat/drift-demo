import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { useDrift } from "@/lib/drift/store";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [overUi, setOverUi] = useState(false);
  const hovering = useDrift((s) => s.hovering);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.6 });
  const ry = useSpring(y, { stiffness: 300, damping: 28, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    document.documentElement.classList.add("drift-hide-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as Element | null;
      setOverUi(!!t?.closest?.("button, a, [data-cursor]"));
    };
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.classList.remove("drift-hide-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const big = hovering || overUi;
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      <motion.div
        style={{ x, y }}
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-ember"
      />
      <motion.div style={{ x: rx, y: ry }} className="absolute left-0 top-0">
        <div
          className={`-translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ${
            big ? "h-14 w-14 border-ember bg-ember/10" : "h-8 w-8 border-foreground/40"
          }`}
        />
      </motion.div>
    </div>
  );
}
