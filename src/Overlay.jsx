import React, { useEffect, useRef } from 'react';

export default function Overlay({ tl }) {
  const introRef = useRef();
  const growthRef = useRef();
  const fieldRef = useRef();
  const techRef = useRef();
  const endRef = useRef();

  useEffect(() => {
    if (!tl) return;

    // We use GSAP timeline to toggle visibility and animate DOM elements.
    // Note: React uses visibility: hidden in CSS so we animate opacity and autoAlpha if needed.
    // But direct opacity tweening works fine.

    // Intro (Starts visible, fades out around 0.5)
    tl.to(introRef.current, { opacity: 0, duration: 0.5 }, 0.5);

    // Growth (Fades in at 1, out at 2)
    tl.fromTo(growthRef.current, { opacity: 0, y: 50, visibility: 'visible' }, { opacity: 1, y: 0, duration: 0.5 }, 1)
      .to(growthRef.current, { opacity: 0, y: -50, duration: 0.5 }, 1.5);

    // Field (Fades in at 2.5, out at 3.5)
    tl.fromTo(fieldRef.current, { opacity: 0, y: 50, visibility: 'visible' }, { opacity: 1, y: 0, duration: 0.5 }, 2.5)
      .to(fieldRef.current, { opacity: 0, y: -50, duration: 0.5 }, 3.5);

    // Tech (Fades in at 4.5, out at 6.5)
    tl.fromTo(techRef.current, { opacity: 0, y: 50, visibility: 'visible' }, { opacity: 1, y: 0, duration: 0.5 }, 4.5)
      .to(techRef.current, { opacity: 0, y: -50, duration: 0.5 }, 6.5);

    // End (Fades in at 7.5)
    tl.fromTo(endRef.current, { opacity: 0, scale: 0.8, visibility: 'visible' }, { opacity: 1, scale: 1, duration: 0.5 }, 7.5);

  }, [tl]);

  return (
    <div className="overlay-container">
      {/* 1. Intro */}
      <div ref={introRef} className="pos-center intro-text">
        <h1>HẠT NGỌC TRỜI VÀNG</h1>
        <p className="scroll-indicator">Cuộn xuống để bắt đầu hành trình ↓</p>
      </div>

      {/* 2. Growth */}
      <div ref={growthRef} className="pos-bottom-right glass-panel hidden" style={{ opacity: 0 }}>
        <p>Sự sống trỗi dậy từ lòng đất mẹ</p>
      </div>

      {/* 3. Fields */}
      <div ref={fieldRef} className="pos-center glass-panel hidden" style={{ opacity: 0, top: '20%' }}>
        <p>Khúc ca ngày mùa vang vọng từ non cao xuống đồng bằng</p>
      </div>

      {/* 4. Tech */}
      <div ref={techRef} className="pos-top-left glass-panel hidden" style={{ opacity: 0 }}>
        <p>Nông nghiệp tương lai:<br/>Khi công nghệ viết tiếp câu chuyện truyền thống</p>
      </div>

      {/* 5. End */}
      <div ref={endRef} className="pos-center intro-text hidden" style={{ opacity: 0, top: '70%' }}>
        <button className="btn-explore" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Khám phá lại</button>
      </div>
    </div>
  );
}
