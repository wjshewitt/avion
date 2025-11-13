'use client';

import { useState, useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Send } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';
import UserMenu from '@/components/user-menu';
import { ThemeToggleSimple } from '@/components/ui/theme-switch';
import HeaderSearchDropdown from '@/components/header-search-dropdown';
import { 
  debouncedSearch, 
  cancelSearch, 
  getRecentSearches,
  type SearchResults,
  type RecentSearch,
} from '@/lib/search/unified-search';

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
  const { alerts, aiChatOpen, toggleAiChat, searchValue, setSearchValue } = useAppStore();
  const { data: flights = [] } = useFlights();
  const [utcTime, setUtcTime] = useState('');
  const [systemStatus] = useState<'operational' | 'degraded'>('operational');
  const inputRef = React.useRef<HTMLInputElement>(null);
  
  // Search state
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const dropdownContainerRef = React.useRef<HTMLDivElement>(null);

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

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Handle search input changes with debouncing
  useEffect(() => {
    if (aiChatOpen) {
      // Don't search when AI chat is open
      setShowSearchDropdown(false);
      setSearchResults(null);
      return;
    }

    if (searchValue.length === 0) {
      setSearchResults(null);
      setIsSearching(false);
      setSearchSelectedIndex(0);
      return;
    }

    if (searchValue.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    debouncedSearch(searchValue, flights, (results) => {
      setSearchResults(results);
      setIsSearching(false);
      setSearchSelectedIndex(0);
    });

    return () => {
      cancelSearch();
    };
  }, [searchValue, flights, aiChatOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    if (showSearchDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchDropdown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!aiChatOpen) {
          inputRef.current?.focus();
          setShowSearchDropdown(true);
        }
      }
      
      // Cmd/Ctrl + J to toggle AI sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        toggleAiChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiChatOpen, toggleAiChat]);

  // Calculate active flights
  const activeFlightsCount = flights.filter(
    (f) => f.status !== 'Cancelled'
  ).length;

  // Get context-aware placeholder
  const placeholder = PLACEHOLDERS[currentRoute] || 'Search...';

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      if (aiChatOpen) {
        // Send to AI chat
        if ((window as any).__aiChatSend) {
          (window as any).__aiChatSend(searchValue);
          setSearchValue(''); // Clear after sending
        }
      } else {
        // Select first search result
        if ((window as any).__headerSearchSelectCurrent) {
          (window as any).__headerSearchSelectCurrent();
          setSearchValue('');
          setShowSearchDropdown(false);
        }
      }
    }
  };

  // Handle search input keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (aiChatOpen) return;

    if (!showSearchDropdown) {
      if (e.key !== 'Escape') {
        setShowSearchDropdown(true);
      }
      return;
    }

    const totalResults = (searchResults?.airports.length || 0) + (searchResults?.flights.length || 0);
    const hasRecent = searchValue.length < 2 && recentSearches.length > 0;
    const maxIndex = hasRecent ? recentSearches.length - 1 : totalResults - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSearchSelectedIndex(prev => Math.min(prev + 1, maxIndex));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSearchSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Escape':
        e.preventDefault();
        setShowSearchDropdown(false);
        setSearchSelectedIndex(0);
        break;
      // Enter is handled by form submit
    }
  };

  const handleAISendClick = () => {
    if (searchValue.trim() && aiChatOpen) {
      if ((window as any).__aiChatSend) {
        (window as any).__aiChatSend(searchValue);
        setSearchValue('');
      }
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
    <header className="h-16 border-b border-border bg-card flex items-center px-8 gap-6 relative">
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

      {/* Search Input - Transforms when AI chat is open */}
      <div className={`
        transition-all duration-300 ease-out
        ${aiChatOpen 
          ? 'absolute right-0 w-96' 
          : 'flex-1 max-w-2xl relative'
        }
      `}>
        <form onSubmit={handleSearchSubmit} className="relative">
          <div ref={dropdownContainerRef} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => !aiChatOpen && setShowSearchDropdown(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder={aiChatOpen ? "Ask about flights, weather, airports..." : placeholder}
              className={`
                w-full h-10 px-4
                bg-background border text-sm
                text-foreground placeholder:text-muted-foreground
                focus:outline-none focus:border-blue
                transition-all duration-300
                ${aiChatOpen 
                  ? 'border-blue pr-12' 
                  : 'border-border'
                }
              `}
              autoComplete="off"
            />
            {!aiChatOpen && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-text-secondary pointer-events-none">
                ⌘K
              </div>
            )}
            {aiChatOpen && (
              <button
                type="button"
                onClick={handleAISendClick}
                disabled={!searchValue.trim()}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            )}
            
            {/* Search Dropdown */}
            {!aiChatOpen && showSearchDropdown && (
              <HeaderSearchDropdown
                results={searchResults}
                recentSearches={recentSearches}
                isLoading={isSearching}
                selectedIndex={searchSelectedIndex}
                onSelectIndex={setSearchSelectedIndex}
                onClose={() => {
                  setShowSearchDropdown(false);
                  setSearchValue('');
                  setSearchSelectedIndex(0);
                  setRecentSearches(getRecentSearches()); // Refresh recent searches
                }}
                inputValue={searchValue}
              />
            )}
          </div>
        </form>
      </div>

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

        {/* AI Trigger Button - Hidden on enhanced chat page */}
        {currentRoute !== '/chat-enhanced' && (
          <button
            onClick={toggleAiChat}
            className={`
              w-9 h-9 border transition-all duration-200
              flex items-center justify-center
              ${aiChatOpen 
                ? 'bg-blue border-blue text-white' 
                : 'border-border text-blue hover:bg-surface'
              }
            `}
            title="AI Assistant (⌘J)"
          >
            <Sparkles size={18} />
          </button>
        )}

        {/* User Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
