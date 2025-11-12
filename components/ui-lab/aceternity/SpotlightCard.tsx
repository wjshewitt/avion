"use client";

import * as React from"react";

type Props = {
 title: string;
 subtitle?: string;
};

export default function SpotlightCard({ title, subtitle }: Props) {
 const ref = React.useRef<HTMLDivElement | null>(null);
 const [pos, setPos] = React.useState({ x: 0, y: 0 });

 return (
 <div
 ref={ref}
 onMouseMove={(e) => {
 const rect = ref.current?.getBoundingClientRect();
 if (!rect) return;
 setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
 }}
 className="relative overflow-hidden border border-border dark:border-slate-700 bg-white dark:bg-slate-900 p-8 min-h-[180px]"
 style={{
 maskImage: `radial-gradient(140px at ${pos.x}px ${pos.y}px, black 40%, transparent 80%)`,
 WebkitMaskImage: `radial-gradient(140px at ${pos.x}px ${pos.y}px, black 40%, transparent 80%)`,
 }}
 >
 <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/60 to-indigo-100/40" />
 <div className="relative">
 <h3 className="text-lg font-semibold text-text-primary dark:text-slate-50">{title}</h3>
 {subtitle && <p className="text-sm text-text-secondary dark:text-slate-400 mt-1">{subtitle}</p>}
 </div>
 </div>
 );
}
