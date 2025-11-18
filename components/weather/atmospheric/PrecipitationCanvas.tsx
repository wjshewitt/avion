'use client';

import { useEffect, useRef } from 'react';

interface PrecipProps {
  type: 'rain' | 'storm' | 'snow';
  intensity?: number;
}

export function PrecipitationCanvas({ type, intensity = 1 }: PrecipProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lightningTimeout: number;
    
    // Physics State
    const particles: any[] = [];
    
    const resize = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Initialize Particles
    const count = type === 'storm' ? 300 : type === 'snow' ? 200 : 150;
    const particleCount = Math.floor(count * intensity);

    const createDrop = () => {
      const z = Math.random(); 
      // Wind drift
      const windBase = type === 'snow' ? 0.5 : type === 'storm' ? 4 : 1;
      const wind = (Math.random() - 0.5) + windBase;
      
      // Velocity
      let velocityBase = 0;
      if (type === 'snow') velocityBase = 1;
      else if (type === 'storm') velocityBase = 18;
      else velocityBase = 12; // Rain

      return {
        x: Math.random() * (canvas.width + 100) - 50, 
        y: Math.random() * canvas.height - canvas.height,
        z: z,
        velocity: velocityBase + (z * (type === 'snow' ? 2 : 8)), 
        length: type === 'snow' ? 2 : 10 + (z * 20), 
        opacity: 0.1 + (z * 0.4),
        size: type === 'snow' ? Math.random() * 3 + 1 : 1.5, // Snow size vs Rain width
        wind: wind
      };
    };

    for(let i = 0; i < particleCount; i++) particles.push(createDrop());

    // Lightning Loop for storms
    const lightningLoop = () => {
      const delay = Math.random() * 4000 + 2000;
      lightningTimeout = window.setTimeout(() => {
        const flash = document.getElementById('lightning-flash-' + canvas.id);
        if (flash) {
          flash.style.opacity = '0.6';
          setTimeout(() => flash.style.opacity = '0', 50);
          setTimeout(() => flash.style.opacity = '0.2', 100); 
          setTimeout(() => flash.style.opacity = '0', 150);
        }
        lightningLoop();
      }, delay);
    };

    if (type === 'storm') lightningLoop();

    // Animation Loop
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineCap = 'round';

      particles.forEach(p => {
        // Drawing
        if (type === 'snow') {
            ctx.beginPath();
            ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.wind, p.y + p.length);
            ctx.stroke();
        }

        // Physics
        p.y += p.velocity;
        p.x += p.wind;

        // Reset
        if (p.y > canvas.height || p.x > canvas.width + 50 || p.x < -50) {
          p.y = -50;
          p.x = Math.random() * (canvas.width + 100) - 50;
        }
      });

      animationId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
      clearTimeout(lightningTimeout);
    };
  }, [type, intensity]);

  // Random ID for lightning targeting if multiple on screen
  const id = Math.random().toString(36).substring(7);

  return (
    <>
        {type === 'storm' && (
             <div 
                id={`lightning-flash-canvas-${id}`} 
                className="absolute inset-0 bg-white pointer-events-none opacity-0 z-20 mix-blend-overlay transition-opacity duration-100"
             ></div>
        )}
        <canvas 
            id={`canvas-${id}`}
            ref={canvasRef} 
            className="absolute inset-0 z-10 pointer-events-none w-full h-full" 
        />
    </>
  );
}
