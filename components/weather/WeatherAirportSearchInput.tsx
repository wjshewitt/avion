'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Pin } from 'lucide-react';
import { unifiedSearch, addRecentSearch, type SearchResults } from '@/lib/search/unified-search';
import { useAppStore } from '@/lib/store';
import { useAirfieldWeather } from '@/lib/tanstack/hooks/useAirfieldWeather';

interface WeatherAirportSearchInputProps {
  onAirportSelect: (icao: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
}

export function WeatherAirportSearchInput({
  onAirportSelect,
  placeholder = "Search airports by code, city, or name...",
  autoFocus = false,
  initialValue = "",
}: WeatherAirportSearchInputProps) {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const { pinAirport, isPinned } = useAppStore();

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchValue.trim().length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const searchResults = await unifiedSearch(searchValue.trim());
      setResults(searchResults);
      setIsLoading(false);
      setIsOpen(true);
      setSelectedIndex(-1);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchValue]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((icao: string, airportName: string, iata?: string) => {
    onAirportSelect(icao);
    setSearchValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    // Add to recent searches
    addRecentSearch({
      type: 'airport',
      id: icao,
      label: `${icao}${iata ? ` · ${iata}` : ''}`,
      sublabel: airportName,
    });
  }, [onAirportSelect]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || results.airports.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.airports.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.airports.length) {
          const airport = results.airports[selectedIndex];
          handleSelect(airport.icao, airport.name, airport.iata);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative w-full">
      <div className="groove-input flex items-center">
        <Search size={16} className="text-muted-foreground ml-4 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-3 pr-4 py-2.5 border-none text-sm font-mono uppercase text-foreground placeholder:text-muted-foreground focus:outline-none"
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 size={14} className="text-muted-foreground mr-4 animate-spin flex-shrink-0" />
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results && results.airports.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 rounded-sm border border-border bg-card shadow-lg max-h-96 overflow-y-auto"
          role="listbox"
        >
          {results.airports.map((airport, index) => (
            <AirportResultRow
              key={airport.icao}
              airport={airport}
              index={index}
              isSelected={index === selectedIndex}
              isPinned={isPinned(airport.icao)}
              onSelect={() => handleSelect(airport.icao, airport.name, airport.iata)}
              onPin={() => pinAirport(airport.icao)}
              onMouseEnter={() => setSelectedIndex(index)}
            />
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && !isLoading && results && results.airports.length === 0 && searchValue.length >= 2 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 rounded-sm border border-border bg-card shadow-lg"
        >
          <div className="p-4 text-center text-xs text-muted-foreground">
            <Search size={20} className="mx-auto mb-2 text-muted-foreground" />
            <p className="font-medium text-foreground mb-1">No results for &quot;{searchValue}&quot;</p>
            <p className="text-[11px]">Try searching for an airport code (e.g., KJFK) or city name.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Airport Result Row
// ============================================================================

interface AirportResultRowProps {
  airport: any;
  index: number;
  isSelected: boolean;
  isPinned: boolean;
  onSelect: () => void;
  onPin: () => void;
  onMouseEnter: () => void;
}

function AirportResultRow({
  airport,
  index,
  isSelected,
  isPinned,
  onSelect,
  onPin,
  onMouseEnter,
}: AirportResultRowProps) {
  const { data: weather } = useAirfieldWeather(
    airport.icao,
    { 
      enabled: isSelected,
      staleTime: 5 * 60 * 1000,
    }
  );

  const handlePinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <div
      data-index={index}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      className={`
        w-full text-left px-3 py-3 border-b border-border last:border-0
        transition-colors cursor-pointer
        ${isSelected ? 'bg-muted/80' : 'hover:bg-muted/60'}
        focus:outline-none focus:ring-2 focus:ring-[--accent-primary] focus:ring-inset
      `}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start justify-between">
        {/* LEFT: Airport Info */}
        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-[13px] font-mono font-semibold text-foreground">
              {airport.icao}
            </span>
            {airport.iata && (
              <span className="text-[13px] font-mono text-muted-foreground">
                · {airport.iata}
              </span>
            )}
          </div>
          <div className="text-[12px] text-foreground truncate">
            {airport.name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {airport.city}, {airport.country}
          </div>
        </div>

        {/* RIGHT: Weather + Pin */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          {weather?.metar && weather.metar.temperature?.celsius !== undefined && (
            <span className="text-[12px] font-mono text-foreground">
              {Math.round(weather.metar.temperature.celsius)}°C
            </span>
          )}
          
          {weather?.metar?.flight_category && (
            <FlightCategoryBadge category={weather.metar.flight_category} />
          )}

          <button
            onClick={handlePinClick}
            className={`flex items-center gap-1 text-xs transition-colors ${
              isPinned 
                ? 'text-[--accent-primary]' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={isPinned ? 'Pinned' : 'Pin location'}
            tabIndex={-1}
          >
            <Pin size={14} className={isPinned ? 'fill-current' : ''} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Flight Category Badge
// ============================================================================

function FlightCategoryBadge({ category }: { category?: string }) {
  const getClasses = () => {
    switch (category) {
      case 'VFR':
        return 'bg-emerald-100 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600/30';
      case 'MVFR':
        return 'bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600/30';
      case 'IFR':
        return 'bg-amber-100 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600/30';
      case 'LIFR':
        return 'bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-600/30';
      default:
        return 'bg-gray-100 dark:bg-zinc-700 text-gray-700 dark:text-zinc-300 border-gray-300 dark:border-zinc-600';
    }
  };

  if (!category) return null;

  return (
    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getClasses()}`}>
      {category}
    </span>
  );
}
