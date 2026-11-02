"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, OrbitControls } from "@react-three/drei";
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Flavor } from "@/lib/flavors";

type RotationTarget = { value: number; paused?: boolean };
type CameraTarget = { value: number; paused?: boolean };

function createLabelTexture(flavor: Flavor) {
  const canvas = document.createElement("canvas");
  canvas.width = 2048;
  canvas.height = 1024;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the can label texture.");

  const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, flavor.color);
  gradient.addColorStop(0.35, flavor.accent);
  gradient.addColorStop(0.54, flavor.color);
  gradient.addColorStop(1, flavor.color);
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  [512, 1536].forEach((center) => {
    const foil = context.createLinearGradient(center - 310, 0, center + 310, 0);
    foil.addColorStop(0, "rgba(255,255,255,0)");
    foil.addColorStop(0.48, "rgba(255,255,255,.1)");
    foil.addColorStop(0.52, "rgba(255,255,255,.16)");
    foil.addColorStop(1, "rgba(255,255,255,0)");
    context.fillStyle = foil;
    context.fillRect(center - 310, 0, 620, canvas.height);
    context.textAlign = "center";
    context.shadowColor = "rgba(68,40,31,.12)";
    context.shadowBlur = 7;
    context.shadowOffsetY = 3;
    context.fillStyle = "#fff9ee";
    context.font = "900 64px Arial, sans-serif";
    context.letterSpacing = "14px";
    context.fillText("SOLSTICE", center, 190);
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
    context.font = "700 18px Arial, sans-serif";
    context.letterSpacing = "7px";
    context.fillText("GOOD ENERGY, ALL DAY", center, 228);
    context.fillStyle = "rgba(255,249,238,.32)";
    context.font = "italic 500 54px Georgia, serif";
    context.letterSpacing = "-2px";
    context.fillText("a brighter kind of buzz", center, 392);
    context.fillStyle = "#fff9ee";
    context.font = "900 77px Arial, sans-serif";
    context.letterSpacing = "-2px";
    context.fillText(flavor.name.toUpperCase(), center, 527, 470);
    context.font = "900 118px Arial, sans-serif";
    context.letterSpacing = "-7px";
    context.fillText("ENERGY", center, 659);
    context.font = "700 19px Arial, sans-serif";
    context.letterSpacing = "6px";
    context.fillText("SPARKLING  ·  250 ML", center, 719);
    context.strokeStyle = "rgba(255,249,238,.4)";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(center - 103, 763);
    context.lineTo(center + 103, 763);
    context.stroke();
    context.fillStyle = "rgba(255,249,238,.9)";
    context.font = "700 17px Arial, sans-serif";
    context.letterSpacing = "5px";
    context.fillText("80 MG  ·  GREEN TEA", center, 797);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 12;
  texture.needsUpdate = true;
  return texture;
}

const bodyProfile = [
  new THREE.Vector2(0.44, -1.445),
  new THREE.Vector2(0.472, -1.425),
  new THREE.Vector2(0.467, -1.365),
  new THREE.Vector2(0.477, -1.31),
  new THREE.Vector2(0.508, -1.235),
  new THREE.Vector2(0.523, -1.15),
  new THREE.Vector2(0.523, 1.08),
  new THREE.Vector2(0.515, 1.16),
  new THREE.Vector2(0.486, 1.235),
  new THREE.Vector2(0.458, 1.32),
  new THREE.Vector2(0.454, 1.39),
  new THREE.Vector2(0.438, 1.425),
];

function radiusAt(height: number) {
  for (let index = 0; index < bodyProfile.length - 1; index += 1) {
    const lower = bodyProfile[index];
    const upper = bodyProfile[index + 1];
    if (height < lower.y || height > upper.y) continue;
    const progress = (height - lower.y) / (upper.y - lower.y);
    return THREE.MathUtils.lerp(lower.x, upper.x, progress) + 0.0025;
  }
  return bodyProfile[bodyProfile.length - 1].x + 0.0025;
}

const labelProfile = Array.from({ length: 65 }, (_, index) => {
  const y = THREE.MathUtils.lerp(-1.16, 1.16, index / 64);
  return new THREE.Vector2(radiusAt(y), y);
});

function createPullTabGeometry() {
  const outline = new THREE.Shape();
  outline.absellipse(0, 0, 0.088, 0.175, 0, Math.PI * 2, false, 0);
  const opening = new THREE.Path();
  opening.absellipse(0, 0.05, 0.042, 0.067, 0, Math.PI * 2, true, 0);
  outline.holes.push(opening);
  return new THREE.ExtrudeGeometry(outline, {
    depth: 0.012,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.008,
    bevelThickness: 0.006,
  });
}

function Condensation() {
  const droplets = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (!droplets.current) return;
    let seed = 5391;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let index = 0; index < 60; index += 1) {
      const y = -1.08 + random() * 2.12;
      const angle = random() * Math.PI * 2;
      const radius = y > 0.98 || y < -0.98 ? 0.515 : 0.528;
      const size = 0.0045 + random() * 0.0055;
      dummy.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      dummy.rotation.set(random() * 0.35, angle, random() * 0.2);
      dummy.scale.set(size * (0.72 + random() * 0.45), size * (1.15 + random() * 1.2), size * 0.72);
      dummy.updateMatrix();
      droplets.current.setMatrixAt(index, dummy.matrix);
    }

    droplets.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <instancedMesh ref={droplets} args={[geometry, undefined, 60]} frustumCulled>
      <meshPhysicalMaterial color="#eaf0ed" metalness={0.08} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.12} />
    </instancedMesh>
  );
}

function Can({ flavor, rotationTarget, interactive, reducedMotion }: { flavor: Flavor; rotationTarget: RotationTarget; interactive: boolean; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const label = useMemo(() => createLabelTexture(flavor), [flavor]);
  const bodyGeometry = useMemo(() => new THREE.LatheGeometry(bodyProfile, 128), []);
  const labelGeometry = useMemo(() => new THREE.LatheGeometry(labelProfile, 128), []);
  const pullTabGeometry = useMemo(() => createPullTabGeometry(), []);

  useEffect(
    () => () => {
      label.dispose();
      bodyGeometry.dispose();
      labelGeometry.dispose();
      pullTabGeometry.dispose();
    },
    [bodyGeometry, label, labelGeometry, pullTabGeometry],
  );

  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = Math.PI / 2 + rotationTarget.value + (reducedMotion || rotationTarget.paused ? 0 : clock.elapsedTime * 0.14);
  });

  return (
    <>
      <Float speed={reducedMotion ? 0 : 0.75} rotationIntensity={reducedMotion ? 0 : 0.018} floatIntensity={reducedMotion ? 0 : 0.12}>
        <group ref={group} scale={1.06}>
          <mesh geometry={bodyGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial color="#b8bbb9" metalness={0.96} roughness={0.2} clearcoat={0.52} clearcoatRoughness={0.18} envMapIntensity={1.7} />
          </mesh>
          <mesh geometry={labelGeometry} castShadow receiveShadow>
            <meshPhysicalMaterial map={label} metalness={0.38} roughness={0.3} clearcoat={0.92} clearcoatRoughness={0.16} envMapIntensity={1.55} />
          </mesh>
          <mesh castShadow receiveShadow position={[0, 1.409, 0]}>
            <cylinderGeometry args={[0.439, 0.439, 0.026, 96]} />
            <meshPhysicalMaterial color="#bfc2c0" metalness={0.98} roughness={0.18} clearcoat={0.65} />
          </mesh>
          <mesh position={[0, 1.426, 0]}>
            <cylinderGeometry args={[0.326, 0.326, 0.008, 72]} />
            <meshPhysicalMaterial color="#8f9492" metalness={0.96} roughness={0.25} />
          </mesh>
          <mesh position={[0, 1.431, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.285, 64]} />
            <meshPhysicalMaterial color="#c9ccca" metalness={0.96} roughness={0.24} />
          </mesh>
          <mesh position={[0, 1.438, 0.08]} rotation={[-Math.PI / 2, 0, 0]} scale={[0.105, 0.19, 1]}>
            <circleGeometry args={[1, 48]} />
            <meshStandardMaterial color="#424846" metalness={0.72} roughness={0.3} />
          </mesh>
          <mesh geometry={pullTabGeometry} position={[0, 1.442, -0.025]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
            <meshPhysicalMaterial color="#e1e2df" metalness={0.98} roughness={0.16} clearcoat={0.8} />
          </mesh>
          <mesh castShadow position={[0, 1.421, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.444, 0.024, 14, 112]} />
            <meshPhysicalMaterial color="#f0f0eb" metalness={1} roughness={0.14} clearcoat={0.7} />
          </mesh>
          <mesh position={[0, 1.385, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.446, 0.009, 10, 112]} />
            <meshStandardMaterial color="#737977" metalness={0.98} roughness={0.24} />
          </mesh>
          <mesh castShadow position={[0, -1.414, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.456, 0.03, 14, 112]} />
            <meshPhysicalMaterial color="#d9dbd8" metalness={1} roughness={0.16} clearcoat={0.75} />
          </mesh>
          <mesh position={[0, -1.37, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.469, 0.009, 10, 112]} />
            <meshStandardMaterial color="#737977" metalness={0.98} roughness={0.22} />
          </mesh>
          <Condensation />
        </group>
      </Float>
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI * 0.32}
          maxPolarAngle={Math.PI * 0.68}
          rotateSpeed={0.65}
          onStart={() => {
            rotationTarget.paused = true;
          }}
          onEnd={() => {
            rotationTarget.paused = false;
          }}
        />
      )}
    </>
  );
}

function ProductCamera({ target }: { target?: CameraTarget }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    if (!target || target.paused) return;
    const progress = target.value;
    const desiredPosition = new THREE.Vector3(
      Math.sin(progress * Math.PI) * 0.28,
      0.08 + Math.sin(progress * Math.PI) * 0.1,
      5.7 - Math.sin(progress * Math.PI) * 0.42,
    );
    camera.position.lerp(desiredPosition, 1 - Math.exp(-delta * 2.8));
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function CanScene({
  flavor,
  rotationTarget,
  cameraTarget,
  interactive = false,
  className = "",
}: {
  flavor: Flavor;
  rotationTarget: RotationTarget;
  cameraTarget?: CameraTarget;
  interactive?: boolean;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin: "100px" },
    );
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={`can-canvas ${className}`} aria-label={`${flavor.name} Solstice energy can, rendered in 3D`} role="img">
      <Canvas frameloop={isVisible ? "always" : "never"} shadows dpr={[1, 1.4]} camera={{ position: [0, 0.08, 5.7], fov: 34 }} gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}>
        <Suspense fallback={null}>
          <Environment resolution={256} background={false} blur={0.65}>
            <Lightformer form="rect" intensity={4.5} color="#fff8e9" position={[-3.4, 2.1, 3.2]} scale={[2.8, 5, 1]} />
            <Lightformer form="rect" intensity={3.2} color={flavor.accent} position={[3.1, 0.8, 2.7]} scale={[1.5, 4.5, 1]} />
            <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0.2, 4.4, -1.5]} scale={[3.5, 1, 1]} />
            <Lightformer form="rect" intensity={2.1} color="#f0f3ff" position={[-4, -0.7, -2]} scale={[1.1, 4, 1]} />
            <Lightformer form="ring" intensity={1.3} color="#fff0d6" position={[0, -3.1, 1]} scale={3.2} />
          </Environment>
          <ambientLight intensity={0.45} />
          <hemisphereLight args={["#fff7ec", "#36363b", 0.8]} />
          <spotLight position={[3.4, 5, 4]} angle={0.42} penumbra={0.8} intensity={70} color="#fff3df" castShadow shadow-mapSize={[1024, 1024]} />
          <spotLight position={[-4, 1.3, -2.8]} angle={0.56} penumbra={0.72} intensity={52} color={flavor.accent} />
          <ProductCamera target={cameraTarget} />
          <Can flavor={flavor} rotationTarget={rotationTarget} interactive={interactive} reducedMotion={reducedMotion} />
          <ContactShadows position={[0, -1.83, 0]} opacity={0.44} scale={3.4} blur={2.2} far={3.5} resolution={256} color="#383129" />
        </Suspense>
      </Canvas>
    </div>
  );
}
