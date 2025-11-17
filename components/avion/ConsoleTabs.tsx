"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * @param {Array<string>} tabs - An array of tab names.
 * @param {function} onTabChange - Callback (receives index of new tab).
 */
export const ConsoleTabs = ({ tabs, onTabChange }) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleSelect = (index) => {
    setSelectedTab(index);
    if (onTabChange) onTabChange(index);
  };

  return (
    <div className="flex w-full p-1 bg-[#111113] rounded-md border border-[#333]">
      {tabs.map((tab, i) => (
        <div
          key={tab}
          onClick={() => handleSelect(i)}
          className={`
            relative flex-1 px-3 py-1.5 text-xs font-mono text-center
            rounded-sm cursor-pointer transition-colors
            ${selectedTab === i ? 'text-white' : 'text-[#999] hover:text-white'}
          `}
        >
          {selectedTab === i && (
            <motion.div
              layoutId="tab-highlighter"
              className="absolute inset-0 bg-[#222224] border border-[#383838] rounded-sm"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)' }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </div>
      ))}
    </div>
  );
};
