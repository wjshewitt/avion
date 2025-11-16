'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FlightDeckClassic from '@/components/test/sidebar-header/FlightDeckClassic';
import InstrumentRail from '@/components/test/sidebar-header/InstrumentRail';
import MissionControlSplit from '@/components/test/sidebar-header/MissionControlSplit';
import AdaptiveMissionControl from '@/components/test/sidebar-header/AdaptiveMissionControl';

type DesignType = 'classic' | 'rail' | 'split' | 'adaptive';

interface Design {
  id: DesignType;
  label: string;
  category: 'Standard';
  description: string;
}

const designs: Design[] = [
  {
    id: 'classic',
    label: 'Flight Deck Classic',
    category: 'Standard',
    description: 'Tungsten sidebar with ceramic main area. Traditional fixed layout.'
  },
  {
    id: 'rail',
    label: 'Instrument Rail',
    category: 'Standard',
    description: 'Ultra-narrow tungsten rail with full-width header dominance.'
  },
  {
    id: 'split',
    label: 'Mission Control Split',
    category: 'Standard',
    description: 'Dual-panel ceramic system with segmented navigation groups.'
  },
  {
    id: 'adaptive',
    label: 'Adaptive Mission Control',
    category: 'Standard',
    description: 'Ceramic design with collapsible sidebar: full groups or minimal icons.'
  },
];

export default function SidebarHeaderTestPage() {
  const [activeDesign, setActiveDesign] = useState<DesignType>('classic');

  const renderDesign = () => {
    switch (activeDesign) {
      case 'classic':
        return <FlightDeckClassic />;
      case 'rail':
        return <InstrumentRail />;
      case 'split':
        return <MissionControlSplit />;
      case 'adaptive':
        return <AdaptiveMissionControl />;
      default:
        return <FlightDeckClassic />;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1A1A1A] flex flex-col">
      {/* Design Selector */}
      <div className="bg-[#2A2A2A] border-b border-[#333] px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#F04E30] flex items-center justify-center text-white font-bold text-sm">
              Av
            </div>
            <div>
              <h1 className="text-white font-semibold text-lg">Sidebar & Header Design System</h1>
              <p className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
                4 Navigation Patterns · Avion Design Language v1.5
              </p>
            </div>
          </div>
          <div className="text-zinc-400 text-xs font-mono">
            ALL STANDARD DESIGNS
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1">
          {designs.map((design) => (
            <button
              key={design.id}
              onClick={() => setActiveDesign(design.id)}
              className="relative px-6 py-3 text-sm font-medium transition-colors group"
            >
              <div className={`relative z-10 ${
                activeDesign === design.id
                  ? 'text-white'
                  : 'text-zinc-400 group-hover:text-zinc-200'
              }`}>
                {design.label}
              </div>
              {activeDesign === design.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#F04E30]"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Description */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDesign}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="mt-4 text-zinc-400 text-xs"
          >
            {designs.find(d => d.id === activeDesign)?.description}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Design Preview Area */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeDesign}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            {renderDesign()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
