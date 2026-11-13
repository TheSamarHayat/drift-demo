import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { scrollToProgress } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";

export function RelaunchButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 15 });
  const y = useSpring(my, { stiffness: 220, damping: 15 });

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set(Math.max(-12, Math.min(12, dx * 0.25)));
    my.set(Math.max(-12, Math.min(12, dy * 0.25)));
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };
  const relaunch = () => {
    const { set } = useDrift.getState();
    set({ warp: true });
    setTimeout(() => set({ warp: false }), 800);
    scrollToProgress(0, 4);
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      onClick={relaunch}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      className="bg-ember-gradient glow-ember rounded-full px-8 py-4 font-display text-base font-medium text-primary-foreground transition-shadow duration-300 hover:shadow-[var(--shadow-ember-strong)]"
    >
      Relaunch
    </motion.button>
  );
}
