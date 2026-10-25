import React, { useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { useInView } from 'framer-motion';
import * as THREE from 'three';
import { RotateCw, Layers, Crosshair, Maximize2 } from 'lucide-react';
import styles from './ScannerTarget3D.module.css';

interface TargetBoneDef {
  id: string;
  label: string;
  name: string;
  latin: string;
  region: Region;
  scaleFactor: number;
}

type Region = 'Lower limb' | 'Upper limb' | 'Spine & trunk' | 'Head';
const REGIONS: Region[] = ['Lower limb', 'Upper limb', 'Spine & trunk', 'Head'];

const TARGET_BONES: TargetBoneDef[] = [
  { id: 'Femur.r', label: 'Femur', name: 'Right Femur', latin: 'Os femoris dexter', region: 'Lower limb', scaleFactor: 2.3 },
  { id: 'Tibia.r', label: 'Tibia', name: 'Right Tibia', latin: 'Tibia dextra', region: 'Lower limb', scaleFactor: 2.3 },
  { id: 'Fibula.r', label: 'Fibula', name: 'Right Fibula', latin: 'Fibula dextra', region: 'Lower limb', scaleFactor: 2.3 },
  { id: 'Patella.r', label: 'Patella', name: 'Right Patella', latin: 'Patella dextra', region: 'Lower limb', scaleFactor: 1.5 },
  { id: 'Calcaneus.r', label: 'Calcaneus', name: 'Right Calcaneus', latin: 'Calcaneus dexter', region: 'Lower limb', scaleFactor: 1.45 },
  { id: 'Humerus.r', label: 'Humerus', name: 'Right Humerus', latin: 'Humerus dexter', region: 'Upper limb', scaleFactor: 2.2 },
  { id: 'Radius.r', label: 'Radius', name: 'Right Radius', latin: 'Radius dexter', region: 'Upper limb', scaleFactor: 2.1 },
  { id: 'Ulna.r', label: 'Ulna', name: 'Right Ulna', latin: 'Ulna dextra', region: 'Upper limb', scaleFactor: 2.1 },
  { id: 'Scapula.r', label: 'Scapula', name: 'Right Scapula', latin: 'Scapula dextra', region: 'Upper limb', scaleFactor: 2.0 },
  { id: 'Clavicle.r', label: 'Clavicle', name: 'Right Clavicle', latin: 'Clavicula dextra', region: 'Upper limb', scaleFactor: 2.0 },
  { id: 'Hip bone.r', label: 'Hip bone', name: 'Right Hip Bone', latin: 'Os coxae dextrum', region: 'Spine & trunk', scaleFactor: 1.8 },
  { id: 'Sacrum', label: 'Sacrum', name: 'Sacrum', latin: 'Os sacrum', region: 'Spine & trunk', scaleFactor: 1.55 },
  { id: 'Vertebra L3', label: 'L3', name: 'Lumbar Vertebra L3', latin: 'Vertebra lumborum III', region: 'Spine & trunk', scaleFactor: 1.3 },
  { id: 'Atlas (C1)', label: 'Atlas C1', name: 'Atlas (C1)', latin: 'Atlas', region: 'Spine & trunk', scaleFactor: 1.35 },
  { id: 'First rib.r', label: '1st rib', name: 'Right First Rib', latin: 'Costa prima dextra', region: 'Spine & trunk', scaleFactor: 1.8 },
  { id: 'Mandible', label: 'Mandible', name: 'Mandible', latin: 'Mandibula', region: 'Head', scaleFactor: 1.85 },
  { id: 'Frontal bone', label: 'Frontal', name: 'Frontal Bone', latin: 'Os frontale', region: 'Head', scaleFactor: 1.5 },
  { id: 'Occipital bone', label: 'Occipital', name: 'Occipital Bone', latin: 'Os occipitale', region: 'Head', scaleFactor: 1.5 },
  { id: 'Hyoid bone', label: 'Hyoid', name: 'Hyoid Bone', latin: 'Os hyoideum', region: 'Head', scaleFactor: 1.5 },
];

const normalize = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

interface BoneMeshProps {
  boneDef: TargetBoneDef;
  isWireframe: boolean;
  yawRef: React.RefObject<HTMLSpanElement | null>;
  pitchRef: React.RefObject<HTMLSpanElement | null>;
}

const BoneMesh: React.FC<BoneMeshProps> = ({ boneDef, isWireframe, yawRef, pitchRef }) => {
  const { scene } = useGLTF('/anatomy/skeletal_male.glb', '/draco/gltf/');
  const groupRef = useRef<THREE.Group>(null);
  const lastReadout = useRef({ pitch: NaN, yaw: NaN });

  const { model, center, scale } = useMemo(() => {
    const cloned = scene.clone(true);
    const targetNodes = new Set<THREE.Object3D>();

    cloned.traverse((obj) => {
      if (normalize(obj.name) === normalize(boneDef.id)) {
        targetNodes.add(obj);
      }
    });

    cloned.traverse((obj) => {
      if (!(obj instanceof THREE.Mesh)) return;
      let parent: THREE.Object3D | null = obj;
      let belongs = false;
      while (parent && !belongs) {
        belongs = targetNodes.has(parent);
        parent = parent.parent;
      }
      obj.visible = belongs;
      if (belongs) {
        if (isWireframe) {
          obj.material = new THREE.MeshBasicMaterial({
            color: '#d4af37',
            wireframe: true,
            transparent: true,
            opacity: 0.9,
          });
        } else {
          obj.material = new THREE.MeshStandardMaterial({
            color: '#edf2f7',
            roughness: 0.35,
            metalness: 0.12,
            flatShading: false,
          });
        }
      }
    });

    cloned.updateMatrixWorld(true);
    const bounds = new THREE.Box3();
    cloned.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.visible) bounds.expandByObject(obj);
    });

    const centerVec = bounds.isEmpty() ? new THREE.Vector3() : bounds.getCenter(new THREE.Vector3());
    const largestSide = Math.max(...bounds.getSize(new THREE.Vector3()).toArray());
    const finalScale = largestSide > 0 ? boneDef.scaleFactor / largestSide : 1;

    return { model: cloned, center: centerVec, scale: finalScale };
  }, [scene, boneDef, isWireframe]);

  // Free the per-bone materials when the specimen or display mode changes.
  useEffect(() => () => {
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh && obj.visible) (obj.material as THREE.Material).dispose();
    });
  }, [model]);

  // Write the telemetry straight to the DOM so orbiting never re-renders React.
  useFrame((state) => {
    const rot = state.camera.rotation;
    const pitch = Math.round(THREE.MathUtils.radToDeg(rot.x));
    const yaw = Math.round(THREE.MathUtils.radToDeg(rot.y));
    if (pitch !== lastReadout.current.pitch && pitchRef.current) pitchRef.current.textContent = `${pitch}°`;
    if (yaw !== lastReadout.current.yaw && yawRef.current) yawRef.current.textContent = `${yaw}°`;
    lastReadout.current = { pitch, yaw };
  });

  return (
    <group ref={groupRef} scale={scale}>
      <group position={center.clone().multiplyScalar(-1)}>
        <primitive object={model} />
      </group>
    </group>
  );
};

export const ScannerTarget3D: React.FC = () => {
  const [selectedBone, setSelectedBone] = useState<TargetBoneDef>(TARGET_BONES[0]);
  const [region, setRegion] = useState<Region>(TARGET_BONES[0].region);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const yawRef = useRef<HTMLSpanElement>(null);
  const pitchRef = useRef<HTMLSpanElement>(null);
  const visible = useInView(containerRef, { margin: '80px 0px' });

  return (
    <div ref={containerRef} className={styles.scannerContainer}>
      {/* Corner Bracket Accents */}
      <div className={styles.cornerTL} />
      <div className={styles.cornerTR} />
      <div className={styles.cornerBL} />
      <div className={styles.cornerBR} />

      {/* Top HUD Telemetry */}
      <div className={styles.hudHeader}>
        <div className={styles.hudStatus}>
          <span className={styles.beaconDot} />
          <span>SCANNER ACTIVE · TARGET LOCKED</span>
        </div>
        <div className={styles.hudTargetInfo}>
          <span>ANATOMY:</span>
          <span className={styles.targetNameHighlight}>{selectedBone.name.toUpperCase()}</span>
          <span style={{ color: '#d4af37', marginLeft: 8 }}>[{selectedBone.region.toUpperCase()}]</span>
        </div>
      </div>

      {/* Sweeping Laser Scanline */}
      <div className={styles.scanline} />

      {/* Interactive 3D Canvas */}
      <div className={styles.canvasWrapper}>
        <Canvas frameloop={visible ? 'always' : 'never'} camera={{ position: [0, 0.2, 3.6], fov: 38 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
          <ambientLight intensity={0.7} />
          {/* Main Key Light */}
          <directionalLight position={[2, 3, 3]} intensity={1.4} color="#ffffff" />
          {/* Gold Rim Light */}
          <directionalLight position={[-3, -2, -2]} intensity={2.4} color="#d4af37" />
          {/* Warm Depth Light */}
          <directionalLight position={[2, -3, -2]} intensity={1.6} color="#f1d78a" />
          {/* Top Soft Light */}
          <directionalLight position={[0, 4, 1]} intensity={0.8} color="#fff4d6" />

          <Suspense fallback={null}>
            <BoneMesh
              boneDef={selectedBone}
              isWireframe={isWireframe}
              yawRef={yawRef}
              pitchRef={pitchRef}
            />
          </Suspense>

          <OrbitControls
            enableZoom={true}
            minDistance={2.2}
            maxDistance={5.5}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={2.2}
          />
        </Canvas>
      </div>

      {/* Futuristic Reticle SVG Overlay */}
      <svg className={styles.reticleOverlay} viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet">
        {/* Outer segmented rotating compass ring */}
        <g className={styles.rotatingRing}>
          <circle cx="250" cy="250" r="195" fill="none" stroke="rgba(212, 175, 55, 0.25)" strokeWidth="1.2" strokeDasharray="8 6 2 6" />
          <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(212, 175, 55, 0.15)" strokeWidth="1" strokeDasharray="3 9" />
        </g>

        {/* Counter-rotating inner ring */}
        <g className={styles.reverseRing}>
          <circle cx="250" cy="250" r="145" fill="none" stroke="rgba(212, 175, 55, 0.3)" strokeWidth="1" strokeDasharray="14 18" />
        </g>

        {/* Static center crosshairs and targeting frame */}
        <circle cx="250" cy="250" r="105" fill="none" stroke="rgba(212, 175, 55, 0.45)" strokeWidth="1.2" />
        <circle cx="250" cy="250" r="32" fill="none" stroke="rgba(212, 175, 55, 0.55)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Precision Target Crosshairs */}
        <line x1="250" y1="40" x2="250" y2="100" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="250" y1="400" x2="250" y2="460" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="40" y1="250" x2="100" y2="250" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.7" />
        <line x1="400" y1="250" x2="460" y2="250" stroke="#d4af37" strokeWidth="1.5" strokeOpacity="0.7" />

        {/* Center Target Box */}
        <path d="M 238 238 L 244 238 M 238 238 L 238 244" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M 262 238 L 256 238 M 262 238 L 262 244" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M 238 262 L 244 262 M 238 262 L 238 256" fill="none" stroke="#d4af37" strokeWidth="1.5" />
        <path d="M 262 262 L 256 262 M 262 262 L 262 256" fill="none" stroke="#d4af37" strokeWidth="1.5" />

        {/* Compass Degree Markers */}
        <text x="250" y="32" fill="#d4af37" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">000°</text>
        <text x="475" y="254" fill="#d4af37" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">090°</text>
        <text x="250" y="480" fill="#d4af37" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">180°</text>
        <text x="25" y="254" fill="#d4af37" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">270°</text>
      </svg>

      {/* Bottom HUD & Interactive Controls */}
      <div className={styles.hudFooter}>
        <div className={styles.telemetryRow}>
          <div>
            <span>REF: </span>
            <span className={styles.coordsReadout}>{selectedBone.latin.toUpperCase()}</span>
          </div>
          <div>
            <span>AZIMUTH: </span>
            <span ref={yawRef} className={styles.coordsReadout}>0°</span>
            <span style={{ marginLeft: 10 }}>ELEVATION: </span>
            <span ref={pitchRef} className={styles.coordsReadout}>0°</span>
          </div>
          <div>
            <span style={{ color: '#b5ae9f' }}>DRAG TO ORBIT 3D</span>
          </div>
        </div>

        <div className={styles.controlsRow}>
          {/* Target Anatomy Switcher */}
          <div className={styles.boneChips}>
            <div className={styles.regionTabs} role="tablist" aria-label="Body region">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={region === r}
                  className={`${styles.regionTab} ${region === r ? styles.regionTabActive : ''}`}
                  onClick={() => { setRegion(r); setSelectedBone(TARGET_BONES.find((bone) => bone.region === r)!); }}
                >
                  {r}
                </button>
              ))}
            </div>
            {TARGET_BONES.filter((bone) => bone.region === region).map((bone) => (
              <button
                key={bone.id}
                type="button"
                className={`${styles.boneChip} ${selectedBone.id === bone.id ? styles.boneChipActive : ''}`}
                onClick={() => setSelectedBone(bone)}
                title={`Inspect ${bone.name}`}
              >
                {bone.label}
              </button>
            ))}
          </div>

          {/* Action buttons */}
          <div className={styles.actionButtons}>
            <button
              type="button"
              className={`${styles.hudButton} ${isWireframe ? styles.hudButtonActive : ''}`}
              onClick={() => setIsWireframe((prev) => !prev)}
              title="Toggle Holographic Wireframe"
            >
              <Layers size={13} />
              <span>{isWireframe ? 'Wireframe' : 'Solid Scan'}</span>
            </button>
            <button
              type="button"
              className={`${styles.hudButton} ${autoRotate ? styles.hudButtonActive : ''}`}
              onClick={() => setAutoRotate((prev) => !prev)}
              title="Toggle Auto-Rotation"
            >
              <RotateCw size={13} />
              <span>{autoRotate ? 'Rotating' : 'Paused'}</span>
            </button>
            <a
              className={`${styles.hudButton} ${styles.hudButtonExpand}`}
              href={`#/bone-explorer/${encodeURIComponent(selectedBone.id)}`}
              title="Open this bone full screen in the Bone Explorer"
            >
              <Maximize2 size={13} />
              <span>Full screen</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerTarget3D;
