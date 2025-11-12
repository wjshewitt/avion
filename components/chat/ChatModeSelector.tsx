'use client';

import { motion } from 'framer-motion';
import { Plane, CloudRain, Building2, Route } from 'lucide-react';
import { ChatMode } from '@/lib/chat-settings-store';

interface ChatModeSelectorProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  compact?: boolean; // For sidebar (smaller) vs full (with labels)
}

const modes = [
  { 
    id: 'flight-ops' as ChatMode, 
    icon: Plane, 
    label: 'Flight Ops', 
    shortLabel: 'Ops',
    color: '#2563eb',
    description: 'General operations & weather'
  },
  { 
    id: 'weather-brief' as ChatMode, 
    icon: CloudRain, 
    label: 'Weather Brief', 
    shortLabel: 'Weather',
    color: '#0ea5e9',
    description: 'Client-ready briefings'
  },
  { 
    id: 'airport-planning' as ChatMode, 
    icon: Building2, 
    label: 'Airport Planning', 
    shortLabel: 'Airport',
    color: '#8b5cf6',
    description: 'Airport capabilities'
  },
  { 
    id: 'trip-planning' as ChatMode, 
    icon: Route, 
    label: 'Trip Planning', 
    shortLabel: 'Trip',
    color: '#f59e0b',
    description: 'Multi-leg coordination'
  },
];

export default function ChatModeSelector({ mode, onModeChange, compact = false }: ChatModeSelectorProps) {
  const currentMode = modes.find((m) => m.id === mode)!;

  return (
    <div className="bg-background border-b border-border">
      <div className={`flex items-center gap-0.5 ${compact ? 'px-2 py-1' : 'px-3 py-2'}`}>
        {modes.map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={`relative flex-1 transition-colors ${
                compact ? 'px-2 py-1.5' : 'px-3 py-2'
              } ${
                isActive 
                  ? 'text-white' 
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title={m.description}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0"
                  style={{ backgroundColor: m.color }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className={`relative flex items-center justify-center gap-1.5 ${
                compact ? 'text-[11px]' : 'text-xs'
              } font-medium`}>
                <Icon size={compact ? 12 : 14} />
                {!compact && <span className="hidden sm:inline">{m.shortLabel}</span>}
                {compact && <span className="hidden md:inline">{m.shortLabel}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
