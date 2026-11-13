import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { hoverOff, hoverOn } from "./helpers";

interface Props {
  position: THREE.Vector3Tuple;
  radius: number;
  colors: [string, string];
  atmosphere: string;
  ring?: string;
  seed?: number;
}

// Fresnel-style rim glow (rendered on the back faces of a slightly larger sphere).
const ATMO_VERT = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const ATMO_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vNormal;
  void main() {
    float i = pow(clamp(-vNormal.z, 0.0, 1.0), 1.6);
    gl_FragColor = vec4(uColor * i * uOpacity * 5.0, 1.0);
  }
`;

function bandTexture([a, b]: [string, string], seed: number) {
  const w = 512;
  const h = 256;
  const cv = document.createElement("canvas");
  cv.width = w;
  cv.height = h;
  const ctx = cv.getContext("2d")!;
  const ca = new THREE.Color(a);
  const cb = new THREE.Color(b);
  const c = new THREE.Color();
  let s = seed;
  const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  const phases = Array.from({ length: 5 }, () => rnd() * Math.PI * 2);
  for (let y = 0; y < h; y++) {
    const v = y / h;
    let n = 0;
    phases.forEach((ph, i) => (n += Math.sin(v * Math.PI * (3 + i * 4) + ph) / (i + 1)));
    const t = THREE.MathUtils.clamp(0.5 + n * 0.35, 0, 1);
    c.copy(cb).lerp(ca, t);
    ctx.fillStyle = `#${c.getHexString()}`;
    ctx.fillRect(0, y, w, 1);
  }
  // speckles / storms
  for (let i = 0; i < 260; i++) {
    ctx.globalAlpha = 0.08 + rnd() * 0.12;
    ctx.fillStyle = rnd() > 0.5 ? a : b;
    ctx.beginPath();
    ctx.ellipse(rnd() * w, rnd() * h, 4 + rnd() * 26, 1 + rnd() * 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

export function Planet({ position, radius, colors, atmosphere, ring, seed = 7 }: Props) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);
  const glow = useRef(0.18);

  const res = useMemo(() => {
    const map = bandTexture(colors, seed);
    const geo = new THREE.SphereGeometry(radius, 64, 64);
    const mat = new THREE.MeshStandardMaterial({
      map,
      roughness: 0.85,
      metalness: 0.05,
      fog: false,
    });
    const atmoGeo = new THREE.SphereGeometry(radius * 1.22, 48, 48);
    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(atmosphere) }, uOpacity: { value: 0.18 } },
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const ringGeo = ring ? new THREE.RingGeometry(radius * 1.4, radius * 2.2, 96) : null;
    const ringMat = ring
      ? new THREE.MeshBasicMaterial({
          color: ring,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
          depthWrite: false,
          fog: false,
        })
      : null;
    return { map, geo, mat, atmoGeo, atmoMat, ringGeo, ringMat };
  }, [colors, atmosphere, ring, radius, seed]);

  useEffect(
    () => () => {
      res.map.dispose();
      res.geo.dispose();
      res.mat.dispose();
      res.atmoGeo.dispose();
      res.atmoMat.dispose();
      res.ringGeo?.dispose();
      res.ringMat?.dispose();
    },
    [res],
  );

  const center = useMemo(() => new THREE.Vector3(...position), [position]);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.1);
    const h = hovered.current;
    // Fade in by distance (fully visible within 13 units, gone beyond 18).
    const fade = THREE.MathUtils.clamp((18 - camera.position.distanceTo(center)) / 5, 0, 1);
    if (group.current) group.current.visible = fade > 0.001;
    // Emerge from darkness (stays opaque, so depth sorting is stable).
    res.mat.color.setScalar(fade);
    if (res.ringMat) res.ringMat.opacity = 0.45 * fade;
    if (body.current) body.current.rotation.y += dt * 0.08;
    if (group.current) {
      const s = THREE.MathUtils.damp(group.current.scale.x, h ? 1.08 : 1, 6, dt);
      group.current.scale.setScalar(s);
    }
    glow.current = THREE.MathUtils.damp(glow.current, h ? 0.4 : 0.18, 6, dt);
    res.atmoMat.uniforms["uOpacity"]!.value = glow.current * fade;
    if (ringRef.current) ringRef.current.rotation.z += dt * (h ? 0.6 : 0.08);
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        hovered.current = true;
        hoverOn();
      }}
      onPointerOut={() => {
        hovered.current = false;
        hoverOff();
      }}
      onClick={() => (hovered.current = !hovered.current)}
    >
      <mesh ref={body} geometry={res.geo} material={res.mat} rotation-z={0.2} />
      <mesh geometry={res.atmoGeo} material={res.atmoMat} />
      {res.ringGeo && res.ringMat && (
        <group rotation-x={Math.PI / 2 - 0.4}>
          <mesh ref={ringRef} geometry={res.ringGeo} material={res.ringMat} />
        </group>
      )}
    </group>
  );
}
