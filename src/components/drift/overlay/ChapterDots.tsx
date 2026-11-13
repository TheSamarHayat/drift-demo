import { motion, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { chapterMV, scrollToProgress } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";
import { CHAPTERS } from "@/lib/drift/timeline";

export function ChapterDots() {
  const started = useDrift((s) => s.introStartedAt != null);
  const reduced = useDrift((s) => s.reducedMotion);
  const [active, setActive] = useState(1);
  useMotionValueEvent(chapterMV, "change", (c) => setActive(c));

  return (
    <motion.nav
      aria-label="Chapters"
      initial={{ opacity: 0 }}
      animate={started ? { opacity: 1 } : {}}
      transition={{ delay: reduced ? 0 : 3.8, duration: 0.8 }}
      className="fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 md:flex md:right-10"
    >
      {CHAPTERS.map((c, i) => {
        const on = active === i + 1;
        return (
          <button
            key={c.id}
            type="button"
            aria-label={`Go to ${c.label}`}
            aria-current={on ? "step" : undefined}
            onClick={() => scrollToProgress(c.p, 2.5)}
            className="group relative flex h-5 w-5 items-center justify-center rounded-full"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                on
                  ? "h-3 w-3 bg-ember glow-ember"
                  : "h-1.5 w-1.5 bg-muted-foreground group-hover:bg-foreground"
              }`}
            />
            <span className="hud-label pointer-events-none absolute right-8 whitespace-nowrap rounded-md bg-surface px-2 py-1 text-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              {c.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
}
