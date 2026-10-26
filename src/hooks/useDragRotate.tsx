import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Rotation state shared between DOM pointer handlers and the render loop. */
export interface DragRotateState {
  quaternion: THREE.Quaternion;
  velocity: THREE.Vector2;
  dragging: boolean;
}

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const SPEED = 0.0085;
const turn = new THREE.Quaternion();

/** Spins the quaternion by a screen-space delta: horizontal drags turn about the vertical axis, vertical drags tumble forward/back. */
export function applyScreenRotation(quaternion: THREE.Quaternion, dx: number, dy: number) {
  quaternion.premultiply(turn.setFromAxisAngle(Y_AXIS, dx * SPEED));
  quaternion.premultiply(turn.setFromAxisAngle(X_AXIS, dy * SPEED));
}

/**
 * Lets the user grab an object and rotate it freely in every direction — left, right, up, down,
 * all the way round — like a trackball, with momentum after a flick.
 */
export function useDragRotate(element: React.RefObject<HTMLElement | null>) {
  const state = useRef<DragRotateState>({ quaternion: new THREE.Quaternion(), velocity: new THREE.Vector2(), dragging: false });

  useEffect(() => {
    const el = element.current;
    if (!el) return;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      el.setPointerCapture(event.pointerId);
      state.current.dragging = true;
      state.current.velocity.set(0, 0);
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = performance.now();
    };
    const move = (event: PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      applyScreenRotation(s.quaternion, dx, dy);
      const dt = Math.max((now - lastT) / 1000, 0.008);
      s.velocity.set(dx / dt, dy / dt);
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = now;
    };
    const up = (event: PointerEvent) => {
      const s = state.current;
      if (!s.dragging) return;
      if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
      // Only a flick keeps spinning; a slow release stops where it is.
      if (performance.now() - lastT > 80) s.velocity.set(0, 0);
      s.velocity.clampLength(0, 1600);
      s.dragging = false;
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [element]);

  return state;
}

/** Applies a drag-rotation state (plus optional idle auto-spin) to its children every frame. */
export const DragRotateGroup: React.FC<{
  state: React.RefObject<DragRotateState>;
  autoRotate?: boolean;
  position?: [number, number, number];
  onFrame?: (quaternion: THREE.Quaternion) => void;
  children: React.ReactNode;
}> = ({ state, autoRotate = false, position, onFrame, children }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    const s = state.current;
    if (!s.dragging) {
      if (s.velocity.lengthSq() > 1) {
        applyScreenRotation(s.quaternion, s.velocity.x * delta, s.velocity.y * delta);
        s.velocity.multiplyScalar(Math.exp(-delta * 3));
      } else if (autoRotate) {
        applyScreenRotation(s.quaternion, 55 * delta, 0);
      }
    }
    group.current?.quaternion.copy(s.quaternion);
    onFrame?.(s.quaternion);
  });
  return <group ref={group} position={position}>{children}</group>;
};
