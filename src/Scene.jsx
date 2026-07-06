import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll, Float, Sparkles, Stars } from '@react-three/drei';
import * as THREE from 'three';

/* ===== Camera keyframes: [offset, posX, posY, posZ, lookX, lookY, lookZ] ===== */
const CAM = [
  [0.00,   0,  1.5,  12,    0,   0,     0],   // Intro: looking at seed
  [0.18,   0,  1.5,  12,    0,   0,     0],   // Hold intro
  [0.25,   0,  4,     7,    0,   0,     0],   // Zoom in for growth
  [0.38,   0,  4,     7,    0,   0,     0],   // Hold growth
  [0.44,  -4, 10,    16,    0,  -3,    -5],   // Pull out, look at fields
  [0.56,   4, 10,    16,    0,  -3,    -5],   // Pan across fields
  [0.62,   4,  2,     6,    0,   0,     0],   // Come in for tech rice
  [0.76,  -4,  3,     6,    0,   0,     0],   // Orbit tech rice
  [0.82,   0,  2,    10,    0,  -0.5,   0],   // Pull out for bowl
  [1.00,   0,  2,    10,    0,  -0.5,   0],   // Hold bowl
];

/* ===== Helpers ===== */
function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function clamp01(val) {
  return Math.max(0, Math.min(1, val));
}

/** Returns 0→1→0: fades in during [enterS, enterE], holds, fades out during [exitS, exitE] */
function visibility(offset, enterS, enterE, exitS, exitE) {
  const enter = smoothstep(clamp01((offset - enterS) / (enterE - enterS)));
  const exit  = 1 - smoothstep(clamp01((offset - exitS) / (exitE - exitS)));
  return Math.max(0, Math.min(enter, exit));
}

/* ===== Main Scene Component ===== */
export default function Scene() {
  const scroll  = useScroll();
  const { scene, camera } = useThree();

  // Object refs
  const seedRef  = useRef();
  const sproutRef = useRef();
  const fieldRef  = useRef();
  const techRef   = useRef();
  const bowlRef   = useRef();
  const mtnsRef   = useRef();

  // Reusable vector for lookAt
  const lookVec = useMemo(() => new THREE.Vector3(), []);

  // Background palette
  const bg = useMemo(() => [
    new THREE.Color('#2a1050'),  // 0: deep purple  (intro)
    new THREE.Color('#4a2040'),  // 1: warm dark     (growth)
    new THREE.Color('#705020'),  // 2: sunset amber  (fields)
    new THREE.Color('#080318'),  // 3: dark neon     (tech)
    new THREE.Color('#2a1035'),  // 4: soft purple   (end)
  ], []);

  // Materials
  const seedMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffd700', emissive: '#bb8800', emissiveIntensity: 0.3,
    metalness: 0.5, roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05,
  }), []);

  const sproutMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#77dd77', emissive: '#226622', emissiveIntensity: 0.2,
    roughness: 0.3, clearcoat: 0.5,
  }), []);

  const fieldMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#8844aa', roughness: 0.7, flatShading: true,
  }), []);

  // Procedural terraced-field geometry
  const fieldGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(60, 60, 40, 40);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      p.setZ(i, Math.sin(x * 0.15) * 2 + Math.cos(y * 0.1) * 1.5 + Math.sin((x + y) * 0.08));
    }
    g.computeVertexNormals();
    return g;
  }, []);

  /* ===== Per-frame update ===== */
  useFrame((_, delta) => {
    const o = scroll.offset; // 0 → 1

    // --- Camera interpolation along keyframe path ---
    let idx = 0;
    for (let i = 0; i < CAM.length - 1; i++) {
      if (o >= CAM[i][0] && o <= CAM[i + 1][0]) { idx = i; break; }
      if (i === CAM.length - 2) idx = i;
    }
    const a = CAM[idx], b = CAM[idx + 1];
    const span = b[0] - a[0];
    const t = span > 0 ? smoothstep(clamp01((o - a[0]) / span)) : 0;

    camera.position.set(
      THREE.MathUtils.lerp(a[1], b[1], t),
      THREE.MathUtils.lerp(a[2], b[2], t),
      THREE.MathUtils.lerp(a[3], b[3], t),
    );
    lookVec.set(
      THREE.MathUtils.lerp(a[4], b[4], t),
      THREE.MathUtils.lerp(a[5], b[5], t),
      THREE.MathUtils.lerp(a[6], b[6], t),
    );
    camera.lookAt(lookVec);

    // --- Background colour ---
    const page  = o * 4;                        // 0 → 4
    const pi    = Math.min(Math.floor(page), 3);
    const pf    = page - pi;
    scene.background = bg[pi].clone().lerp(bg[pi + 1], smoothstep(pf));

    // --- Seed (page 1) ---
    const sS = visibility(o, 0, 0.02, 0.18, 0.24);
    if (seedRef.current) {
      seedRef.current.scale.setScalar(sS);
      seedRef.current.visible = sS > 0.001;
      seedRef.current.rotation.y += delta * 0.5;
    }

    // --- Sprout (page 2) ---
    const sP = visibility(o, 0.22, 0.28, 0.36, 0.42);
    if (sproutRef.current) {
      sproutRef.current.scale.setScalar(sP);
      sproutRef.current.visible = sP > 0.001;
    }

    // --- Fields (page 3) ---
    const sF = visibility(o, 0.40, 0.46, 0.56, 0.62);
    if (fieldRef.current) {
      fieldRef.current.scale.setScalar(sF);
      fieldRef.current.visible = sF > 0.001;
    }
    // Colour shift purple → gold
    if (o >= 0.4 && o <= 0.6) {
      const gt = smoothstep(clamp01((o - 0.44) / 0.12));
      fieldMat.color.set('#8844aa').lerp(new THREE.Color('#ddaa22'), gt);
    }

    // --- Tech rice (page 4) ---
    const sT = visibility(o, 0.60, 0.66, 0.76, 0.82);
    if (techRef.current) {
      techRef.current.scale.setScalar(sT);
      techRef.current.visible = sT > 0.001;
      techRef.current.rotation.y += delta * 1;
    }

    // --- Bowl (page 5) ---
    const sB = visibility(o, 0.82, 0.88, 1.1, 1.2); // never exits
    if (bowlRef.current) {
      bowlRef.current.scale.setScalar(sB);
      bowlRef.current.visible = sB > 0.001;
    }

    // --- Mountains (fade after page 2) ---
    const sM = visibility(o, 0, 0.01, 0.35, 0.45);
    if (mtnsRef.current) {
      mtnsRef.current.visible = sM > 0.01;
    }
  });

  /* ===== JSX ===== */
  return (
    <>
      {/* ─── Lighting ─── */}
      <ambientLight intensity={0.5} color="#ffe6f0" />
      <directionalLight position={[10, 15, 8]} intensity={1.2} color="#ffd580" />
      <hemisphereLight args={['#9966cc', '#ff8866', 0.6]} />
      <pointLight position={[0, 5, 5]} intensity={0.5} color="#ffaacc" />

      {/* ─── Background particles ─── */}
      <Stars radius={50} depth={30} count={1500} factor={3} saturation={0.5} fade speed={0.5} />
      <Sparkles count={200} scale={25} size={3} color="#ffaadd" speed={0.2} opacity={0.5} />

      {/* ─── Background mountains (intro) ─── */}
      <group ref={mtnsRef} position={[0, -3, -20]}>
        <mesh position={[-12, 0, 0]}>
          <coneGeometry args={[6, 10, 5]} />
          <meshStandardMaterial color="#5533aa" flatShading />
        </mesh>
        <mesh position={[-3, 0, -5]}>
          <coneGeometry args={[8, 14, 6]} />
          <meshStandardMaterial color="#4422aa" flatShading />
        </mesh>
        <mesh position={[7, 0, -3]}>
          <coneGeometry args={[7, 11, 5]} />
          <meshStandardMaterial color="#6644bb" flatShading />
        </mesh>
        <mesh position={[16, 0, -6]}>
          <coneGeometry args={[5, 8, 5]} />
          <meshStandardMaterial color="#5533aa" flatShading />
        </mesh>
      </group>

      {/* ─── 1. Rice Seed ─── */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.8}>
        <mesh ref={seedRef} material={seedMat}>
          <capsuleGeometry args={[0.8, 1.5, 32, 32]} />
        </mesh>
      </Float>

      {/* ─── 2. Sprout ─── */}
      <group ref={sproutRef} position={[0, -1, 0]}>
        <mesh material={sproutMat} position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.08, 0.15, 2.5, 16]} />
        </mesh>
        <mesh material={sproutMat} position={[0.4, 2, 0]} rotation={[0, 0, -0.6]}>
          <capsuleGeometry args={[0.1, 1.2, 16, 16]} />
        </mesh>
        <mesh material={sproutMat} position={[-0.35, 1.6, 0.1]} rotation={[0.2, 0, 0.5]}>
          <capsuleGeometry args={[0.08, 1, 16, 16]} />
        </mesh>
        <mesh material={sproutMat} position={[0.15, 2.4, -0.1]} rotation={[-0.3, 0, -0.3]}>
          <capsuleGeometry args={[0.06, 0.8, 16, 16]} />
        </mesh>
        {/* Rice grains */}
        <mesh material={seedMat} position={[0, 2.8, 0]} rotation={[0, 0, 0.3]}>
          <capsuleGeometry args={[0.12, 0.3, 16, 16]} />
        </mesh>
        <mesh material={seedMat} position={[0.15, 2.7, 0.05]} rotation={[0.2, 0, -0.2]}>
          <capsuleGeometry args={[0.1, 0.25, 16, 16]} />
        </mesh>
        {/* Soil */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a2a2a" roughness={1} />
        </mesh>
      </group>

      {/* ─── 3. Terraced Fields ─── */}
      <group ref={fieldRef} position={[0, -5, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh material={fieldMat} geometry={fieldGeo} />
        {/* River */}
        <mesh position={[0, 0, 0.5]} rotation={[0, Math.PI / 6, 0]}>
          <planeGeometry args={[3, 60]} />
          <meshStandardMaterial color="#4488cc" roughness={0.3} metalness={0.4} />
        </mesh>
      </group>

      {/* ─── 4. Tech Rice ─── */}
      <group ref={techRef}>
        <mesh>
          <capsuleGeometry args={[1, 2, 8, 16]} />
          <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
        </mesh>
        <mesh>
          <capsuleGeometry args={[0.85, 1.7, 32, 32]} />
          <meshPhysicalMaterial
            color="#110033" emissive="#9900ff" emissiveIntensity={3}
            roughness={0.1} metalness={0.8} clearcoat={1}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.03, 16, 64]} />
          <meshBasicMaterial color="#00ffff" />
        </mesh>
        <mesh rotation={[Math.PI / 3, 0.5, 0]}>
          <torusGeometry args={[1.3, 0.02, 16, 64]} />
          <meshBasicMaterial color="#ff00ff" />
        </mesh>
        <pointLight position={[0, 0, 0]} intensity={2} distance={8} color="#aa00ff" />
        <Sparkles count={60} scale={5} size={3} color="#00ffff" speed={1} opacity={0.7} />
      </group>

      {/* ─── 5. Rice Bowl ─── */}
      <group ref={bowlRef} position={[0, -1, 0]}>
        <mesh>
          <sphereGeometry args={[2.5, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#f5f5f0" roughness={0.15} metalness={0.05}
            clearcoat={1} side={THREE.DoubleSide}
          />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <sphereGeometry args={[2.4, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#fffacd" roughness={0.9} />
        </mesh>
        <Sparkles position={[0, 2.5, 0]} count={80} scale={3} size={5} color="#ffddee" speed={0.5} opacity={0.4} />
        <Sparkles position={[0, 3.5, 0]} count={40} scale={2} size={4} color="#ffffff"  speed={0.3} opacity={0.3} />
      </group>
    </>
  );
}
