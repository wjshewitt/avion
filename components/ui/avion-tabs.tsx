'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
}

interface AvionTabsProps {
  tabs: Tab[];
  selectedTab: string;
  onSelectTab: (id: string) => void;
  className?: string;
}

export const AvionTabs: React.FC<AvionTabsProps> = ({
  tabs,
  selectedTab,
  onSelectTab,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`relative px-5 py-3 text-sm font-medium tracking-[-0.01em] transition-colors duration-150 rounded ${
            selectedTab === tab.id ? 'text-zinc-100 font-semibold' : 'text-zinc-500 hover:text-zinc-300'
          }`}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {selectedTab === tab.id && (
            <>
              {/* Subtle elevated background */}
              <motion.div
                layoutId="avion-tab-bg"
                className="absolute inset-0 z-0 bg-zinc-800/40 border border-zinc-700/50 rounded"
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
              {/* Safety Orange underline */}
              <motion.div
                layoutId="avion-tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#F04E30] rounded-b"
                transition={{ duration: 0.2, ease: 'easeOut' }}
              />
            </>
          )}
          <span className="relative z-10">
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
};
