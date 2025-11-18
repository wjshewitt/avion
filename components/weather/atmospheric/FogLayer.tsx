'use client';

export function FogLayer() {
  return (
    <>
      <style jsx>{`
        @keyframes fogFlow { 
          from { background-position: 200% 0; } 
          to { background-position: -200% 0; } 
        }
      `}</style>
      
      {/* Base Layer */}
      <div 
        className="absolute inset-0 z-10 opacity-60 mix-blend-hard-light pointer-events-none" 
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #ccc 50%, transparent 100%)', 
          backgroundSize: '200% 100%', 
          animation: 'fogFlow 20s linear infinite'
        }}
      ></div>
      
      {/* Detail Layer */}
      <div 
        className="absolute inset-0 z-10 opacity-40 mix-blend-overlay pointer-events-none" 
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #fff 40%, transparent 100%)', 
          backgroundSize: '300% 100%', 
          animation: 'fogFlow 35s linear infinite reverse'
        }}
      ></div>
    </>
  );
}
