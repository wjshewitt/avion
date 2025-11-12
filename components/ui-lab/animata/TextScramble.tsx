"use client";

import * as React from"react";

const CHARS ="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export default function TextScramble({ text }: { text: string }) {
 const [display, setDisplay] = React.useState(text);
 const target = React.useRef(text);
 const raf = React.useRef<number | null>(null);

 React.useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

 const scramble = () => {
 const duration = 600;
 const start = performance.now();
 const animate = (t: number) => {
 const p = Math.min(1, (t - start) / duration);
 const out = target.current
 .split("")
 .map((ch, i) => (Math.random() < 1 - p ? CHARS[(Math.random() * CHARS.length) | 0] : ch))
 .join("");
 setDisplay(out);
 if (p < 1) raf.current = requestAnimationFrame(animate);
 else setDisplay(target.current);
 };
 raf.current = requestAnimationFrame(animate);
 };

 return (
 <button
 onMouseEnter={scramble}
 className="border border-border dark:border-slate-700 px-4 py-2 text-lg font-semibold text-text-primary dark:text-slate-50 hover:bg-surface dark:bg-slate-800"
 >
 {display}
 </button>
 );
}
