"use client";

import React, { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  OrbitControls,
  RoundedBox,
  Html,
  ContactShadows,
  Sparkles,
  Line,
} from "@react-three/drei";
import * as THREE from "three";

// ============================================================
// 1. ARKA PLAN 3D PARÇACIK & DALGA AĞI
// ============================================================
function ParticleWaveField() {
  const pointsRef = useRef<THREE.Points>(null);
  const gridSize = 24;
  const separation = 0.65;

  const { positions, colors } = useMemo(() => {
    const count = gridSize * gridSize;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const color1 = new THREE.Color("#4f46e5"); // indigo-600
    const color2 = new THREE.Color("#8b5cf6"); // violet-500
    const color3 = new THREE.Color("#0ea5e9"); // sky-500

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        pos[i * 3] = (x - gridSize / 2) * separation;
        pos[i * 3 + 1] = -2.4;
        pos[i * 3 + 2] = (z - gridSize / 2) * separation - 1.5;

        const ratio = x / gridSize;
        const mixed = color1.clone().lerp(color2, ratio).lerp(color3, z / gridSize);
        col[i * 3] = mixed.r;
        col[i * 3 + 1] = mixed.g;
        col[i * 3 + 2] = mixed.b;
        i++;
      }
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current) return;
    const time = clock.getElapsedTime();
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;

    let i = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const px = (x - gridSize / 2) * separation;
        const pz = (z - gridSize / 2) * separation;
        const distToMouse = Math.sqrt(
          Math.pow(px - pointer.x * 5, 2) + Math.pow(pz - pointer.y * 5, 2)
        );
        const mouseWave = Math.max(0, 1.5 - distToMouse) * 0.35;

        const y =
          -2.4 +
          Math.sin(px * 0.45 + time * 1.2) * 0.22 +
          Math.cos(pz * 0.45 + time * 0.9) * 0.22 +
          mouseWave;

        posAttr.setY(i, y);
        i++;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.075}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

// ============================================================
// 2. İZOMETRİK AKILLI STOK KUTUSU
// ============================================================
interface SmartBoxProps {
  position: [number, number, number];
  color: string;
  sku: string;
  stock: number;
  status: "optimal" | "low" | "high";
  delay: number;
}

function SmartStockBox({ position, color, sku, stock, status, delay }: SmartBoxProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime() + delay;
    const targetScale = hovered ? 1.18 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.12);
    meshRef.current.position.y = position[1] + Math.sin(t * 2) * 0.04;
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <RoundedBox args={[0.64, 0.54, 0.64]} radius={0.08} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial
          color={hovered ? "#4f46e5" : color}
          roughness={0.25}
          metalness={0.2}
          emissive={hovered ? "#4f46e5" : status === "low" ? "#f43f5e" : "#1e1b4b"}
          emissiveIntensity={hovered ? 0.45 : status === "low" ? 0.25 : 0.08}
        />
      </RoundedBox>

      {/* Kutu Üzeri Barkod Etiketi */}
      <mesh position={[0, 0.05, 0.325]}>
        <planeGeometry args={[0.38, 0.17]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.05, 0.328]}>
        <planeGeometry args={[0.28, 0.06]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Durum Işığı */}
      <mesh position={[0.2, 0.18, 0.326]}>
        <circleGeometry args={[0.04, 16]} />
        <meshBasicMaterial
          color={status === "optimal" ? "#10b981" : status === "low" ? "#f43f5e" : "#6366f1"}
        />
      </mesh>

      {hovered && (
        <Html position={[0, 0.62, 0]} center zIndexRange={[100, 0]}>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 text-white shadow-xl border border-indigo-500/40 text-xs whitespace-nowrap pointer-events-none">
            <div className="font-bold flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "optimal"
                    ? "bg-emerald-400"
                    : status === "low"
                    ? "bg-rose-400"
                    : "bg-indigo-400"
                }`}
              />
              {sku}
            </div>
            <div className="text-slate-300 text-[11px] font-medium">Stok: {stock} Adet</div>
          </div>
        </Html>
      )}
    </group>
  );
}

// ============================================================
// 3. LAZER BARKOD TARAYICI HALKASI
// ============================================================
function LaserScannerRing() {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ringRef.current) return;
    const t = clock.getElapsedTime();
    ringRef.current.position.y = Math.sin(t * 1.4) * 1.1 + 0.15;
  });

  return (
    <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[2.1, 2.18, 64]} />
      <meshBasicMaterial color="#6366f1" transparent opacity={0.65} side={THREE.DoubleSide} />
    </mesh>
  );
}

// ============================================================
// 4. MERKEZİ İZOMETRİK AKILLI DEPO & VERİ KÜPÜ PLATFORMU
// ============================================================
function SmartWarehouseCore() {
  const groupRef = useRef<THREE.Group>(null);
  const crystalRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (groupRef.current) {
      const targetRotY = t * 0.22 + pointer.x * 0.45;
      const targetRotX = pointer.y * 0.18;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
    }
    if (crystalRef.current) {
      crystalRef.current.rotation.y = t * 0.8;
      crystalRef.current.rotation.z = t * 0.4;
    }
  });

  const boxes: SmartBoxProps[] = useMemo(
    () => [
      // Alt Raf (Kat 1)
      { position: [-0.85, -0.55, 0.55], color: "#4f46e5", sku: "FW-2026-DNM", stock: 142, status: "optimal", delay: 0 },
      { position: [0, -0.55, 0.55], color: "#7c3aed", sku: "FW-2026-KNT", stock: 88, status: "optimal", delay: 0.5 },
      { position: [0.85, -0.55, 0.55], color: "#0284c7", sku: "FW-2026-JKT", stock: 12, status: "low", delay: 1.1 },
      { position: [-0.85, -0.55, -0.55], color: "#9333ea", sku: "FW-2026-TSH", stock: 310, status: "high", delay: 1.6 },
      { position: [0, -0.55, -0.55], color: "#4338ca", sku: "FW-2026-PNT", stock: 95, status: "optimal", delay: 2.1 },
      { position: [0.85, -0.55, -0.55], color: "#6366f1", sku: "FW-2026-SWT", stock: 64, status: "optimal", delay: 2.5 },

      // Üst Raf (Kat 2)
      { position: [-0.85, 0.35, 0.55], color: "#2563eb", sku: "FW-2026-SHW", stock: 54, status: "optimal", delay: 0.3 },
      { position: [0, 0.35, 0.55], color: "#e11d48", sku: "FW-2026-DRS", stock: 3, status: "low", delay: 0.9 },
      { position: [0.85, 0.35, 0.55], color: "#4f46e5", sku: "FW-2026-BLZ", stock: 120, status: "optimal", delay: 1.4 },
      { position: [-0.85, 0.35, -0.55], color: "#0ea5e9", sku: "FW-2026-ACC", stock: 215, status: "high", delay: 1.9 },
      { position: [0.85, 0.35, -0.55], color: "#7c3aed", sku: "FW-2026-BAG", stock: 47, status: "optimal", delay: 2.8 },
    ],
    []
  );

  const connectionLines = useMemo(
    () => [
      [new THREE.Vector3(-0.85, 0.35, 0.55), new THREE.Vector3(0, 1.35, 0)],
      [new THREE.Vector3(0.85, 0.35, 0.55), new THREE.Vector3(0, 1.35, 0)],
      [new THREE.Vector3(0, -0.55, 0.55), new THREE.Vector3(0, 1.35, 0)],
      [new THREE.Vector3(-0.85, 0.35, -0.55), new THREE.Vector3(0, 1.35, 0)],
      [new THREE.Vector3(0.85, 0.35, -0.55), new THREE.Vector3(0, 1.35, 0)],
    ],
    []
  );

  return (
    <group ref={groupRef} position={[0, 0.1, 0]}>
      {/* Ana İzometrik Platform Tabanı */}
      <RoundedBox args={[3.2, 0.2, 2.4]} position={[0, -1.0, 0]} radius={0.08} smoothness={4} receiveShadow>
        <meshStandardMaterial color="#1e293b" roughness={0.35} metalness={0.3} />
      </RoundedBox>
      <RoundedBox args={[3.35, 0.06, 2.55]} position={[0, -1.12, 0]} radius={0.03} smoothness={4}>
        <meshStandardMaterial color="#6366f1" emissive="#4f46e5" emissiveIntensity={0.6} />
      </RoundedBox>

      {/* Raf Kat Plakaları */}
      <RoundedBox args={[2.7, 0.08, 1.85]} position={[0, -0.86, 0]} radius={0.03} receiveShadow>
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
      </RoundedBox>
      <RoundedBox args={[2.7, 0.08, 1.85]} position={[0, 0.02, 0]} radius={0.03} receiveShadow>
        <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.3} />
      </RoundedBox>

      {/* Raf Dikmeleri */}
      {[
        [-1.28, -0.4, 0.85],
        [1.28, -0.4, 0.85],
        [-1.28, -0.4, -0.85],
        [1.28, -0.4, -0.85],
      ].map((pos, idx) => (
        <mesh key={idx} position={pos as [number, number, number]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 1.35, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.25} />
        </mesh>
      ))}

      {/* Akıllı Stok Kutuları */}
      {boxes.map((b, i) => (
        <SmartStockBox key={i} {...b} />
      ))}

      {/* Merkez AI Veri Kristali (Harici HDR gerektirmeyen meshPhysicalMaterial) */}
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={0.7}>
        <mesh ref={crystalRef} position={[0, 1.35, 0]} castShadow>
          <octahedronGeometry args={[0.42, 0]} />
          <meshPhysicalMaterial
            color="#6366f1"
            emissive="#4f46e5"
            emissiveIntensity={0.35}
            roughness={0.1}
            metalness={0.2}
            clearcoat={1}
            clearcoatRoughness={0.1}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* Kristal Etrafı Tel Kafes */}
        <mesh position={[0, 1.35, 0]} scale={1.18}>
          <octahedronGeometry args={[0.42, 0]} />
          <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.5} />
        </mesh>
      </Float>

      {/* Veri Akış Çizgileri */}
      {connectionLines.map((pts, idx) => (
        <Line
          key={idx}
          points={pts}
          color="#6366f1"
          lineWidth={1.5}
          dashed
          dashSize={0.1}
          gapSize={0.06}
          transparent
          opacity={0.7}
        />
      ))}

      {/* Lazer Tarama Halkası */}
      <LaserScannerRing />
    </group>
  );
}

// ============================================================
// ANA EXPORT: HERO 3D CANVAS BİLEŞENİ
// ============================================================
export default function LandingHero3D() {
  return (
    <div className="relative w-full h-[460px] md:h-[520px] select-none rounded-3xl bg-gradient-to-b from-white/80 via-indigo-50/40 to-white/90 border border-slate-200/80 shadow-[0_20px_60px_rgba(79,70,229,0.08)] overflow-hidden">
      {/* Sol Üst Canlı HUD Kartı */}
      <div className="absolute top-4 left-4 z-10 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-indigo-100 flex items-center gap-2.5 pointer-events-none">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-xs">
          %99.8
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Sayım Doğruluğu
          </div>
          <div className="text-xs font-bold text-slate-800">Canlı Barkod Senkron</div>
        </div>
      </div>

      {/* Sağ Üst Canlı HUD Kartı */}
      <div className="absolute top-4 right-4 z-10 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-indigo-100 flex items-center gap-2.5 pointer-events-none">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-xs">
          AI
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            RPT Öneri Motoru
          </div>
          <div className="text-xs font-bold text-slate-800">Stok Devir: 2.4x</div>
        </div>
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-medium shadow-lg flex items-center gap-2 whitespace-nowrap pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Kutuların üzerine gelerek stok detayını inceleyin • 360° Çevirin</span>
      </div>

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.7, 5.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 5, -4]} intensity={0.9} color="#818cf8" />
        <pointLight position={[3, 2, 4]} intensity={0.8} color="#38bdf8" />

        {/* 3D Akıllı Depo Küpü */}
        <SmartWarehouseCore />

        {/* Alt Parçacık & Siber Dalga Ağı */}
        <ParticleWaveField />

        {/* Zarif Işıltı Parçacıkları */}
        <Sparkles count={45} scale={6} size={2.2} speed={0.4} opacity={0.45} color="#4f46e5" />

        <ContactShadows
          position={[0, -1.25, 0]}
          opacity={0.35}
          scale={8}
          blur={2.4}
          far={4}
          color="#1e1b4b"
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
