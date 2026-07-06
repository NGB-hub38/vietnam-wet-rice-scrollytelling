import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import Scene from './Scene';
import './index.css';

function App() {
  return (
    <div id="canvas-wrapper">
      <Canvas
        camera={{ position: [0, 1.5, 12], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <ScrollControls pages={5} damping={0.25}>
          {/* 3D Scene driven by scroll */}
          <Scene />

          {/* HTML Overlay text sections (scroll naturally with pages) */}
          <Scroll html style={{ width: '100%' }}>
            {/* Page 1: Intro */}
            <section className="section-intro">
              <h1 className="title-gold">HẠT NGỌC TRỜI VÀNG</h1>
              <p className="scroll-hint">Cuộn xuống để bắt đầu hành trình ↓</p>
            </section>

            {/* Page 2: Growth */}
            <section className="section-text right" style={{ top: '130vh' }}>
              <div className="glass-panel">
                Sự sống trỗi dậy từ lòng đất mẹ
              </div>
            </section>

            {/* Page 3: Fields */}
            <section className="section-text" style={{ top: '240vh' }}>
              <div className="glass-panel">
                Khúc ca ngày mùa vang vọng từ non cao xuống đồng bằng
              </div>
            </section>

            {/* Page 4: Tech */}
            <section className="section-text left" style={{ top: '340vh' }}>
              <div className="glass-panel">
                Nông nghiệp tương lai:<br />
                Khi công nghệ viết tiếp câu chuyện truyền thống
              </div>
            </section>

            {/* Page 5: Finale */}
            <section className="section-end" style={{ top: '430vh' }}>
              <div className="glass-panel">
                Tinh hoa hội tụ trong từng hạt ngọc
              </div>
              <button className="btn-explore" onClick={() => window.location.reload()}>
                Khám phá lại
              </button>
            </section>
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}

export default App;
