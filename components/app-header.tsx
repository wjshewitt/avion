'use client';

import { useState, useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import UserMenu from '@/components/user-menu';
import { ThemeToggleSimple } from '@/components/ui/theme-switch';

interface AppHeaderProps {
  currentRoute: string;
}

const PLACEHOLDERS: Record<string, string> = {
  '/': 'Search flights, weather, airports...',
  '/flights': 'Filter by FL###, airport code, status...',
  '/weather': 'Compare weather: KJFK KLAX',
  '/airports': 'Search by ICAO, IATA, or city...',
  '/chat': 'Ask about operations, weather, risks...',
  '/chat-enhanced': 'Ask about operations, weather, risks...',
};

export default function AppHeader({ currentRoute }: AppHeaderProps) {
  const router = useRouter();
  const { alerts } = useAppStore();
  const { data: flights = [] } = useFlights();
  const [utcTime, setUtcTime] = useState('');
  const [commandValue, setCommandValue] = useState('');
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded'>('operational');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Update UTC time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`${hours}:${minutes} UTC`);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to focus command input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Calculate active flights
  const activeFlightsCount = flights.filter(
    (f) => f.status !== 'Cancelled'
  ).length;

  // Get context-aware placeholder
  const placeholder = PLACEHOLDERS[currentRoute] || 'Search...';

  // Handle command submit
  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commandValue.trim()) {
      // TODO: Implement command handling logic
      console.log('Command:', commandValue);
      setCommandValue('');
    }
  };

  // Handle alert click
  const handleAlertsClick = () => {
    if (currentRoute !== '/') {
      router.push('/');
    }
    // Scroll to alerts section after navigation
    setTimeout(() => {
      const alertsSection = document.querySelector('[data-section="alerts"]');
      alertsSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle active flights click
  const handleActiveFlightsClick = () => {
    router.push('/flights');
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center px-8 gap-6">
      {/* System Status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div
          className={`w-2 h-2 ${
            systemStatus === 'operational' ? 'bg-green' : 'bg-red'
          }`}
        />
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-secondary">
          {systemStatus}
        </span>
      </div>

      {/* Command Input */}
      <form onSubmit={handleCommandSubmit} className="flex-1 max-w-2xl">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={commandValue}
            onChange={(e) => setCommandValue(e.target.value)}
            placeholder={placeholder}
            className="
              w-full h-10 px-4
              bg-background border border-border
              text-sm text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:border-blue
              transition-colors duration-150
            "
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-secondary pointer-events-none">
            ⌘K
          </div>
        </div>
      </form>

      {/* Right Section: Indicators */}
      <div className="flex items-center gap-6 flex-shrink-0">
        {/* Alert Count */}
        {alerts.length > 0 && (
          <button
            onClick={handleAlertsClick}
            className="text-[12px] font-semibold uppercase tracking-wider text-red hover:underline decoration-2 underline-offset-4 transition-all"
          >
            {alerts.length} {alerts.length === 1 ? 'ALERT' : 'ALERTS'}
          </button>
        )}

        {/* Active Flights Count */}
        <button
          onClick={handleActiveFlightsClick}
          className="text-[12px] font-semibold uppercase tracking-wider text-blue hover:underline decoration-2 underline-offset-4 transition-all"
        >
          {activeFlightsCount} ACTIVE
        </button>

        {/* Theme Toggle */}
        <ThemeToggleSimple />

        {/* UTC Clock */}
        <div className="text-[13px] font-mono text-text-primary">
          {utcTime}
        </div>

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
