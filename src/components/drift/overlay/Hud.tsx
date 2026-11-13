import { motion, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";
import { chapterMV, scrollMV, velocityMV } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";
import { MISSION_AU, formatMET } from "@/lib/drift/timeline";

export function Hud() {
  const started = useDrift((s) => s.introStartedAt != null);
  const reduced = useDrift((s) => s.reducedMotion);
  const met = useRef<HTMLSpanElement>(null);
  const dist = useRef<HTMLSpanElement>(null);
  const vel = useRef<HTMLSpanElement>(null);
  const ch = useRef<HTMLSpanElement>(null);
  const chMobile = useRef<HTMLSpanElement>(null);
  const [hint, setHint] = useState(true);

  useMotionValueEvent(scrollMV, "change", (p) => {
    if (met.current) met.current.textContent = formatMET(p);
    if (dist.current) dist.current.textContent = (p * MISSION_AU).toFixed(1).padStart(4, "0");
    if (hint && p > 0.004) setHint(false);
  });
  useMotionValueEvent(velocityMV, "change", (v) => {
    if (vel.current) vel.current.textContent = String(v).padStart(3, "0");
  });
  useMotionValueEvent(chapterMV, "change", (c) => {
    const s = `0${c}`;
    if (ch.current) ch.current.textContent = s;
    if (chMobile.current) chMobile.current.textContent = s;
  });

  const show = {
    initial: { opacity: 0 },
    animate: started ? { opacity: 1 } : {},
    transition: { delay: reduced ? 0 : 3.8, duration: 0.8 },
  };

  return (
    <header className="pointer-events-none fixed inset-0 z-30">
      <motion.div
        {...show}
        className="absolute left-5 top-5 flex items-center gap-2 md:left-14 md:top-8"
      >
        <span className="font-display text-lg font-bold tracking-[0.2em] text-foreground">
          DRIFT
        </span>
        <span className="h-2 w-2 rounded-full bg-ember glow-ember" />
      </motion.div>
      <motion.div
        {...show}
        className="absolute right-5 top-6 font-mono text-xs tracking-[0.12em] md:right-14 md:top-9"
      >
        <span className="text-muted-foreground">MET </span>
        <span ref={met} className="text-cyan">
          00:00:00
        </span>
      </motion.div>

      <motion.div
        {...show}
        className="absolute bottom-5 left-5 hidden space-y-1 font-mono text-[11px] tracking-[0.12em] md:bottom-8 md:left-14 md:block"
      >
        <p>
          <span className="inline-block w-12 text-muted-foreground">DIST</span>
          <span ref={dist} className="text-cyan">
            00.0
          </span>
          <span className="text-muted-foreground"> AU</span>
        </p>
        <p>
          <span className="inline-block w-12 text-muted-foreground">VEL</span>
          <span ref={vel} className="text-cyan">
            000
          </span>
          <span className="text-muted-foreground"> km/s</span>
        </p>
        <p>
          <span className="inline-block w-12 text-muted-foreground">CH</span>
          <span ref={ch} className="text-cyan">
            01
          </span>
          <span className="text-muted-foreground"> / 05</span>
        </p>
      </motion.div>
      <motion.div
        {...show}
        className="absolute bottom-4 left-5 font-mono text-[11px] tracking-[0.12em] md:hidden"
      >
        <span className="text-muted-foreground">CH </span>
        <span ref={chMobile} className="text-cyan">
          01
        </span>
        <span className="text-muted-foreground">/05</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={started && hint ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: hint && !reduced ? 3.8 : 0, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex md:bottom-8"
      >
        <span className="hud-label">Scroll to launch</span>
        <svg
          className="drift-bounce h-4 w-4 text-ember"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </motion.div>
    </header>
  );
}
