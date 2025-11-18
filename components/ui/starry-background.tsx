'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Star {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
  opacity: number;
}

interface ShootingStar {
  id: number;
  top: string;
  left: string;
  delay: number;
}

export function StarryBackground() {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    // Generate static twinkling stars
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
    setStars(newStars);

    // Generate shooting stars
    const newShootingStars = Array.from({ length: 3 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 50}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15 + 5, // Longer delay between shooting stars
    }));
    setShootingStars(newShootingStars);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}

      {/* Shooting Stars */}
      {shootingStars.map((star) => (
        <div
          key={star.id}
          className="absolute h-[2px] w-[100px] bg-gradient-to-l from-transparent via-white to-transparent animate-shooting-star opacity-0"
          style={{
            top: star.top,
            left: star.left,
            animationDelay: `${star.delay}s`,
            transform: 'rotate(-45deg)',
          }}
        />
      ))}
    </div>
  );
}
