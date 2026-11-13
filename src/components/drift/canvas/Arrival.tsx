import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { MODEL_URLS } from "@/lib/drift/models";
import { PLACES, place } from "@/lib/drift/poses";
import { useDrift } from "@/lib/drift/store";
import { Character, type CharacterHandle } from "./Character";
import { GlowSprite } from "./GlowSprite";
import { hoverOff, hoverOn, useCull } from "./helpers";
import { useSpin } from "./Ignition";

const SUN_FADE = { from: [0, 0, -110] as [number, number, number], near: 9, far: 22 };

export function Arrival() {
  const station = useRef<THREE.Group>(null);
  const astro = useRef<THREE.Group>(null);
  const helmet = useRef<THREE.Group>(null);
  const robot = useRef<CharacterHandle>(null);
  const fox = useRef<CharacterHandle>(null);
  const spin = useSpin();
  const isMobile = useDrift((s) => s.isMobile);
  const A = PLACES.arrival;
  useCull(station, [0, 0, -110], 30);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (astro.current) {
      astro.current.position.y = Math.sin(t * 1.1) * 0.06;
      astro.current.rotation.y = Math.sin(t * 0.3) * 0.3 + spin.offset();
    }
    if (helmet.current) {
      helmet.current.rotation.y = t * 0.4;
      helmet.current.position.y = Math.sin(t * 0.9) * 0.12;
    }
  });

  return (
    <group ref={station}>
      {/* Ground planet */}
      <mesh position={A.ground}>
        <sphereGeometry args={[40, 96, 96]} />
        <meshStandardMaterial color="#3a1c22" roughness={0.95} metalness={0} />
      </mesh>
      {/* Sunrise horizon */}
      <GlowSprite
        color="#FF6B35"
        position={[0, -1.5, -150]}
        scale={[140, 30, 1]}
        opacity={0.9}
        fade={SUN_FADE}
      />
      <GlowSprite
        color="#FF9A5C"
        position={[0, 2, -148]}
        scale={30}
        opacity={0.8}
        fade={SUN_FADE}
      />

      <group position={place(A.astronaut, isMobile)}>
        <group ref={astro}>
          <Character
            url={MODEL_URLS.astronaut}
            height={2}
            onOver={(e) => {
              e.stopPropagation();
              hoverOn();
              spin.trigger();
            }}
            onOut={hoverOff}
            onTap={spin.trigger}
          />
        </group>
      </group>
      <group position={place(A.robot, isMobile)}>
        <Character
          ref={robot}
          url={MODEL_URLS.robot}
          height={1.9}
          defaultClip="Dance"
          rotationY={0.4}
          onOver={(e) => {
            e.stopPropagation();
            hoverOn();
            robot.current?.playOnce("ThumbsUp");
          }}
          onOut={hoverOff}
          onTap={() => robot.current?.playOnce("ThumbsUp")}
        />
      </group>
      <group position={place(A.fox, isMobile)}>
        <Character
          ref={fox}
          url={MODEL_URLS.fox}
          height={1.1}
          defaultClip="Run"
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
      <group position={place(A.helmet, isMobile)}>
        <group ref={helmet}>
          <Character url={MODEL_URLS.helmet} scale={0.5} center />
        </group>
      </group>
    </group>
  );
}
