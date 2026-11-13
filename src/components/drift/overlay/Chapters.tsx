import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { HOTSPOTS } from "@/components/drift/canvas/hotspots";
import { useDrift } from "@/lib/drift/store";
import { BEATS, type Beat } from "@/lib/drift/timeline";
import { RelaunchButton } from "./RelaunchButton";
import { useBeat } from "./useBeat";

const EASE = [0.16, 1, 0.3, 1] as const;

function Fade({
  beat,
  className,
  children,
}: {
  beat: Beat;
  className?: string;
  children: ReactNode;
}) {
  const { opacity, y, visibility, pointerEvents } = useBeat(beat);
  return (
    <motion.div style={{ opacity, y, visibility, pointerEvents }} className={className}>
      {children}
    </motion.div>
  );
}

/** Left column on desktop, bottom of screen (over a gradient) on mobile. */
const SIDE =
  "fixed inset-x-0 bottom-0 flex min-h-[42vh] flex-col justify-end bg-fade-bottom px-5 pb-14 md:inset-x-auto md:inset-y-0 md:left-0 md:min-h-0 md:w-[640px] md:justify-center md:bg-none md:px-14 md:pb-0";

function Ignition() {
  const started = useDrift((s) => s.introStartedAt != null);
  const reduced = useDrift((s) => s.reducedMotion);
  const letters = "DRIFT".split("");
  return (
    <Fade beat={BEATS.ignition.text} className={`${SIDE} md:w-auto`}>
      <section id="ignition-text" aria-label="Ignition">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 12 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: reduced ? 0 : 0.3, duration: 0.6, ease: EASE }}
        >
          Expedition One
        </motion.p>
        <h1 className="text-giant mt-3 flex overflow-hidden text-foreground" aria-label="DRIFT">
          {letters.map((l, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={started ? { y: "0%", opacity: 1 } : {}}
              transition={{ delay: reduced ? 0 : 0.4 + i * 0.06, duration: 0.9, ease: EASE }}
            >
              {l}
            </motion.span>
          ))}
        </h1>
        <motion.p
          className="mt-4 max-w-md text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 16 }}
          animate={started ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: reduced ? 0 : 3.2, duration: 0.6, ease: EASE }}
        >
          One scroll. One expedition. Four travelers.
        </motion.p>
      </section>
    </Fade>
  );
}

function Gear() {
  const isMobile = useDrift((s) => s.isMobile);
  return (
    <>
      <Fade
        beat={BEATS.gear.title}
        className="fixed inset-x-0 top-24 px-5 md:left-0 md:right-auto md:top-32 md:w-[560px] md:px-14"
      >
        <p className="eyebrow">Chapter 02 — The Gear</p>
        <h2 className="text-headline mt-3 text-foreground">Built for the void.</h2>
      </Fade>
      {isMobile && (
        <Fade
          beat={BEATS.gear.title}
          className="fixed inset-x-0 bottom-0 flex flex-col gap-2 bg-fade-bottom px-5 pb-10 pt-20"
        >
          {HOTSPOTS.map((h, i) => (
            <Fade key={h.title} beat={BEATS.gear.hotspots[i]!} className="glass p-4">
              <p className="eyebrow">{h.title}</p>
              <p className="mt-1 text-sm text-foreground">{h.text}</p>
            </Fade>
          ))}
        </Fade>
      )}
    </>
  );
}

function CrewCard({
  beat,
  name,
  role,
  text,
  side,
}: {
  beat: Beat;
  name: string;
  role: string;
  text: string;
  side: "left" | "right";
}) {
  return (
    <Fade
      beat={beat}
      className={`fixed inset-x-5 bottom-10 md:inset-x-auto md:bottom-20 md:w-72 ${
        side === "left" ? "md:left-[10vw]" : "md:right-[10vw]"
      }`}
    >
      <div className="glass p-5">
        <p className="eyebrow">
          {name} · {role}
        </p>
        <p className="mt-2 text-base text-foreground">{text}</p>
      </div>
    </Fade>
  );
}

function Crew() {
  const c = BEATS.crew;
  return (
    <>
      <Fade beat={c.title} className="fixed inset-x-0 top-24 px-5 text-center md:top-28">
        <p className="eyebrow">Chapter 03 — The Crew</p>
        <h2 className="text-headline mt-3 text-foreground">Meet the crew.</h2>
      </Fade>
      <CrewCard
        beat={c.a}
        name="UNIT-7"
        role="Ship AI"
        text="Knows every wire on board."
        side="left"
      />
      <CrewCard
        beat={c.b}
        name="SCOUT"
        role="Navigator"
        text="Stowed away. Stayed for the view."
        side="right"
      />
      <Fade beat={c.c} className="fixed inset-x-0 bottom-12 px-5 text-center md:bottom-16">
        <p className="font-display text-3xl font-medium text-foreground md:text-5xl">Together.</p>
        <p className="mt-2 text-muted-foreground">Four travelers. One heading.</p>
      </Fade>
    </>
  );
}

const PLANETS = [
  { name: "Cinder", text: "Dusk never ends here." },
  { name: "Halo", text: "Rings made of ice and forgotten satellites." },
  { name: "Tide", text: "An ocean world, nine thousand kilometers deep." },
];

function Voyage() {
  return (
    <>
      {PLANETS.map((pl, i) => (
        <Fade key={pl.name} beat={BEATS.voyage[i]!} className={SIDE}>
          {i === 0 && (
            <div className="mb-8">
              <p className="eyebrow">Chapter 04 — The Voyage</p>
              <h2 className="text-headline mt-3 text-foreground">Further than any map.</h2>
            </div>
          )}
          <div className="glass max-w-sm p-5">
            <p className="font-mono text-xs uppercase tracking-[0.12em] text-ember">
              Planet 0{i + 1}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-wide text-foreground">
              {pl.name}
            </h3>
            <p className="mt-2 text-muted-foreground">{pl.text}</p>
          </div>
        </Fade>
      ))}
    </>
  );
}

function Arrival() {
  const a = BEATS.arrival;
  return (
    <div className="text-legible pointer-events-none fixed inset-x-0 top-20 flex flex-col items-center px-5 text-center md:top-24">
      <Fade beat={a.headline}>
        <p className="eyebrow">Chapter 05 — Arrival</p>
        <h2 className="text-headline mt-3 text-foreground">You made it.</h2>
      </Fade>
      <Fade beat={a.sub} className="mt-4">
        <p className="text-lg text-foreground/85">Every expedition begins with a scroll.</p>
      </Fade>
      <Fade beat={a.button} className="mt-8">
        <RelaunchButton />
      </Fade>
    </div>
  );
}

export function Chapters() {
  return (
    <div className="pointer-events-none relative z-20">
      <Ignition />
      <Gear />
      <Crew />
      <Voyage />
      <Arrival />
    </div>
  );
}
