'use client';

import { useEffect } from 'react';
import { CloudLightning } from 'lucide-react';

export default function Gemini3UpgradesPage() {
  useEffect(() => {
    // --- 1. SKY ENGINE (The Apple-like Gradients) ---
    const SkyEngine = {
      getGradient: (hour: number, condition: string) => {
        // Normalize hour 0-24
        const h = parseFloat(hour.toString());
        
        // Base palettes (Zenith, Horizon)
        let top, bottom;

        if (h < 5 || h > 21) { // NIGHT
          top = '#020204'; bottom = '#11141c';
        } else if (h >= 5 && h < 7) { // DAWN
          top = '#1e1b2e'; bottom = '#8a4b38';
        } else if (h >= 7 && h < 9) { // MORNING
          top = '#2c5364'; bottom = '#bdc3c7';
        } else if (h >= 9 && h < 17) { // DAY
          top = '#2980b9'; bottom = '#6dd5fa'; // Typical Apple Blue
        } else if (h >= 17 && h < 20) { // SUNSET (Golden Hour)
          top = '#3a6073'; bottom = '#d1913c';
        } else { // DUSK
          top = '#0f2027'; bottom = '#203a43';
        }

        // Overrides for weather
        if (condition === 'storm') {
          top = '#0f0c29'; bottom = '#302b63'; // Deep purple/black
        } else if (condition === 'rain') {
          top = '#1F1F24'; bottom = '#4A4A52'; // Flat Slate
        } else if (condition === 'fog') {
          top = '#373B44'; bottom = '#4286f4'; // Muted Blue/Grey
        }

        return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
      },

      getSunPosition: (hour: number) => {
        // Sun arc: 6am (left/down) -> 12pm (center/up) -> 6pm (right/down)
        if (hour < 6 || hour > 20) return { top: '120%', left: '50%', opacity: 0, color: '#fff' }; // Hidden
        
        const percentOfDay = (hour - 6) / 14; // 0 to 1
        const x = 20 + (percentOfDay * 60); // 20% to 80%
        const y = 80 - (Math.sin(percentOfDay * Math.PI) * 70); // Arc
        
        // Sun color changes (White at noon, Orange at edges)
        let color = '#fff';
        if (hour < 8 || hour > 17) color = '#FDB813';
        if (hour < 7 || hour > 18) color = '#FF6B00';

        return { top: `${y}%`, left: `${x}%`, opacity: 1, color: color };
      }
    };

    // --- 2. PRECIPITATION ENGINE (Physics Canvas) ---
    class PrecipSystem {
      canvas!: HTMLCanvasElement;
      ctx!: CanvasRenderingContext2D;
      type!: string;
      particles!: any[];
      animationId: number | null = null;
      lightningTimeout: number | null = null;

      constructor(canvasId: string, type: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!canvas) return;
        
        this.canvas = canvas;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        this.ctx = ctx;
        this.type = type; // 'rain' or 'storm'
        this.particles = [];
        this.resize();
        
        const resizeHandler = () => this.resize();
        window.addEventListener('resize', resizeHandler);
        
        const count = type === 'storm' ? 400 : 150;
        for(let i=0; i<count; i++) this.particles.push(this.createDrop());
        
        this.loop();

        if(type === 'storm') this.lightningLoop();
      }

      resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (!rect) return;
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
      }

      createDrop() {
        // Z-index simulation (0 is far, 1 is close)
        const z = Math.random(); 
        const wind = (Math.random() - 0.5) + (this.type === 'storm' ? 4 : 1);
        return {
          x: Math.random() * (this.canvas.width + 100) - 50, // Extra margin for wind drift
          y: Math.random() * this.canvas.height - this.canvas.height,
          z: z,
          // Velocity depends on depth (parallax) - reduced speed
          velocity: 8 + (z * 12) + (this.type === 'storm' ? 10 : 0), 
          length: 10 + (z * 30), // Motion blur length
          opacity: 0.1 + (z * 0.5),
          wind: wind
        };
      }

      lightningLoop() {
        const delay = Math.random() * 4000 + 200;
        this.lightningTimeout = window.setTimeout(() => {
          const flash = document.getElementById('lightning-flash');
          if (!flash) return;
          flash.style.opacity = '0.8';
          setTimeout(() => flash.style.opacity = '0', 50);
          setTimeout(() => flash.style.opacity = '0.3', 100); // Flicker
          setTimeout(() => flash.style.opacity = '0', 150);
          this.lightningLoop();
        }, delay);
      }

      loop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set style
        this.ctx.lineWidth = 1.5;
        this.ctx.lineCap = 'round';

        this.particles.forEach(p => {
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(200, 220, 255, ${p.opacity})`;
          
          this.ctx.moveTo(p.x, p.y);
          // Draw line based on wind vector
          this.ctx.lineTo(p.x + p.wind, p.y + p.length);
          this.ctx.stroke();

          // Physics update
          p.y += p.velocity;
          p.x += p.wind;

          // Reset if out of bounds
          if (p.y > this.canvas.height || p.x > this.canvas.width + 50 || p.x < -50) {
            p.y = -50;
            p.x = Math.random() * (this.canvas.width + 100) - 50; // Extra margin for full coverage
          }
        });

        this.animationId = requestAnimationFrame(() => this.loop());
      }

      cleanup() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.lightningTimeout) clearTimeout(this.lightningTimeout);
      }
    }

    // --- 3. MASTER CONTROLLER ---
    const timeSlider = document.getElementById('time-slider') as HTMLInputElement;
    const timeDisplay = document.getElementById('time-display');

    function updateWorld() {
      if (!timeSlider) return;
      const hour = parseFloat(timeSlider.value);
      
      // Update Text
      const h = Math.floor(hour).toString().padStart(2, '0');
      const m = Math.floor((hour % 1) * 60).toString().padStart(2, '0');
      if (timeDisplay) timeDisplay.textContent = `${h}:${m} UTC`;

      // Update Cards
      const cards = [
        {id: 'card-clear', type: 'clear'},
        {id: 'card-rain', type: 'rain'},
        {id: 'card-storm', type: 'storm'},
        {id: 'card-fog', type: 'fog'}
      ];

      cards.forEach(c => {
        const el = document.getElementById(c.id);
        if (!el) return;
        const sky = el.querySelector('.sky-layer') as HTMLElement;
        if (!sky) return;
        
        // Apply Gradient
        sky.style.background = SkyEngine.getGradient(hour, c.type);

        // If Clear Sky -> Update Sun/Moon
        if(c.type === 'clear') {
          const orb = el.querySelector('.celestial-body') as HTMLElement;
          if (!orb) return;
          const pos = SkyEngine.getSunPosition(hour);
          
          orb.style.top = pos.top;
          orb.style.left = pos.left;
          orb.style.opacity = pos.opacity.toString();
          orb.style.background = pos.color;
          
          if(pos.color !== '#fff') {
            // Add glow for sunset
            orb.style.boxShadow = `0 0 60px 20px ${pos.color}`;
          } else {
            orb.style.boxShadow = `0 0 40px 10px rgba(255,255,255,0.5)`;
          }
        }
      });
    }

    // Initialize
    const rainSystem = new PrecipSystem('canvas-rain', 'rain');
    const stormSystem = new PrecipSystem('canvas-storm', 'storm');
    
    if (timeSlider) {
      timeSlider.addEventListener('input', updateWorld);
      updateWorld(); // Start
    }

    // Cleanup
    return () => {
      rainSystem.cleanup();
      stormSystem.cleanup();
      if (timeSlider) {
        timeSlider.removeEventListener('input', updateWorld);
      }
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --glass-border: rgba(255, 255, 255, 0.1);
          --glass-highlight: rgba(255, 255, 255, 0.05);
          --ease-fluid: cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .font-mono-human { 
          font-family: 'JetBrains Mono', monospace; 
          font-variant-numeric: tabular-nums; 
        }
        
        .label-micro { 
          font-family: 'JetBrains Mono', monospace; 
          font-size: 10px; 
          text-transform: uppercase; 
          letter-spacing: 0.15em; 
          opacity: 0.7; 
        }

        /* --- THE CARD CONTAINER --- */
        .weather-card {
          position: relative;
          height: 380px;
          border-radius: 4px;
          overflow: hidden;
          transition: transform 0.3s var(--ease-fluid), box-shadow 0.3s var(--ease-fluid);
          box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5);
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
        }

        /* The Sky Gradient Layer */
        .sky-layer {
          position: absolute; 
          inset: 0; 
          z-index: 0;
          background: linear-gradient(180deg, #1a1a1a, #000);
          transition: background 1s linear;
        }

        /* The Canvas Layer (Rain/Snow) */
        .weather-canvas { 
          position: absolute; 
          inset: 0; 
          z-index: 10; 
          opacity: 0.9; 
          mix-blend-mode: screen; 
        }

        /* The Glass Reflection (Appleness) */
        .glass-overlay {
          position: absolute; 
          inset: 0; 
          z-index: 20;
          background: linear-gradient(120deg, rgba(255,255,255,0.1) 0%, transparent 20%, transparent 100%);
          pointer-events: none;
        }

        /* UI Layer */
        .ui-layer {
          position: relative; 
          z-index: 30; 
          height: 100%;
          display: flex; 
          flex-direction: column; 
          justify-content: space-between;
          padding: 24px;
          text-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }

        /* --- SUN / MOON ORB --- */
        .celestial-body {
          position: absolute;
          width: 140px; 
          height: 140px;
          border-radius: 50%;
          filter: blur(24px);
          opacity: 0.8;
          z-index: 5;
          transition: top 1s linear, left 1s linear, background 1s linear, opacity 1s;
        }

        /* --- CLOUDS / FOG --- */
        .cloud-layer {
          position: absolute; 
          inset: 0; 
          z-index: 6;
          background-size: cover;
          opacity: 0;
          transition: opacity 2s ease;
          background-repeat: repeat-x;
        }

        /* Range Slider Styling (The Dieter Rams Control) */
        input[type=range] {
          -webkit-appearance: none; 
          width: 100%; 
          background: transparent;
        }
        
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; 
          height: 16px; 
          width: 16px; 
          border-radius: 50%;
          background: #F04E30; 
          cursor: pointer; 
          margin-top: -7px;
          box-shadow: 0 0 0 2px #000, 0 0 10px rgba(240, 78, 48, 0.5);
        }
        
        input[type=range]::-webkit-slider-runnable-track {
          width: 100%; 
          height: 2px; 
          background: #333;
        }

        input[type=range]::-moz-range-thumb {
          height: 16px; 
          width: 16px; 
          border-radius: 50%;
          background: #F04E30; 
          cursor: pointer;
          border: 2px solid #000;
          box-shadow: 0 0 10px rgba(240, 78, 48, 0.5);
        }

        input[type=range]::-moz-range-track {
          width: 100%; 
          height: 2px; 
          background: #333;
        }

        /* Data Grid at Bottom */
        .data-grid {
          display: grid; 
          grid-template-columns: 1fr 1fr 1fr;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 16px;
        }

        @keyframes fogFlow { 
          from { background-position: 200% 0; } 
          to { background-position: -200% 0; } 
        }
      `}</style>

      <div className="h-screen flex flex-col items-center justify-center bg-[#050505]">
        {/* Top Control Bar */}
        <div className="fixed top-8 w-full max-w-6xl px-6 flex justify-between items-end z-50 pointer-events-none">
          <div>
            <h1 className="text-white font-medium tracking-tight text-xl">
              ATMOSPHERE ENGINE <span className="text-zinc-500">2.0</span>
            </h1>
            <p className="text-zinc-500 text-xs font-mono-human mt-1">PHYSICS RENDERER</p>
          </div>
          <div className="pointer-events-auto flex flex-col items-end gap-2 w-64">
            <div className="flex justify-between w-full text-[10px] font-mono-human text-zinc-400">
              <span>06:00</span>
              <span id="time-display" className="text-white">12:00 UTC</span>
              <span>22:00</span>
            </div>
            <input type="range" min="0" max="24" step="0.1" defaultValue="12" id="time-slider" />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl px-6">

          {/* 1. CLEAR SKY */}
          <div className="weather-card group" id="card-clear">
            <div className="sky-layer"></div>
            <div className="celestial-body"></div>
            <div className="glass-overlay"></div>
            
            <div className="ui-layer">
              <div>
                <div className="flex justify-between items-start">
                  <span className="label-micro text-white/80">KSFO / SAN FRANCISCO</span>
                  <span className="font-mono-human text-[10px] bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 px-1.5 py-0.5 rounded-[2px]">VFR</span>
                </div>
                <h2 className="text-4xl font-medium mt-4 tracking-tight">Clear</h2>
                <p className="text-sm opacity-70 mt-1 font-mono-human">Sky Clear 10SM</p>
              </div>
              <div className="data-grid">
                <div><span className="label-micro block">TEMP</span><span className="font-mono-human text-lg">22°</span></div>
                <div><span className="label-micro block">WIND</span><span className="font-mono-human text-lg">270/08</span></div>
                <div className="text-right"><span className="label-micro block">QNH</span><span className="font-mono-human text-lg">1018</span></div>
              </div>
            </div>
          </div>

          {/* 2. RAIN */}
          <div className="weather-card group" id="card-rain">
            <div className="sky-layer"></div>
            <canvas id="canvas-rain" className="weather-canvas"></canvas>
            <div className="glass-overlay"></div>
            
            <div className="ui-layer">
              <div>
                <div className="flex justify-between items-start">
                  <span className="label-micro text-white/80">EGLL / LONDON</span>
                  <span className="font-mono-human text-[10px] bg-blue-500/20 border border-blue-500/50 text-blue-300 px-1.5 py-0.5 rounded-[2px]">MVFR</span>
                </div>
                <h2 className="text-4xl font-medium mt-4 tracking-tight">Rain</h2>
                <p className="text-sm opacity-70 mt-1 font-mono-human">-RA BKN012</p>
              </div>
              <div className="data-grid">
                <div><span className="label-micro block">TEMP</span><span className="font-mono-human text-lg">11°</span></div>
                <div><span className="label-micro block">WIND</span><span className="font-mono-human text-lg">220/14</span></div>
                <div className="text-right"><span className="label-micro block">QNH</span><span className="font-mono-human text-lg">1002</span></div>
              </div>
            </div>
          </div>

          {/* 3. STORM */}
          <div className="weather-card group border-orange-500/30" id="card-storm">
            <div className="sky-layer"></div>
            <div className="absolute inset-0 bg-black/30 z-10"></div>
            <div id="lightning-flash" className="absolute inset-0 bg-white pointer-events-none opacity-0 z-20 mix-blend-overlay transition-opacity duration-100"></div>
            <canvas id="canvas-storm" className="weather-canvas"></canvas>
            <div className="glass-overlay"></div>
            
            <div className="ui-layer">
              <div>
                <div className="flex justify-between items-start">
                  <span className="label-micro text-white/80">WSSS / SINGAPORE</span>
                  <span className="font-mono-human text-[10px] bg-orange-600/20 border border-orange-500 text-orange-400 px-1.5 py-0.5 rounded-[2px]">IFR</span>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <h2 className="text-4xl font-medium tracking-tight text-orange-50">Storm</h2>
                  <CloudLightning className="text-orange-400 w-6 h-6" />
                </div>
                <p className="text-sm text-orange-200/70 mt-1 font-mono-human">TSRA OVC008 CB</p>
              </div>
              <div className="data-grid">
                <div><span className="label-micro block text-orange-200/70">TEMP</span><span className="font-mono-human text-lg">28°</span></div>
                <div><span className="label-micro block text-orange-200/70">WIND</span><span className="font-mono-human text-lg text-orange-400">GUST 45</span></div>
                <div className="text-right"><span className="label-micro block text-orange-200/70">QNH</span><span className="font-mono-human text-lg">0998</span></div>
              </div>
            </div>
          </div>

          {/* 4. FOG */}
          <div className="weather-card group" id="card-fog">
            <div className="sky-layer"></div>
            {/* CSS Generated Fog */}
            <div 
              className="absolute inset-0 z-10 opacity-60 mix-blend-hard-light" 
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #ccc 50%, transparent 100%)', 
                backgroundSize: '200% 100%', 
                animation: 'fogFlow 20s linear infinite'
              }}
            ></div>
            <div 
              className="absolute inset-0 z-10 opacity-40 mix-blend-overlay" 
              style={{
                background: 'linear-gradient(90deg, transparent 0%, #fff 40%, transparent 100%)', 
                backgroundSize: '300% 100%', 
                animation: 'fogFlow 35s linear infinite reverse'
              }}
            ></div>
            
            <div className="glass-overlay"></div>
            
            <div className="ui-layer">
              <div>
                <div className="flex justify-between items-start">
                  <span className="label-micro text-white/80">EHAM / AMSTERDAM</span>
                  <span className="font-mono-human text-[10px] bg-amber-500/20 border border-amber-500/50 text-amber-300 px-1.5 py-0.5 rounded-[2px]">LIFR</span>
                </div>
                <h2 className="text-4xl font-medium mt-4 tracking-tight text-white/90">Fog</h2>
                <p className="text-sm opacity-70 mt-1 font-mono-human">VV002 Fog Banks</p>
              </div>
              <div className="data-grid">
                <div><span className="label-micro block">TEMP</span><span className="font-mono-human text-lg">04°</span></div>
                <div><span className="label-micro block">RVR</span><span className="font-mono-human text-lg text-amber-400">300m</span></div>
                <div className="text-right"><span className="label-micro block">QNH</span><span className="font-mono-human text-lg">1022</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
