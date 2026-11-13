import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { DESKTOP_FOV, MOBILE, POSES, type Pose } from "@/lib/drift/poses";
import { frameState, velocityMV } from "@/lib/drift/scroll";
import { useDrift } from "@/lib/drift/store";
import { segE, segmentByIndex, type StationId } from "@/lib/drift/timeline";

function resolvePose(id: StationId, mobile: boolean) {
  const p: Pose = POSES[id];
  const look = new THREE.Vector3(...p.look);
  const pos = new THREE.Vector3(...p.pos);
  if (mobile) {
    look.y += MOBILE.yLift * 0.5;
    pos.sub(look).multiplyScalar(MOBILE.pullBack).add(look);
  } else if (p.shift) {
    const right = new THREE.Vector3()
      .subVectors(look, pos)
      .cross(new THREE.Vector3(0, 1, 0))
      .normalize();
    look.addScaledVector(right, -p.shift);
  }
  return { pos, look };
}

export function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const isMobile = useDrift((s) => s.isMobile);
  const reduced = useDrift((s) => s.reducedMotion);

  const poses = useMemo(() => {
    const out = {} as Record<StationId, { pos: THREE.Vector3; look: THREE.Vector3 }>;
    (Object.keys(POSES) as StationId[]).forEach((k) => (out[k] = resolvePose(k, isMobile)));
    return out;
  }, [isMobile]);

  const tmp = useMemo(
    () => ({
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      prev: new THREE.Vector3(),
      par: new THREE.Vector2(),
    }),
    [],
  );
  const speed = useRef(0);
  const first = useRef(true);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const p = frameState.p;
    const s = segmentByIndex(frameState.segIndex);
    const t = segE(p, s.from, s.to);
    const A = poses[s.pose[0]];
    const B = poses[s.pose[1]];
    tmp.pos.lerpVectors(A.pos, B.pos, t);
    tmp.look.lerpVectors(A.look, B.look, t);

    const baseFov = isMobile ? MOBILE.fov : DESKTOP_FOV;
    let fov = baseFov;
    let roll = 0;
    if (s.type === "travel") {
      const arc = Math.sin(t * Math.PI);
      tmp.pos.x += arc * 1.5;
      if (s.id === "travel-4") tmp.pos.y += arc * 5.2 * (1 - t * 0.25);
      if (!reduced) {
        fov = baseFov + 12 * arc;
        roll = arc * 0.04;
      }
    } else {
      const time = state.clock.elapsedTime;
      tmp.pos.x += Math.sin(time * 0.5) * 0.03;
      tmp.pos.y += Math.cos(time * 0.4) * 0.03;
    }

    // Mouse parallax (desktop only), damped.
    const wantX = !isMobile && !reduced ? state.pointer.x * 0.3 : 0;
    const wantY = !isMobile && !reduced ? state.pointer.y * 0.3 : 0;
    tmp.par.x = THREE.MathUtils.damp(tmp.par.x, wantX, 3, dt);
    tmp.par.y = THREE.MathUtils.damp(tmp.par.y, wantY, 3, dt);
    tmp.pos.x += tmp.par.x;
    tmp.pos.y += tmp.par.y;

    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);
    camera.rotateZ(roll);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    if (first.current) {
      tmp.prev.copy(tmp.pos);
      first.current = false;
    }
    const inst = tmp.pos.distanceTo(tmp.prev) / Math.max(dt, 1e-4);
    tmp.prev.copy(tmp.pos);
    speed.current = THREE.MathUtils.damp(speed.current, s.type === "travel" ? inst : 0, 4, dt);
    velocityMV.set(Math.round(speed.current * 6));
  }, -1);

  return null;
}
