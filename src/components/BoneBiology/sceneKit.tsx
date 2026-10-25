import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import styles from './BoneBiology.module.css';

export type Vec3 = [number, number, number];

export const BONE = '#e6dcc6';
export const BONE_LIGHT = '#efe6d1';
export const CARTILAGE = '#bcd4dc';
export const RED_MARROW = '#7e2a24';
export const YELLOW_MARROW = '#d9b54e';
export const ARTERY = '#b3342c';
export const VEIN = '#3b5b9a';
export const OSTEOBLAST = '#b07aa1';
export const OSTEOCLAST = '#c2708f';
export const OSTEOID = '#d39b98';
export const GOLD = '#d4af37';

// Deterministic pseudo-random numbers so the models look the same on every load.
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);

/* Labels are plain DOM nodes in an overlay above the canvas. Scenes register an anchor
   object; LabelProjector moves each node to its anchor's screen position every frame. */
export type LabelEntry = { id: number; text: React.ReactNode; left?: boolean; anchor: THREE.Object3D };
export const LabelContext = createContext<{ add: (entry: LabelEntry) => void; remove: (id: number) => void } | null>(null);
let nextLabelId = 0;

export const Label: React.FC<{ position: Vec3; children: React.ReactNode; left?: boolean }> = ({ position, children, left }) => {
  const registry = useContext(LabelContext);
  const anchor = useRef<THREE.Group>(null);
  useEffect(() => {
    if (!registry || !anchor.current) return;
    const id = ++nextLabelId;
    registry.add({ id, text: children, left, anchor: anchor.current });
    return () => registry.remove(id);
  }, [registry, children, left]);
  return <group ref={anchor} position={position} />;
};

const isShown = (object: THREE.Object3D) => {
  for (let node: THREE.Object3D | null = object; node; node = node.parent) if (!node.visible) return false;
  return true;
};

export const LabelProjector: React.FC<{ layer: React.RefObject<HTMLDivElement | null>; labels: LabelEntry[] }> = ({ layer, labels }) => {
  const v = useMemo(() => new THREE.Vector3(), []);
  useFrame(({ camera, size }) => {
    const root = layer.current;
    if (!root) return;
    for (const label of labels) {
      const node = root.querySelector<HTMLElement>(`[data-label="${label.id}"]`);
      if (!node) continue;
      v.setFromMatrixPosition(label.anchor.matrixWorld).project(camera);
      const shown = v.z < 1 && isShown(label.anchor);
      // Keep the pill inside the viewer: right-hand labels extend right of the anchor, left-hand ones extend left.
      const width = (node.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const rawX = ((v.x + 1) / 2) * size.width;
      const x = label.left ? Math.max(rawX, width + 18) : Math.min(rawX, size.width - width - 18);
      node.style.transform = `translate(${x}px, ${((1 - v.y) / 2) * size.height}px)`;
      node.style.opacity = shown ? '1' : '0';
    }
  });
  return null;
};

/** Gentle side-to-side sway so the model reads as 3D without spinning away from the cut-away. */
export const Sway: React.FC<{ children: React.ReactNode; amount?: number; speed?: number }> = ({ children, amount = 0.35, speed = 0.3 }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => { if (group.current) group.current.rotation.y = Math.sin(state.clock.elapsedTime * speed) * amount; });
  return <group ref={group}>{children}</group>;
};

