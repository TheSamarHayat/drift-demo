import type * as THREE from "three";

export const HOTSPOTS: {
  title: string;
  text: string;
  pos: THREE.Vector3Tuple;
  side: "left" | "right";
}[] = [
  {
    title: "Reinforced visor",
    text: "Withstands micrometeoroid impact.",
    pos: [0.25, 0.05, 1.1],
    side: "right",
  },
  {
    title: "Scarred shell",
    text: "Every dent is a mission survived.",
    pos: [0.6, 0.9, 0.3],
    side: "right",
  },
  {
    title: "Sealed seams",
    text: "Holds pressure at zero atmospheres.",
    pos: [0.9, -0.65, 0.35],
    side: "right",
  },
];
