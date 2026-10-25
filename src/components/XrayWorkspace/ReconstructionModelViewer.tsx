import React, { Component, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Bounds, OrbitControls, useGLTF } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import styles from './XrayWorkspace.module.css';

function Model({ url, onLoad }: { url: string; onLoad: () => void }) {
  const { scene } = useGLTF(url);
  useEffect(() => { onLoad(); }, [scene, onLoad]);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 3 / Math.max(size.x, size.y, size.z, 0.001);
    clone.scale.setScalar(scale);
    clone.position.copy(center).multiplyScalar(-scale);
    return clone;
  }, [scene]);
  return <primitive object={model} />;
}

class ModelErrorBoundary extends Component<React.PropsWithChildren<{ onError: () => void }>, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() {
    return this.state.failed
      ? <div className={styles.modelError} role="alert">The returned GLB could not be loaded. You can still download the backend output to inspect it separately.</div>
      : this.props.children;
  }
}

export default function ReconstructionModelViewer({ url, onLoad, onError }: { url: string; onLoad: () => void; onError: () => void }) {
  const controls = useRef<OrbitControlsImpl>(null);
  const [resetVersion, setResetVersion] = useState(0);
  useEffect(() => { controls.current?.reset(); }, [url, resetVersion]);

  return <section className={styles.resultViewer} aria-label="Reconstruction model viewer">
    <div className={styles.resultViewerHeader}>
      <div><strong>Returned reconstruction</strong><span>AI-estimated educational/research output — not clinically validated</span></div>
      <button type="button" onClick={() => setResetVersion((version) => version + 1)}>Reset view</button>
    </div>
    <ModelErrorBoundary onError={onError}>
      <div className={styles.resultCanvas}>
        <Canvas camera={{ position: [0, 0.2, 4.5], fov: 38, near: 0.01, far: 100 }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={1.4} />
          <directionalLight position={[4, 5, 6]} intensity={2} />
          <Suspense fallback={<mesh><sphereGeometry args={[0.08, 12, 8]} /><meshBasicMaterial color="#8aa6a1" /></mesh>}>
            <Bounds fit clip observe margin={1.25}><Model url={url} onLoad={onLoad} /></Bounds>
          </Suspense>
          <OrbitControls ref={controls} enableDamping makeDefault />
        </Canvas>
      </div>
    </ModelErrorBoundary>
  </section>;
}
