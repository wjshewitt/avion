Avion Component Library (v3)

Design System: Avion (Tungsten / Glass Cockpit)
Core Philosophy: Tactile, Information-Dense, Generative.

1.0 Setup & Dependencies

Ensure your project includes react, react-dom, framer-motion, lucide-react, and tailwindcss.

tailwind.config.js (Recommended):

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        'avion-tungsten-dark': '#111113',
        'avion-tungsten': '#1a1a1a',
        'avion-panel': '#222224',
        'avion-border': '#333',
        'avion-accent': '#F04E30',
        'avion-text': '#e5e5e5',
        'avion-text-dim': '#999',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'avion-glow': '0 0 12px rgba(240, 78, 48, 0.5)',
      },
    },
  },
  plugins: [],
}


2.0 Atomic Components (Inputs)

2.1 Mechanical Toggle Switch

A tactile, spring-based toggle. Feels mechanical, not digital.

import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * @param {boolean} initialChecked - The starting state of the toggle.
 * @param {function} onToggle - Callback function (receives new boolean state).
 */
export const MechanicalToggle = ({ initialChecked = false, onToggle }) => {
  const [isOn, setIsOn] = useState(initialChecked);

  const handleToggle = () => {
    const newState = !isOn;
    setIsOn(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <div
      onClick={handleToggle}
      className={`flex items-center w-12 h-6 rounded-full cursor-pointer transition-colors p-1 ${
        isOn ? 'bg-[#F04E30]' : 'bg-[#111113]'
      }`}
      style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-zinc-300 shadow-sm"
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        style={{ x: isOn ? '100%' : '0%' }}
      />
    </div>
  );
};


2.2 System Button

Primary (accent) and Secondary (tungsten) buttons. Depresses on click.

import { motion } from 'framer-motion';
import { Icon } from 'lucide-react'; // Or your local Icon component

/**
 * @param {string} variant - 'primary' (orange) or 'secondary' (tungsten).
 * @param {React.ReactNode} children - Button text.
 * @param {string} iconName - Optional Lucide icon name.
 * @param {function} onClick - Click handler.
 */
export const SystemButton = ({ variant = 'secondary', children, iconName, onClick }) => {
  const isPrimary = variant === 'primary';

  const LucideIcon = iconName ? Icon[iconName] : null;

  return (
    <motion.button
      onClick={onClick}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md border
        transition-all
        ${
          isPrimary
            ? 'bg-[#F04E30] text-white border-[#F04E30] shadow-md hover:bg-opacity-90'
            : 'bg-[#222224] text-[#e5e5e5] border-[#333] hover:border-[#555] hover:bg-[#2a2a2a]'
        }
      `}
      whileTap={{ scale: 0.97, y: 1 }}
    >
      {LucideIcon && <LucideIcon size={14} />}
      <span>{children}</span>
    </motion.button>
  );
};


2.3 Recessed Text Input

An input field that feels "grooved" into the console.

import { Icon } from 'lucide-react';

/**
 * @param {string} label - Form label.
 * @param {string} placeholder - Input placeholder.
 * @param {string} type - Input type (e.g., 'text', 'password').
 * @param {string} iconName - Optional Lucide icon name for the left side.
 */
export const RecessedInput = ({ label, placeholder, type = 'text', iconName }) => {
  const LucideIcon = iconName ? Icon[iconName] : null;

  return (
    <div className="w-full">
      <label className="text-xs font-mono text-[#999] uppercase tracking-wider">
        {label}
      </label>
      <div
        className="
          flex items-center gap-2 mt-1 p-2 rounded-md border border-[#111]
          bg-[#111113] transition-all
          focus-within:border-[#F04E30]
        "
        style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)' }}
      >
        {LucideIcon && <LucideIcon size={16} className="text-[#999] shrink-0" />}
        <input
          type={type}
          placeholder={placeholder}
          className="
            w-full bg-transparent text-[#e5e5e5] text-sm
            focus:outline-none placeholder:text-[#555]
          "
        />
      </div>
    </div>
  );
};


3.0 Navigation Components

3.1 Vertical Nav Item

Sidebar navigation item with a clear "active" state.

import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

/**
 * @param {string} iconName - Lucide icon name.
 * @param {React.ReactNode} children - Nav item text.
 * @param {boolean} isActive - Controls the active state.
 * @param {function} onClick - Click handler.
 */
export const NavItem = ({ iconName, children, isActive, onClick }) => {
  const LucideIcon = Icon[iconName];

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-4 py-3 cursor-pointer
        transition-colors group
        ${isActive ? 'text-white' : 'text-[#999] hover:text-white hover:bg-[#222224]'}
      `}
    >
      {isActive && (
        <motion.div
          layoutId="nav-active-bar"
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#F04E30] rounded-r-full"
          style={{ boxShadow: '0 0 12px rgba(240, 78, 48, 0.5)' }}
        />
      )}
      {LucideIcon && <LucideIcon size={18} className="shrink-0" />}
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
};


3.2 Console Tabs

Flight-computer-style tabs for sectioned content.

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


4.0 Instrumentation Components

4.1 Radial Gauge

A cockpit instrument for displaying a percentage (0-100).

import { motion } from 'framer-motion';

/**
 * @param {number} value - The value to display (0-100).
 * @param {string} label - A small label for the bottom.
 * @param {string} unit - A unit for the value (e.g., '%', 'PSI').
 */
export const RadialGauge = ({ value = 75, label = 'Risk', unit = '%' }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <svg className="w-32 h-32" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background Track */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#222224"
          strokeWidth="8"
          fill="transparent"
        />
        {/* Value Track */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#F04E30"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-mono font-bold text-white">
          {Math.round(value)}
          <span className="text-base text-[#999]">{unit}</span>
        </span>
        <span className="text-xs font-mono uppercase text-[#999]">{label}</span>
      </div>
    </div>
  );
};


4.2 Linear Fuel Gauge

A horizontal, segmented bar for fuel or other linear values.

/**
 * @param {number} value - The value to display (0-100).
 */
export const FuelGauge = ({ value = 60 }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-mono text-[#999]">E</span>
        <span className="text-xs font-mono text-[#999]">F</span>
      </div>
      <div className="relative w-full h-4 bg-[#111113] rounded-sm overflow-hidden border border-[#333]">
        {/* Segments */}
        <div className="absolute inset-0 flex">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex-1 border-r border-[#333]" />
          ))}
        </div>
        {/* Fill */}
        <motion.div
          className="absolute top-0 left-0 h-full bg-[#F04E30]"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </div>
      <div className="text-center mt-1">
        <span className="text-sm font-mono text-white">{value}%</span>
      </div>
    </div>
  );
};


4.3 LED Status Indicator

A simple "LED" light with glow effect for status.

/**
 * @param {'success' | 'warning' | 'danger' | 'offline'} variant
 */
export const StatusLED = ({ variant = 'offline' }) => {
  const colors = {
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-rose-500',
    offline: 'text-[#333]',
  };
  const shouldPulse = variant === 'warning' || variant === 'danger';

  return (
    <div
      className={`
        w-3 h-3 rounded-full transition-all
        ${colors[variant]}
        ${shouldPulse ? 'animate-pulse' : ''}
      `}
      style={{
        backgroundColor: 'currentColor',
        boxShadow: variant !== 'offline' ? '0 0 8px currentColor' : 'none',
      }}
    />
  );
};
