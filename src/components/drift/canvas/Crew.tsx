import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { MODEL_URLS } from "@/lib/drift/models";
import { PLACES, place } from "@/lib/drift/poses";
import { frameState } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";
import { crewBeatAt, type CrewBeat } from "@/lib/drift/timeline";
import { Character, type CharacterHandle } from "./Character";
import { GlowSprite } from "./GlowSprite";
import { hoverOff, hoverOn, useCull } from "./helpers";

const NEBULA_FADE = { from: [0, 0, -32] as [number, number, number], near: 11, far: 17 };
const ROBOT_BASE: Record<CrewBeat, string> = {
  pre: "Idle",
  a: "Idle",
  b: "Idle",
  c: "Walking",
  post: "Idle",
};
const FOX_BASE: Record<CrewBeat, string> = {
  pre: "Survey",
  a: "Survey",
  b: "Run",
  c: "Walk",
  post: "Survey",
};

export function Crew() {
  const station = useRef<THREE.Group>(null);
  const robot = useRef<CharacterHandle>(null);
  const fox = useRef<CharacterHandle>(null);
  const beat = useRef<CrewBeat | null>(null);
  const isMobile = useDrift((s) => s.isMobile);
  useCull(station, [0, 0, -32], 20);

  // Clip triggers fire only when the beat changes.
  useFrame(() => {
    const next = crewBeatAt(frameState.p);
    if (next === beat.current || !robot.current || !fox.current) return;
    beat.current = next;
    robot.current.setBase(ROBOT_BASE[next]);
    fox.current.setBase(FOX_BASE[next]);
    if (next === "a") robot.current.playOnce("Wave");
  });

  return (
    <group ref={station}>
      <GlowSprite
        color="#7B61FF"
        position={[0, 1.5, -46]}
        scale={[38, 22, 1]}
        opacity={0.35}
        fade={NEBULA_FADE}
      />
      <GlowSprite
        color="#4DE1FF"
        position={[-9, 3, -48]}
        scale={14}
        opacity={0.18}
        fade={NEBULA_FADE}
      />
      <group position={place(PLACES.robot, isMobile)}>
        <Character
          ref={robot}
          url={MODEL_URLS.robot}
          height={2}
          defaultClip="Idle"
          rotationY={0.35}
          onOver={(e) => {
            e.stopPropagation();
            hoverOn();
            robot.current?.playOnce("ThumbsUp");
          }}
          onOut={hoverOff}
          onTap={() => robot.current?.playOnce("ThumbsUp")}
        />
      </group>
      <group position={place(PLACES.fox, isMobile)}>
        <Character
          ref={fox}
          url={MODEL_URLS.fox}
          height={1.2}
          defaultClip="Survey"
          rotationY={-2.3}
          onOver={(e) => {
            e.stopPropagation();
            hoverOn();
            fox.current?.playFor("Run", 2000);
          }}
          onOut={hoverOff}
          onTap={() => fox.current?.playFor("Run", 2000)}
        />
      </group>
    </group>
  );
}
