import React, { useEffect, useRef } from 'react';

const ThreeBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- CONFIG ---
    const gridSpeed = 0.5;
    const perspective = 300;
    const horizonY = height * 0.4; // Horizon line position
    
    // Particles (Stars)
    const stars: { x: number; y: number; z: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 3,
        y: (Math.random() - 0.5) * height * 3,
        z: Math.random() * 2000,
        size: Math.random() * 2,
        alpha: Math.random()
      });
    }

    let offsetZ = 0;
    let animationFrameId: number;

    const draw = () => {
      // 1. Background Fill (Deep Space)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#020205');
      gradient.addColorStop(0.5, '#050510');
      gradient.addColorStop(1, '#0a0a1a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Stars (Background Layer)
      stars.forEach(star => {
        // Move stars towards viewer slightly
        star.z -= 0.5;
        if (star.z <= 0) star.z = 2000;

        const scale = perspective / (perspective + star.z);
        const x = width / 2 + star.x * scale;
        const y = height / 2 + star.y * scale;
        
        if (x > 0 && x < width && y > 0 && y < height) {
           ctx.beginPath();
           ctx.arc(x, y, star.size * scale, 0, Math.PI * 2);
           ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * scale})`;
           ctx.fill();
        }
      });

      // 3. Cyber Grid (Floor)
      ctx.save();
      ctx.beginPath();
      // Clip bottom half for floor
      ctx.rect(0, horizonY, width, height - horizonY);
      ctx.clip();

      // Fog Gradient for Floor
      const floorGrad = ctx.createLinearGradient(0, horizonY, 0, height);
      floorGrad.addColorStop(0, 'rgba(249, 115, 22, 0)'); // Orange fade at horizon
      floorGrad.addColorStop(0.2, 'rgba(249, 115, 22, 0.05)');
      floorGrad.addColorStop(1, 'rgba(249, 115, 22, 0.01)'); // Fade out at bottom
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, horizonY, width, height - horizonY);

      // Grid Lines
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.3)'; // Signature Orange
      ctx.lineWidth = 1;

      // Moving Horizontal Lines
      offsetZ = (offsetZ + gridSpeed) % 100;
      for (let z = 0; z < 2000; z += 100) {
        const pz = z - offsetZ;
        if (pz <= 0) continue;
        
        const scale = perspective / pz;
        const y = horizonY + (200 * scale); // 200 is camera height equivalent

        // Fade distant lines
        ctx.globalAlpha = Math.min(1, pz / 1000) * 0.5;
        if (y < height) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
      }

      // Perspective Vertical Lines
      for (let x = -2000; x <= 2000; x += 200) {
         // Project start (horizon)
         const x1 = width / 2 + (x * (perspective / 2000)); 
         const y1 = horizonY;
         
         // Project end (close to camera)
         const x2 = width / 2 + (x * (perspective / 100));
         const y2 = height;

         ctx.globalAlpha = 0.3;
         ctx.beginPath();
         ctx.moveTo(x1, y1);
         ctx.lineTo(x2, y2);
         ctx.stroke();
      }
      ctx.restore();

      // 4. Horizon Glow
      const glow = ctx.createLinearGradient(0, horizonY - 50, 0, horizonY + 50);
      glow.addColorStop(0, 'rgba(0,0,0,0)');
      glow.addColorStop(0.5, 'rgba(249, 115, 22, 0.4)'); // Orange Glow
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, horizonY - 50, width, 100);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
    />
  );
};

export default ThreeBackground;