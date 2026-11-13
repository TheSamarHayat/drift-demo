## Project rules (DRIFT)

- The whole experience lives on `/` (`src/routes/index.tsx`), which lazy-loads `src/components/drift/Drift.tsx` behind `ClientOnly`; three/drei/lenis must never be imported by an SSR-evaluated module.
- All scroll ranges live in `src/lib/drift/timeline.ts` (typed, non-overlapping segments + beats); `src/test/timeline.test.ts` guards that no text overlaps a travel segment.
- Camera poses, placements and ambience palettes live in `src/lib/drift/poses.ts`; tune there, not in components.
- 3D reads scroll via `frameState.p` (damped once per frame in `ScrollDriver`); overlays read `scrollMV` through `useTransform`; never use per-frame React state.
- drei `<Html>` must portal into `htmlLayerRef` (a fixed layer) because the body is scroll-tall.
- `.glb` models are served statically from `public/models/`, resolved in `src/lib/drift/models.ts`.
