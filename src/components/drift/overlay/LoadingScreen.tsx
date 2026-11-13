import { useProgress } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDrift } from "@/lib/drift/store";
import { LoaderView } from "./LoaderView";

const MIN_MS = 800;

export function LoadingScreen() {
  const { progress, active, total } = useProgress();
  const [visible, setVisible] = useState(true);
  const mountedAt = useRef(performance.now());
  const shown = useRef(0);
  shown.current = Math.max(shown.current, progress);

  useEffect(() => {
    const done = total > 0 && !active && progress >= 100;
    if (!done) return;
    const wait = Math.max(300, MIN_MS - (performance.now() - mountedAt.current));
    const id = setTimeout(() => setVisible(false), wait);
    return () => clearTimeout(id);
  }, [progress, active, total]);

  return (
    <AnimatePresence
      onExitComplete={() => useDrift.getState().set({ introStartedAt: performance.now() })}
    >
      {visible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <LoaderView progress={shown.current} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
