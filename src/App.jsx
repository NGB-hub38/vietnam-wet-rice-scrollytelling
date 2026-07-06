import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Scene from './Scene';
import Overlay from './Overlay';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const containerRef = useRef(null);
  const [tl, setTl] = useState(null);

  useEffect(() => {
    // Create master timeline
    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: '+=5000', // 5000px of scrolling
        scrub: 1,
        pin: true, // Pin the container
        anticipatePin: 1,
      }
    });
    
    setTl(masterTl);

    return () => {
      masterTl.scrollTrigger?.kill();
      masterTl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 10], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }} // We'll set background color in scene
        >
          {tl && <Scene tl={tl} />}
        </Canvas>
      </div>
      {tl && <Overlay tl={tl} />}
    </div>
  );
}

export default App;
