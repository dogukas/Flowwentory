"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function AnimatedGradient() {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.ShaderMaterial>(null);

    const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Gentle wave
      pos.z += sin(pos.x * 1.5 + uTime) * 0.2;
      pos.z += cos(pos.y * 1.5 - uTime * 0.8) * 0.2;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

    const fragmentShader = `
    varying vec2 vUv;
    uniform float uTime;
    
    void main() {
      vec3 color1 = vec3(0.1, 0.2, 0.4); // Dark blue
      vec3 color2 = vec3(0.3, 0.1, 0.5); // Purple
      vec3 color3 = vec3(0.5, 0.2, 0.4); // Pink
      
      float t1 = sin(vUv.x * 3.14 + uTime * 0.3) * 0.5 + 0.5;
      float t2 = cos(vUv.y * 3.14 - uTime * 0.2) * 0.5 + 0.5;
      
      vec3 color = mix(color1, color2, t1);
      color = mix(color, color3, t2 * vUv.y);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

    const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -2]}>
            <planeGeometry args={[10, 10, 20, 20]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}

function Particles() {
    const pointsRef = useRef<THREE.Points>(null);

    const particles = useMemo(() => {
        const count = 100; // Reduced from 200
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }

        return positions;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.03;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.03}
                color="#8b5cf6"
                transparent
                opacity={0.5}
                sizeAttenuation
            />
        </points>
    );
}

export default function WaveBackground() {
    return (
        <div className="absolute inset-0 z-[-1]">
            {/* Fallback gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950" />

            {/* 3D Canvas - lighter version */}
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                dpr={[1, 1.5]} // Limit pixel ratio for performance
            >
                <AnimatedGradient />
                <Particles />
            </Canvas>
        </div>
    );
}
