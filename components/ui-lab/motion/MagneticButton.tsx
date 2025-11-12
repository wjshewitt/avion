"use client";

import * as React from"react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode };

export default function MagneticButton({ children, className ="", ...props }: Props) {
 const ref = React.useRef<HTMLButtonElement | null>(null);
 const [offset, setOffset] = React.useState({ x: 0, y: 0 });

 return (
 <button
 {...props}
 ref={ref}
 onMouseMove={(e) => {
 const r = ref.current?.getBoundingClientRect();
 if (!r) return;
 const dx = e.clientX - (r.left + r.width / 2);
 const dy = e.clientY - (r.top + r.height / 2);
 setOffset({ x: dx * 0.2, y: dy * 0.2 });
 }}
 onMouseLeave={() => setOffset({ x: 0, y: 0 })}
 style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
 className={` bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white shadow transition-transform will-change-transform ${className}`}
 >
 {children}
 </button>
 );
}
