import React, { useEffect, useRef } from 'react';
import { useMusic } from '../context/MusicContext';

export default function Visualizer({ height = 60, barCount = 36, isHero = false }) {
  const canvasRef = useRef(null);
  const { isPlaying } = useMusic();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const h = canvas.height;
      const barWidth = Math.max(3, (width / barCount) - 4);
      const gap = 4;

      // Gradient
      const gradient = ctx.createLinearGradient(0, h, 0, 0);
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
      gradient.addColorStop(0.6, 'rgba(99, 102, 241, 0.8)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 1)');

      ctx.fillStyle = gradient;

      for (let i = 0; i < barCount; i++) {
        let barHeight;
        if (isPlaying) {
          // Dynamic sine rhythm
          const wave1 = Math.sin(tick * 0.08 + i * 0.25);
          const wave2 = Math.cos(tick * 0.05 + i * 0.4);
          const val = (wave1 + wave2 + 2) / 4; // Normalized 0..1
          barHeight = Math.max(4, val * (h * 0.85));
        } else {
          // Subtle resting pulse
          barHeight = 4 + Math.sin(tick * 0.02 + i) * 2;
        }

        const x = i * (barWidth + gap);
        const y = h - barHeight;

        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
        ctx.fill();
      }

      tick += isPlaying ? 1 : 0.2;
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, barCount]);

  return (
    <div style={{ width: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={barCount * 12}
        height={height}
        style={{
          width: '100%',
          height: `${height}px`,
          display: 'block',
          opacity: isHero ? 0.7 : 0.9,
        }}
      />
    </div>
  );
}
