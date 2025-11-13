'use client';

import { motion } from 'framer-motion';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

const sizeMap = {
  sm: { dimension: 16, border: 2 },
  md: { dimension: 24, border: 2 },
  lg: { dimension: 32, border: 3 },
};

const colorMap: Record<string, string> = {
  'text-blue': '#2563eb',
  'text-green': '#10b981',
  'text-red': '#ef4444',
  'text-purple-500': '#a855f7',
  'text-amber': '#f59e0b',
};

// 1. Corner Brackets Loader - Rotating corner brackets
export function CornerBracketsLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';
  const bracketSize = dimension * 0.3;

  return (
    <motion.div
      className="relative"
      style={{ width: dimension, height: dimension }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Top-left */}
      <div
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: bracketSize,
          height: bracketSize,
          borderTop: `${border}px solid ${actualColor}`,
          borderLeft: `${border}px solid ${actualColor}`,
        }}
      />
      {/* Top-right */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: bracketSize,
          height: bracketSize,
          borderTop: `${border}px solid ${actualColor}`,
          borderRight: `${border}px solid ${actualColor}`,
        }}
      />
      {/* Bottom-left */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          left: 0,
          width: bracketSize,
          height: bracketSize,
          borderBottom: `${border}px solid ${actualColor}`,
          borderLeft: `${border}px solid ${actualColor}`,
        }}
      />
      {/* Bottom-right */}
      <div
        className="absolute"
        style={{
          bottom: 0,
          right: 0,
          width: bracketSize,
          height: bracketSize,
          borderBottom: `${border}px solid ${actualColor}`,
          borderRight: `${border}px solid ${actualColor}`,
        }}
      />
    </motion.div>
  );
}

// 2. Vertical Bars Loader - Oscillating height bars
export function VerticalBarsLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';
  const barWidth = border;
  const barCount = 4;

  return (
    <div
      className="relative flex items-end justify-between"
      style={{ width: dimension, height: dimension }}
    >
      {[...Array(barCount)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: barWidth,
            backgroundColor: actualColor,
          }}
          animate={{
            height: ['25%', '100%', '25%'],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );
}

// 3. Horizontal Line Scanner - Line moving up and down
export function ScannerLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';

  return (
    <div
      className="relative border"
      style={{
        width: dimension,
        height: dimension,
        borderWidth: border,
        borderColor: actualColor,
      }}
    >
      <motion.div
        style={{
          width: '100%',
          height: border,
          backgroundColor: actualColor,
        }}
        animate={{
          y: [0, dimension - border * 2, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// 4. Corner Sweep Loader - Line sweeping around perimeter
export function CornerSweepLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';

  return (
    <div
      className="relative"
      style={{ width: dimension, height: dimension }}
    >
      {/* Static border */}
      <div
        className="absolute inset-0"
        style={{
          border: `${border}px solid transparent`,
          borderColor: `${actualColor}20`,
        }}
      />
      {/* Animated sweeping line */}
      <motion.div
        className="absolute inset-0"
        style={{
          border: `${border}px solid transparent`,
          borderTopColor: actualColor,
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}

// 5. Pulse Corners Loader - Corners pulsing in sequence
export function PulseCornersLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';
  const cornerSize = dimension * 0.25;

  const corners = [
    { top: 0, left: 0, borderTop: true, borderLeft: true, delay: 0 },
    { top: 0, right: 0, borderTop: true, borderRight: true, delay: 0.2 },
    { bottom: 0, right: 0, borderBottom: true, borderRight: true, delay: 0.4 },
    { bottom: 0, left: 0, borderBottom: true, borderLeft: true, delay: 0.6 },
  ];

  return (
    <div
      className="relative"
      style={{ width: dimension, height: dimension }}
    >
      {corners.map((corner, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: corner.top,
            left: corner.left,
            right: corner.right,
            bottom: corner.bottom,
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: corner.borderTop ? border : 0,
            borderLeftWidth: corner.borderLeft ? border : 0,
            borderRightWidth: corner.borderRight ? border : 0,
            borderBottomWidth: corner.borderBottom ? border : 0,
            borderColor: actualColor,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: corner.delay,
          }}
        />
      ))}
    </div>
  );
}

// 6. Grid Dots Loader - Sequential dot activation in grid
export function GridDotsLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';
  const gridSize = 3;
  const dotSize = border * 1.5;
  const spacing = (dimension - gridSize * dotSize) / (gridSize + 1);

  return (
    <div
      className="relative grid"
      style={{
        width: dimension,
        height: dimension,
        gridTemplateColumns: `repeat(${gridSize}, ${dotSize}px)`,
        gridTemplateRows: `repeat(${gridSize}, ${dotSize}px)`,
        gap: spacing,
        padding: spacing,
      }}
    >
      {[...Array(gridSize * gridSize)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: actualColor,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

// 7. Cross Loader - Expanding/contracting cross pattern
export function CrossLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';
  const center = dimension / 2 - border / 2;

  return (
    <div
      className="relative"
      style={{ width: dimension, height: dimension }}
    >
      {/* Vertical bar */}
      <motion.div
        className="absolute"
        style={{
          left: center,
          width: border,
          backgroundColor: actualColor,
        }}
        animate={{
          top: [center, 0, center],
          bottom: [center, 0, center],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Horizontal bar */}
      <motion.div
        className="absolute"
        style={{
          top: center,
          height: border,
          backgroundColor: actualColor,
        }}
        animate={{
          left: [center, 0, center],
          right: [center, 0, center],
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

// 8. L-Shape Loader - Rotating L shapes forming corners
export function LShapeLoader({ size = 'md', color = 'text-blue' }: LoaderProps) {
  const { dimension, border } = sizeMap[size];
  const actualColor = colorMap[color] || '#2563eb';
  const lineLength = dimension * 0.4;

  return (
    <motion.div
      className="relative"
      style={{ width: dimension, height: dimension }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Four L-shapes positioned at each corner */}
      {[0, 90, 180, 270].map((rotation, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            width: lineLength,
            height: lineLength,
            transformOrigin: 'center',
            transform: `rotate(${rotation}deg)`,
            top: rotation === 0 || rotation === 90 ? 0 : 'auto',
            bottom: rotation === 180 || rotation === 270 ? 0 : 'auto',
            left: rotation === 0 || rotation === 270 ? 0 : 'auto',
            right: rotation === 90 || rotation === 180 ? 0 : 'auto',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: lineLength,
              height: border,
              backgroundColor: actualColor,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: border,
              height: lineLength,
              backgroundColor: actualColor,
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}
