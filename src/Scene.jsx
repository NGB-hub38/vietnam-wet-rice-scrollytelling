import React, { useEffect, useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Sparkles, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export default function Scene({ tl }) {
  const { camera } = useThree();
  
  // Refs for animated objects
  const seedRef = useRef();
  const sproutRef = useRef();
  const fieldRef = useRef();
  const techRiceRef = useRef();
  const bowlGroupRef = useRef();
  
  // Premium Materials
  const seedMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffd700',
    emissive: '#aa5500',
    emissiveIntensity: 0.2,
    metalness: 0.6,
    roughness: 0.2,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1
  }), []);

  const sproutMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#88eeaa',
    emissive: '#225533',
    emissiveIntensity: 0.2,
    roughness: 0.4,
    metalness: 0.1,
    clearcoat: 0.5
  }), []);

  const fieldMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#8844aa', // Soft purple
    roughness: 0.8,
    metalness: 0.1,
    flatShading: true // Low poly stylized look
  }), []);

  // Procedural Terraced Field Geometry
  const fieldGeo = useMemo(() => {
    const geo = new THREE.PlaneGeometry(80, 80, 50, 50);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      // Create terraced steps using sine waves
      const wave = Math.sin(x * 0.1) + Math.cos(y * 0.1);
      const z = Math.floor(wave * 3) * 0.8 + Math.sin(x*0.2)*0.5; 
      pos.setZ(i, z);
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    if (!tl) return;

    // Reset Camera
    camera.position.set(0, 2, 12);
    camera.rotation.set(-0.1, 0, 0);

    // Initial Object States
    if (seedRef.current) seedRef.current.scale.set(1, 1, 1);
    
    if (sproutRef.current) {
        sproutRef.current.scale.set(0, 0, 0);
        sproutRef.current.position.set(0, -1.5, 2);
    }
    
    if (fieldRef.current) {
        fieldRef.current.position.set(0, -5, -15);
        fieldRef.current.rotation.x = -Math.PI / 2;
        fieldRef.current.scale.set(0, 0, 0);
    }
    
    if (techRiceRef.current) {
        techRiceRef.current.position.set(15, 0, -10);
        techRiceRef.current.scale.set(0, 0, 0);
    }
    
    if (bowlGroupRef.current) {
        bowlGroupRef.current.position.set(0, -2, 5);
        bowlGroupRef.current.scale.set(0, 0, 0);
    }

    // --- GSAP TIMELINE ---
    
    // Scene 1 -> 2: Growth. Camera moves slightly up and looks down at an angle.
    tl.to(camera.position, { y: 4, z: 8, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(camera.rotation, { x: -Math.PI / 8, duration: 1.5, ease: "power2.inOut" }, 0)
      .to(seedRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8, ease: "back.in(1.2)" }, 0.2)
      .to(sproutRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.2, ease: "elastic.out(1, 0.7)" }, 0.8);

    // Scene 2 -> 3: Terraced Fields. Camera pans out and sweeps over the landscape.
    tl.to(camera.position, { y: 10, z: 18, x: -5, duration: 2, ease: "power2.inOut" }, 2)
      .to(camera.rotation, { x: -Math.PI / 6, y: -0.1, z: 0, duration: 2 }, 2)
      .to(sproutRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, 2)
      .to(fieldRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "power2.out" }, 2)
      .to(fieldMaterial.color, { r: 1, g: 0.7, b: 0.1, duration: 1.5 }, 2.5) // Transitions to gold
      .to(camera.position, { x: 5, duration: 2, ease: "none" }, 2.5); // Pan across fields

    // Scene 3 -> 4: Tech Rice. Camera orbits.
    tl.to(fieldRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8 }, 4)
      .to(camera.position, { x: 15, y: 2, z: -2, duration: 1.5, ease: "power2.inOut" }, 4.2)
      .to(camera.rotation, { x: 0, y: Math.PI / 4, z: 0, duration: 1.5 }, 4.2)
      .to(techRiceRef.current.scale, { x: 1, y: 1, z: 1, duration: 1, ease: "back.out(1.5)" }, 4.5)
      .to(camera.position, { x: 25, z: -18, duration: 2, ease: "none" }, 5)
      .to(camera.rotation, { y: Math.PI / 2 + 0.15, duration: 2, ease: "none" }, 5);

    // Scene 4 -> 5: Bowl of Rice.
    tl.to(techRiceRef.current.scale, { x: 0, y: 0, z: 0, duration: 0.8 }, 7)
      .to(camera.position, { x: 0, y: 1, z: 15, duration: 1.5, ease: "power2.inOut" }, 7.2)
      .to(camera.rotation, { x: -0.05, y: 0, z: 0, duration: 1.5 }, 7.2)
      .to(bowlGroupRef.current.scale, { x: 1, y: 1, z: 1, duration: 1.5, ease: "elastic.out(1, 0.6)" }, 7.5);

  }, [tl, camera, fieldMaterial]);

  // Continuous idle animations
  useFrame((state, delta) => {
    if (seedRef.current) seedRef.current.rotation.y += delta * 0.4;
    if (techRiceRef.current) techRiceRef.current.rotation.y += delta * 0.8;
  });

  return (
    <>
      <ambientLight intensity={0.6} color="#ffe6f0" />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffd580" />
      <hemisphereLight skyColor="#aa88ff" groundColor="#ffaa88" intensity={0.8} />
      
      {/* Dynamic Environment Sky (Creates beautiful smooth gradients) */}
      <Environment preset="sunset" background backgroundBlurriness={0.8} />

      {/* Floating particles */}
      <Sparkles count={300} scale={30} size={4} color="#ffb3d9" speed={0.3} opacity={0.6} />

      {/* 1. Rice Seed (Smooth capsule) */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={seedRef} material={seedMaterial}>
          <capsuleGeometry args={[0.8, 1.5, 32, 32]} />
        </mesh>
      </Float>

      {/* 2. Sprout - Improved stylized look with smooth capsules */}
      <group ref={sproutRef}>
        {/* Main stem */}
        <mesh material={sproutMaterial} position={[0, 1.5, 0]}>
          <capsuleGeometry args={[0.25, 2, 32, 32]} />
        </mesh>
        {/* Leaves */}
        <mesh material={sproutMaterial} position={[0.5, 2, 0]} rotation={[0, 0, -Math.PI/3]}>
          <capsuleGeometry args={[0.15, 1.5, 32, 32]} />
        </mesh>
        <mesh material={sproutMaterial} position={[-0.4, 1.5, 0]} rotation={[0, 0, Math.PI/3]}>
          <capsuleGeometry args={[0.15, 1.2, 32, 32]} />
        </mesh>
        {/* Small dirt mound */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.8, 32, 16, 0, Math.PI*2, 0, Math.PI/2]} />
          <meshPhysicalMaterial color="#4a2e2b" roughness={1} />
        </mesh>
      </group>

      {/* 3. Terraced Fields (Procedural wavy landscape) */}
      <mesh ref={fieldRef} material={fieldMaterial} geometry={fieldGeo} />

      {/* 4. Tech Rice */}
      <group ref={techRiceRef}>
        <mesh>
          <capsuleGeometry args={[0.8, 1.6, 16, 16]} />
          <meshBasicMaterial color="#00ffff" wireframe={true} transparent opacity={0.3} />
        </mesh>
        <mesh>
          <capsuleGeometry args={[0.7, 1.4, 32, 32]} />
          <meshPhysicalMaterial color="#110033" emissive="#aa00ff" emissiveIntensity={2} roughness={0.1} />
        </mesh>
        <Sparkles count={50} scale={4} size={3} color="#00ffff" />
      </group>

      {/* 5. Bowl of Rice */}
      <group ref={bowlGroupRef}>
        {/* Bowl */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial color="#f0f0f0" metalness={0.1} roughness={0.1} clearcoat={1} side={THREE.DoubleSide} />
        </mesh>
        {/* Rice mound */}
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[2.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial color="#fffacd" roughness={0.9} />
        </mesh>
        {/* Smoke */}
        <Sparkles position={[0, 2, 0]} count={100} scale={4} size={5} color="#ffffff" speed={0.8} opacity={0.3} />
      </group>
      
      <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={20} blur={2} far={10} />
    </>
  );
}
