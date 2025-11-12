"use client";

import * as React from"react";

type Props = React.HTMLAttributes<HTMLDivElement>;

export default function TiltParallaxCard({ className ="", ...rest }: Props) {
 const ref = React.useRef<HTMLDivElement | null>(null);
 const [rot, setRot] = React.useState({ x: 0, y: 0 });

 return (
 <div
 {...rest}
 ref={ref}
 onMouseMove={(e) => {
 const r = ref.current?.getBoundingClientRect();
 if (!r) return;
 const px = (e.clientX - r.left) / r.width - 0.5;
 const py = (e.clientY - r.top) / r.height - 0.5;
 setRot({ x: -py * 10, y: px * 10 });
 }}
 onMouseLeave={() => setRot({ x: 0, y: 0 })}
 style={{ transform: `perspective(800px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}
 className={`relative border border-border dark:border-slate-700 bg-white dark:bg-slate-900 p-6 transition-transform [transform-style:preserve-3d] ${className}`}
 >
 <div className="text-text-primary dark:text-slate-50 text-lg font-semibold [transform:translateZ(40px)]">Parallax</div>
 <div className="mt-1 text-sm text-text-secondary dark:text-slate-400 [transform:translateZ(20px)]">Move your mouse</div>
 <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 bg-blue-300/40 blur-2xl [transform:translateZ(60px)]" />
 </div>
 );
}
