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

    const particles: { x: number; y: number; z: number; size: number }[] = [];
    const particleCount = 150;
    const connectionDistance = 120;

    // Initialize particles in pseudo-3D space
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 + 1, // Depth factor
        size: Math.random() * 2 + 0.5
      });
    }

    let animationFrameId: number;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    const draw = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Cyber grid effect
      ctx.strokeStyle = 'rgba(0, 188, 212, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      // Moving grid perspective
      const time = Date.now() * 0.0005;
      const offsetY = (time * 20) % gridSize;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update and draw particles
      particles.forEach((p, index) => {
        // Movement relative to mouse (parallax)
        const dx = (mouseX - width / 2) * 0.02 * p.z;
        const dy = (mouseY - height / 2) * 0.02 * p.z;
        
        // Gentle float
        p.y -= 0.2 * p.z; 
        if (p.y < 0) p.y = height;

        const renderX = p.x + dx;
        const renderY = p.y + dy;

        // Draw Particle
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 188, 212, ${0.3 * p.z})`;
        ctx.fill();

        // Draw Connections
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const rX2 = p2.x + (mouseX - width / 2) * 0.02 * p2.z;
          const rY2 = p2.y + (mouseY - height / 2) * 0.02 * p2.z;
          
          const dist = Math.hypot(renderX - rX2, renderY - rY2);

          if (dist < connectionDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 188, 212, ${0.15 * (1 - dist / connectionDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(renderX, renderY);
            ctx.lineTo(rX2, rY2);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
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
