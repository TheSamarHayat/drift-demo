import { describe, expect, it } from "vitest";
import { BEATS, SEGMENTS, crewBeatAt, formatMET, segmentAt, type Beat } from "@/lib/drift/timeline";

const holds = SEGMENTS.filter((s) => s.type === "hold");
const travels = SEGMENTS.filter((s) => s.type === "travel");
const visible = (b: Beat): [number, number] => [Math.max(0, b.in[0]), Math.min(1, b.out[1])];

const allText: Beat[] = [
  BEATS.ignition.text,
  BEATS.gear.title,
  ...BEATS.gear.hotspots,
  BEATS.crew.title,
  BEATS.crew.a,
  BEATS.crew.b,
  BEATS.crew.c,
  ...BEATS.voyage,
  BEATS.arrival.headline,
  BEATS.arrival.sub,
  BEATS.arrival.button,
];

describe("DRIFT timeline", () => {
  it("segments cover 0 → 1 with no gaps or overlaps", () => {
    expect(SEGMENTS[0]!.from).toBe(0);
    expect(SEGMENTS.at(-1)!.to).toBe(1);
    for (let i = 1; i < SEGMENTS.length; i++) expect(SEGMENTS[i]!.from).toBe(SEGMENTS[i - 1]!.to);
  });

  it("no text is visible during any travel segment", () => {
    for (const b of allText) {
      const [a, z] = visible(b);
      for (const t of travels) expect(z <= t.from || a >= t.to).toBe(true);
    }
  });

  it("every text element sits inside a single hold segment", () => {
    for (const b of allText) {
      const [a, z] = visible(b);
      expect(holds.some((h) => a >= h.from && z <= h.to)).toBe(true);
    }
  });

  it("crew beats A → B → C never overlap", () => {
    const { a, b, c } = BEATS.crew;
    expect(a.out[1]).toBeLessThanOrEqual(b.in[0]);
    expect(b.out[1]).toBeLessThanOrEqual(c.in[0]);
    expect(crewBeatAt(0.5)).toBe("a");
    expect(crewBeatAt(0.55)).toBe("b");
    expect(crewBeatAt(0.6)).toBe("c");
  });

  it("gear hotspots appear one after another", () => {
    const h = BEATS.gear.hotspots;
    expect(h[0].in[1]).toBeLessThanOrEqual(h[1].in[0]);
    expect(h[1].in[1]).toBeLessThanOrEqual(h[2].in[0]);
  });

  it("voyage captions fully fade before the next planet", () => {
    const v = BEATS.voyage;
    expect(v[0].out[1]).toBeLessThanOrEqual(v[1].in[0]);
    expect(v[1].out[1]).toBeLessThanOrEqual(v[2].in[0]);
  });

  it("mission clock runs 00:00:00 → 07:12:00", () => {
    expect(formatMET(0)).toBe("00:00:00");
    expect(formatMET(1)).toBe("07:12:00");
  });

  it("resolves the active segment", () => {
    expect(segmentAt(0.05).id).toBe("ignition");
    expect(segmentAt(0.3).id).toBe("gear");
    expect(segmentAt(1).id).toBe("arrival");
  });
});
