import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Scene({ tl }) {
  const { camera, scene } = useThree();
  
  // Refs for animated objects
  const seedRef = useRef();
  const sproutRef = useRef();
  const fieldRef = useRef();
  const techRiceRef = useRef();
  const bowlGroupRef = useRef();
  
  // Custom materials
  const seedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffdd55',
    metalness: 0.3,
    roughness: 0.4,
    clearcoat: 0.8,
    clearcoatRoughness: 0.2
  }), []);

  const sproutMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#aadd88',
    roughness: 0.6,
  }), []);

  const fieldMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#aa55ff', // Starts purple, will tween to gold
    roughness: 0.8,
  }), []);

  useEffect(() => {
    if (!tl) return;

    // Initial setup
    scene.background = new THREE.Color('#3a1c71'); // Muted Purple
    camera.position.set(0, 0, 10);
    camera.rotation.set(0, 0, 0);

    // Initial object states
    if (sproutRef.current) {
        sproutRef.current.scale.set(0, 0, 0);
        sproutRef.current.position.set(0, -2, 0);
    }
    if (fieldRef.current) {
        fieldRef.current.position.set(0, -5, -20);
        fieldRef.current.rotation.x = -Math.PI / 2;
        fieldRef.current.scale.set(0,0,0);
    }
    if (techRiceRef.current) {
        techRiceRef.current.position.set(20, 0, -20); // Hidden off to the side initially
        techRiceRef.current.scale.set(0,0,0);
    }
    if (bowlGroupRef.current) {
        bowlGroupRef.current.scale.set(0,0,0);
    }

    // --- TIMELINE ANIMATIONS ---
    // Scene 1 -> 2: Camera zooms in, crashes through seed, looks down. Sprout grows.
    tl.to(camera.position, { z: 2, duration: 1 }, 0)
      .to(camera.rotation, { x: -Math.PI / 2, duration: 1 }, 0)
      .to(camera.position, { y: 2, z: 0, duration: 1 }, 0.5) // Adjust position to look down
      .to(seedRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, 0.8) // Seed disappears
      .to(scene.background, { r: 1, g: 0.6, b: 0.6, duration: 1 }, 0.5) // BG to soft pink
      .to(sproutRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.7)" }, 1);

    // Scene 2 -> 3: Camera zooms out and pans horizontally. Field appears.
    tl.to(camera.position, { y: 5, z: 15, x: 0, duration: 1 }, 2)
      .to(camera.rotation, { x: -Math.PI/6, duration: 1 }, 2)
      .to(sproutRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, 2) // Hide sprout
      .to(fieldRef.current.scale, { x: 1, y: 1, z: 1, duration: 1 }, 2) // Show field
      .to(scene.background, { r: 1, g: 0.8, b: 0.4, duration: 1 }, 2) // BG to warm sunset
      .to(fieldMaterial.color, { r: 1, g: 0.8, b: 0.2, duration: 1 }, 2.5) // Field turns gold
      .to(camera.position, { x: 10, duration: 1.5 }, 2.5); // Pan X

    // Scene 3 -> 4: Orbit around tech rice.
    tl.to(fieldRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, 4)
      .to(scene.background, { r: 0.1, g: 0.05, b: 0.2, duration: 1 }, 4) // Dark purple/neon BG
      .to(camera.position, { x: 20, y: 2, z: -10, duration: 1 }, 4)
      .to(camera.rotation, { x: 0, y: Math.PI / 4, z: 0, duration: 1 }, 4)
      .to(techRiceRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.5 }, 4.5)
      // Orbit effect
      .to(camera.position, { x: 25, z: -25, duration: 1.5 }, 5)
      .to(camera.rotation, { y: Math.PI / 2, duration: 1.5 }, 5);

    // Scene 4 -> 5: Convergence. Tech rice dissolves, bowl appears.
    tl.to(techRiceRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, 7)
      .to(camera.position, { x: 0, y: 0, z: 15, duration: 1 }, 7)
      .to(camera.rotation, { x: 0, y: 0, z: 0, duration: 1 }, 7)
      .to(scene.background, { r: 0.8, g: 0.4, b: 0.6, duration: 1 }, 7) // Soft purple-pink final BG
      .to(bowlGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "elastic.out(1, 0.5)" }, 7.5);

  }, [tl, camera, scene, seedMaterial, sproutMaterial, fieldMaterial]);

  // Auto-rotation for seed
  useFrame((state, delta) => {
    if (seedRef.current) {
      seedRef.current.rotation.y += delta * 0.5;
    }
    if (techRiceRef.current) {
      techRiceRef.current.rotation.y += delta * 1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="sunset" />
      
      {/* Intro Particles */}
      <Sparkles count={200} scale={15} size={2} color="#ffaacc" speed={0.2} opacity={0.5} />

      {/* 1. Rice Seed (Capsule) */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={seedRef} material={seedMaterial}>
          <capsuleGeometry args={[1, 2, 4, 8]} />
        </mesh>
      </Float>

      {/* 2. Sprout (Cone) */}
      <group ref={sproutRef}>
        <mesh material={sproutMaterial} position={[0, 1, 0]}>
          <coneGeometry args={[0.5, 2, 8]} />
        </mesh>
        <mesh material={sproutMaterial} position={[0.5, 1.5, 0]} rotation={[0, 0, -Math.PI/4]}>
          <coneGeometry args={[0.2, 1.5, 8]} />
        </mesh>
        <mesh material={sproutMaterial} position={[-0.5, 1.2, 0]} rotation={[0, 0, Math.PI/3]}>
          <coneGeometry args={[0.2, 1.2, 8]} />
        </mesh>
        {/* Soil plane */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#553355" />
        </mesh>
      </group>

      {/* 3. Terraced Fields (Curved planes) */}
      <group ref={fieldRef}>
        <mesh material={fieldMaterial} position={[0, 0, 0]}>
          <planeGeometry args={[40, 40, 32, 32]} />
        </mesh>
        <mesh material={fieldMaterial} position={[0, 1, -5]}>
           <planeGeometry args={[40, 40, 32, 32]} />
        </mesh>
        <mesh material={fieldMaterial} position={[0, 2, -10]}>
           <planeGeometry args={[40, 40, 32, 32]} />
        </mesh>
      </group>

      {/* 4. Tech Rice (Wireframe / Glowing) */}
      <group ref={techRiceRef}>
        <mesh>
          <capsuleGeometry args={[1, 2, 8, 16]} />
          <meshBasicMaterial color="#00ffff" wireframe={true} />
        </mesh>
        <mesh>
          <capsuleGeometry args={[0.9, 1.8, 8, 16]} />
          <meshPhysicalMaterial color="#aa00ff" emissive="#5500aa" emissiveIntensity={2} />
        </mesh>
      </group>

      {/* 5. Bowl of Rice */}
      <group ref={bowlGroupRef}>
        {/* Bowl */}
        <mesh position={[0, -1, 0]}>
          <sphereGeometry args={[2, 32, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial color="#ffffff" metalness={0.1} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>
        {/* Rice mound */}
        <mesh position={[0, -0.5, 0]}>
          <sphereGeometry args={[1.9, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#ffffee" roughness={0.8} />
        </mesh>
        {/* Smoke particles */}
        <Sparkles position={[0, 1, 0]} count={50} scale={3} size={4} color="#ffccdd" speed={0.5} opacity={0.6} />
      </group>
    </>
  );
}
