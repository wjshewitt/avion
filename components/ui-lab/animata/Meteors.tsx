"use client";

import * as React from"react";

export default function Meteors() {
 return (
 <div className="absolute inset-0">
 {Array.from({ length: 14 }).map((_, i) => (
 <span
 key={i}
 className="absolute h-0.5 w-8 -translate-x-10 bg-gradient-to-r from-white/0 via-white to-white/0 opacity-70"
 style={{
 top: `${Math.random() * 100}%`,
 left: `${Math.random() * 100}%`,
 animation: `meteor ${2 + Math.random() * 2}s linear ${Math.random() * 2}s infinite`,
 }}
 />
 ))}
 <style>{`
 @keyframes meteor {
 0% { transform: translateX(0) translateY(0) rotate(15deg); opacity: 0; }
 10% { opacity: .9; }
 100% { transform: translateX(200px) translateY(60px) rotate(15deg); opacity: 0; }
 }
 `}</style>
 </div>
 );
}
