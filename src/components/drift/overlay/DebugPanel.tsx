import { useEffect, useState } from "react";
import { frameState, scrollMV, scrollToProgress } from "@/lib/drift/scroll";
import { BEATS, seg, segmentByIndex, type Beat } from "@/lib/drift/timeline";

const beatList: [string, Beat][] = [
  ["gear.title", BEATS.gear.title],
  ...BEATS.gear.hotspots.map((b, i) => [`gear.hs${i + 1}`, b] as [string, Beat]),
  ["crew.title", BEATS.crew.title],
  ["crew.A", BEATS.crew.a],
  ["crew.B", BEATS.crew.b],
  ["crew.C", BEATS.crew.c],
  ...BEATS.voyage.map((b, i) => [`voyage.${i + 1}`, b] as [string, Beat]),
  ["arrival.head", BEATS.arrival.headline],
  ["arrival.sub", BEATS.arrival.sub],
  ["arrival.btn", BEATS.arrival.button],
];

/** Dev-only scrubber (?debug=1). */
export function DebugPanel() {
  const [on, setOn] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => setOn(new URLSearchParams(window.location.search).get("debug") === "1"), []);
  useEffect(() => {
    if (!on) return;
    let id = 0;
    const loop = () => {
      tick((n) => n + 1);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [on]);
  if (!on) return null;
  const p = scrollMV.get();
  const s = segmentByIndex(frameState.segIndex);
  return (
    <div className="fixed bottom-4 right-4 z-[70] w-72 rounded-xl border border-border bg-surface/95 p-3 font-mono text-[11px] text-foreground">
      <p>
        P raw {p.toFixed(4)} · smooth {frameState.p.toFixed(4)}
      </p>
      <p>
        seg <span className="text-ember">{s.id}</span> ({s.type}){" "}
        {(seg(frameState.p, s.from, s.to) * 100).toFixed(0)}%
      </p>
      <input
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={p}
        onChange={(e) => scrollToProgress(Number(e.target.value), 0, true)}
        className="my-2 w-full accent-[var(--ember)]"
        aria-label="Scrub progress"
      />
      <div className="max-h-48 space-y-0.5 overflow-auto">
        {beatList.map(([name, b]) => {
          const v =
            p < b.in[0] || p > b.out[1]
              ? 0
              : p < b.in[1]
                ? seg(p, b.in[0], b.in[1])
                : p > b.out[0]
                  ? 1 - seg(p, b.out[0], b.out[1])
                  : 1;
          return (
            <p key={name} className={v > 0 ? "text-cyan" : "text-muted-foreground"}>
              {name.padEnd(13, " ")} {(v * 100).toFixed(0)}%
            </p>
          );
        })}
      </div>
    </div>
  );
}
