"use client";

import { motion } from "framer-motion";

export const FlightVisualizer = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Grid Floor */}
      <div
        className="absolute bottom-0 left-[-50%] right-[-50%] h-[200%] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"
        style={{
          transform:
            "perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)",
          animation: "gridMove 20s linear infinite",
        }}
      />
      <style jsx>{`
        @keyframes gridMove {
          0% {
            transform: perspective(500px) rotateX(60deg) translateY(0)
              translateZ(-200px);
          }
          100% {
            transform: perspective(500px) rotateX(60deg) translateY(40px)
              translateZ(-200px);
          }
        }
      `}</style>

      {/* Moving Data Points */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute flex items-center gap-2"
          initial={{
            x: -200,
            y: `${Math.random() * 80 + 10}%`,
            opacity: 0,
          }}
          animate={{ x: "120vw", opacity: [0, 1, 1, 0] }}
          transition={{
            duration: Math.random() * 5 + 10,
            repeat: Infinity,
            delay: Math.random() * 10,
            ease: "linear",
          }}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
          <div className="flex flex-col">
            <span className="text-[8px] font-mono text-emerald-500/80">
              FL{300 + i * 10}
            </span>
            <span className="text-[8px] font-mono text-white/40">
              M 0.8{i}
            </span>
          </div>
        </motion.div>
      ))}

      {/* Rotating Globe Wireframe Hint */}
      <div className="absolute right-[-10%] top-[20%] w-[600px] h-[600px] border border-white/5 rounded-full opacity-20 pointer-events-none">
        <motion.div
          className="w-full h-full rounded-full border border-dashed border-white/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Scanline */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(255,255,255,0.03),transparent)]"
          style={{
            animation: "scanline 6s linear infinite",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes scanline {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(200%);
          }
        }
      `}</style>
    </div>
  );
};
