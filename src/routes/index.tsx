import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy } from "react";
import { LoaderView } from "@/components/drift/overlay/LoaderView";

const Drift = lazy(() => import("@/components/drift/Drift"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DRIFT — Expedition One" },
      {
        name: "description",
        content: "One scroll. One expedition. Four travelers. A scroll-driven 3D space expedition.",
      },
      { property: "og:title", content: "DRIFT — Expedition One" },
      {
        property: "og:description",
        content: "One scroll. One expedition. Four travelers. A scroll-driven 3D space expedition.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const loader = (
    <div className="fixed inset-0 z-50">
      <LoaderView progress={0} />
    </div>
  );
  return (
    <ClientOnly fallback={loader}>
      <Suspense fallback={loader}>
        <Drift />
      </Suspense>
    </ClientOnly>
  );
}
