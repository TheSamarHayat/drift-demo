import { useAnimations, useGLTF } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";
import { useEffect, useImperativeHandle, useMemo, useRef, type ReactNode, type Ref } from "react";
import * as THREE from "three";
import { clone as skeletonClone } from "three/examples/jsm/utils/SkeletonUtils.js";

export interface CharacterHandle {
  /** Change the looping base clip (cross-fades). */
  setBase: (name: string) => void;
  /** Play a clip once, then return to the base clip. */
  playOnce: (name: string) => void;
  /** Play a looping clip for `ms`, then return to the base clip. */
  playFor: (name: string, ms: number) => void;
  group: THREE.Group | null;
}

interface Props {
  url: string;
  /** Target height in world units (model is normalized, feet at y=0). */
  height?: number;
  /** Or a uniform scale for already-centered models. */
  scale?: number;
  center?: boolean;
  defaultClip?: string;
  rotationY?: number;
  cloneMaterials?: boolean;
  ref?: Ref<CharacterHandle>;
  onOver?: (e: ThreeEvent<PointerEvent>) => void;
  onOut?: (e: ThreeEvent<PointerEvent>) => void;
  onTap?: (e: ThreeEvent<MouseEvent>) => void;
  onScene?: (scene: THREE.Object3D) => void;
  children?: ReactNode;
}

const FADE = 0.5;
const logged = new Set<string>();

export function Character({
  url,
  height,
  scale = 1,
  center = false,
  defaultClip,
  rotationY = 0,
  cloneMaterials = false,
  ref,
  onOver,
  onOut,
  onTap,
  onScene,
  children,
}: Props) {
  const { scene, animations } = useGLTF(url);
  const group = useRef<THREE.Group>(null);

  const { model, fit } = useMemo(() => {
    const model = skeletonClone(scene);
    if (cloneMaterials) {
      model.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) m.material = (m.material as THREE.Material).clone();
      });
    }
    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model, true);
    const size = box.getSize(new THREE.Vector3());
    const s = height ? height / size.y : scale;
    const c = box.getCenter(new THREE.Vector3());
    const offset = center
      ? new THREE.Vector3(-c.x * s, -c.y * s, -c.z * s)
      : new THREE.Vector3(-c.x * s, -box.min.y * s, -c.z * s);
    return { model, fit: { s, offset } };
  }, [scene, height, scale, center, cloneMaterials]);

  useEffect(() => onScene?.(model), [model, onScene]);

  const { actions, mixer } = useAnimations(animations, group);
  const current = useRef<string | null>(null);
  const base = useRef<string | undefined>(defaultClip);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const oneShot = useRef<string | null>(null);

  const fadeTo = (name: string, once = false) => {
    const next = actions[name];
    if (!next) {
      if (animations.length)
        console.warn(`[DRIFT] clip "${name}" not found. Available:`, Object.keys(actions));
      return;
    }
    if (current.current === name && !once) return;
    const prev = current.current ? actions[current.current] : null;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.enabled = true;
    next.setEffectiveWeight(1);
    if (prev && prev !== next) next.crossFadeFrom(prev, FADE, false);
    else next.fadeIn(FADE);
    next.play();
    current.current = name;
    oneShot.current = once ? name : null;
  };

  useEffect(() => {
    if (animations.length && !logged.has(url)) {
      logged.add(url);
      console.info("[DRIFT] clips:", Object.keys(actions));
    }
    if (defaultClip) fadeTo(defaultClip);
    const onFinished = (e: { action: THREE.AnimationAction }) => {
      if (oneShot.current && e.action === actions[oneShot.current] && base.current) {
        oneShot.current = null;
        fadeTo(base.current);
      }
    };
    mixer.addEventListener("finished", onFinished);
    return () => {
      mixer.removeEventListener("finished", onFinished);
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, mixer]);

  useImperativeHandle(ref, () => ({
    group: group.current,
    setBase(name) {
      base.current = name;
      if (timer.current) clearTimeout(timer.current);
      fadeTo(name);
    },
    playOnce(name) {
      if (timer.current) clearTimeout(timer.current);
      fadeTo(name, true);
    },
    playFor(name, ms) {
      if (timer.current) clearTimeout(timer.current);
      fadeTo(name);
      timer.current = setTimeout(() => base.current && fadeTo(base.current), ms);
    },
  }));

  return (
    <group
      rotation-y={rotationY}
      {...(onOver ? { onPointerOver: onOver } : {})}
      {...(onOut ? { onPointerOut: onOut } : {})}
      {...(onTap ? { onClick: onTap } : {})}
    >
      <group ref={group} position={fit.offset} scale={fit.s}>
        <primitive object={model} />
      </group>
      {children}
    </group>
  );
}
