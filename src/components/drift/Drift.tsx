import Lenis from "lenis";
import { Suspense, lazy, useEffect } from "react";
import { htmlLayerRef, lenisRef, scrollMV } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";
import { CHAPTERS } from "@/lib/drift/timeline";
import { ChapterDots } from "./overlay/ChapterDots";
import { Chapters } from "./overlay/Chapters";
import { CustomCursor } from "./overlay/CustomCursor";
import { DebugPanel } from "./overlay/DebugPanel";
import { Hud } from "./overlay/Hud";
import { LoadingScreen } from "./overlay/LoadingScreen";

const Scene = lazy(() => import("./canvas/Scene"));
const INTRO_MS = 4200;

function useEnvironment() {
  useEffect(() => {
    const { set } = useDrift.getState();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () =>
      set({ isMobile: window.innerWidth < 768 || coarse.matches, reducedMotion: mq.matches });
    update();
    window.addEventListener("resize", update);
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      mq.removeEventListener("change", update);
    };
  }, []);
}

function useSmoothScroll() {
  const reduced = useDrift((s) => s.reducedMotion);
  const introDone = useDrift((s) => s.introDone);

  useEffect(() => {
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const readNative = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      scrollMV.set(limit > 0 ? window.scrollY / limit : 0);
    };
    if (reduced) {
      window.addEventListener("scroll", readNative, { passive: true });
      readNative();
      return () => window.removeEventListener("scroll", readNative);
    }
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true, syncTouch: false });
    lenisRef.current = lenis;
    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) =>
      scrollMV.set(limit > 0 ? scroll / limit : 0),
    );
    if (!useDrift.getState().introDone) lenis.stop();
    let id = 0;
    const raf = (t: number) => {
      lenis.raf(t);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  useEffect(() => {
    if (introDone) lenisRef.current?.start();
  }, [introDone]);

  // Lock native scroll during the intro (covers reduced-motion / no-Lenis path too).
  useEffect(() => {
    document.documentElement.style.overflow = introDone ? "" : "hidden";
  }, [introDone]);
}

function useIntroClock() {
  const startedAt = useDrift((s) => s.introStartedAt);
  const reduced = useDrift((s) => s.reducedMotion);
  useEffect(() => {
    if (startedAt == null) return;
    const id = setTimeout(
      () => useDrift.getState().set({ introDone: true }),
      reduced ? 0 : INTRO_MS,
    );
    return () => clearTimeout(id);
  }, [startedAt, reduced]);
}

export default function Drift() {
  useEnvironment();
  useSmoothScroll();
  useIntroClock();
  const isMobile = useDrift((s) => s.isMobile);
  const started = useDrift((s) => s.introStartedAt != null);
  const height = isMobile ? 800 : 900;

  return (
    <>
      <div
        className={`fixed inset-0 z-0 transition-opacity duration-[1200ms] ease-out ${started ? "opacity-100" : "opacity-0"}`}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </div>

      <main className="relative z-10" style={{ height: `${height}vh` }}>
        {CHAPTERS.map((c) => (
          <div
            key={c.id}
            id={c.id}
            aria-hidden
            className="absolute left-0 h-px w-px"
            style={{ top: `calc(${c.p} * (${height}vh - 100vh))` }}
          />
        ))}
      </main>

      <div
        ref={(el) => {
          if (el) htmlLayerRef.current = el;
        }}
        className="pointer-events-none fixed inset-0 z-[25]"
      />
      <Chapters />
      <Hud />
      <ChapterDots />
      <div className="drift-grain" aria-hidden />
      <CustomCursor />
      <LoadingScreen />
      <DebugPanel />
    </>
  );
}
