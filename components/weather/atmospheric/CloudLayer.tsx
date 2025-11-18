'use client';

import { motion } from 'framer-motion';
import type { CloudLayerState, CloudMotion, CloudCoverageCategory } from "@/lib/weather/clouds";

interface CloudEffectProps {
  cloud?: CloudLayerState;
}

export const CloudLayer = ({ cloud }: CloudEffectProps) => {
  const cloudMotion: CloudMotion = cloud?.motion ?? "calm";
  const category: CloudCoverageCategory = cloud?.category ?? "scattered";
  const baseOpacity = cloud?.opacity ?? 0.18;

  const motionConfig = (() => {
    if (cloudMotion === "windy") {
      return { amplitude: 40, durationBase: 14 };
    }
    if (cloudMotion === "breezy") {
      return { amplitude: 28, durationBase: 18 };
    }
    return { amplitude: 18, durationBase: 24 };
  })();

  const densityMultiplier = (() => {
    switch (category) {
      case "overcast":
        return 1.6;
      case "broken":
        return 1.3;
      case "storm":
        return 1.8;
      case "high-thin":
        return 0.7;
      case "clear":
        return 0.4;
      default:
        return 1;
    }
  })();

  const effectiveOpacity = Math.min(baseOpacity * densityMultiplier, 0.7);

  // Define 4 cloud groups with varied sizes, shapes, and properties
  const clouds = [
    // Large elongated cloud - top area, stretched wide
    { 
      size: 140, 
      top: '10%', 
      left: '5%', 
      duration: 25, 
      delay: 0, 
      opacity: 0.18,
      widthRatio: 1.4,
      puffs: [
        { scale: 0.5, left: '0%', top: '35%', aspectRatio: 1.3, roundness: '60% 40% 45% 55%' }, // Horizontal oval
        { scale: 0.75, left: '25%', top: '10%', aspectRatio: 1.0, roundness: '50%' }, // Circle
        { scale: 0.65, left: '50%', top: '0%', aspectRatio: 0.8, roundness: '45% 55% 50% 50%' }, // Vertical oval
        { scale: 0.7, left: '75%', top: '25%', aspectRatio: 1.4, roundness: '55% 45% 60% 40%' }, // Wide oval
      ]
    },
    // Medium puffy cloud - middle right
    { 
      size: 110, 
      top: '40%', 
      left: '55%', 
      duration: 20, 
      delay: 2, 
      opacity: 0.22,
      widthRatio: 1.2,
      puffs: [
        { scale: 0.6, left: '0%', top: '30%', aspectRatio: 1.2, roundness: '50% 50% 40% 60%' }, // Squashed oval
        { scale: 0.8, left: '30%', top: '0%', aspectRatio: 0.9, roundness: '60% 40% 50% 50%' }, // Slightly tall
        { scale: 0.65, left: '60%', top: '20%', aspectRatio: 1.1, roundness: '45% 55% 55% 45%' }, // Irregular round
      ]
    },
    // Large wispy cloud - bottom left area, very wide
    { 
      size: 130, 
      top: '60%', 
      left: '10%', 
      duration: 22, 
      delay: 4, 
      opacity: 0.2,
      widthRatio: 1.5,
      puffs: [
        { scale: 0.55, left: '0%', top: '25%', aspectRatio: 1.5, roundness: '50% 50% 35% 65%' }, // Very wide
        { scale: 0.7, left: '35%', top: '5%', aspectRatio: 1.2, roundness: '55% 45% 40% 60%' }, // Wide oval
        { scale: 0.6, left: '70%', top: '30%', aspectRatio: 1.3, roundness: '40% 60% 50% 50%' }, // Elongated
      ]
    },
    // Small dense cloud - middle area for depth
    { 
      size: 90, 
      top: '30%', 
      left: '30%', 
      duration: 18, 
      delay: 6, 
      opacity: 0.25,
      widthRatio: 1.0,
      puffs: [
        { scale: 0.65, left: '10%', top: '40%', aspectRatio: 0.85, roundness: '50% 50% 60% 40%' }, // Slightly tall
        { scale: 0.85, left: '35%', top: '0%', aspectRatio: 1.0, roundness: '50%' }, // Perfect circle
        { scale: 0.7, left: '65%', top: '25%', aspectRatio: 1.25, roundness: '60% 40% 40% 60%' }, // Horizontal oval
      ]
    },
  ];

  return (
    <>
      {clouds.map((cloud, idx) => (
        <motion.div
          key={idx}
          className="absolute pointer-events-none"
          style={{
            top: cloud.top,
            left: cloud.left,
          }}
          animate={{
            x: [0, motionConfig.amplitude, 0],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: cloud.duration + motionConfig.durationBase,
            repeat: Infinity,
            ease: "easeInOut",
            delay: cloud.delay,
          }}
        >
          {/* Cloud made of varied overlapping shapes (ovals, ellipses, circles) for organic appearance */}
          <div className="relative" style={{ width: cloud.size * cloud.widthRatio, height: cloud.size * 0.5 }}>
            {cloud.puffs.map((puff, puffIdx) => (
              <div 
                key={puffIdx}
                className="absolute bg-gradient-to-br from-zinc-300/45 to-zinc-400/35 dark:from-zinc-500/55 dark:to-zinc-400/45 backdrop-blur-[3px]"
                style={{
                  width: cloud.size * puff.scale * puff.aspectRatio,
                  height: cloud.size * puff.scale,
                  left: puff.left,
                  top: puff.top,
                  opacity: effectiveOpacity,
                  borderRadius: puff.roundness,
                }}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </>
  );
};
