'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Clock, Search as SearchIcon } from 'lucide-react';
import type { SearchResults, RecentSearch, AirportSearchMatch } from '@/lib/search/unified-search';
import { addRecentSearch } from '@/lib/search/unified-search';
import { useAirfieldWeather } from '@/lib/tanstack/hooks/useAirfieldWeather';
import { AirportResultCompact } from './search/airport-result-compact';
import { WeatherCell } from './search/weather-cell';
import { AirportInfoCell } from './search/airport-info-cell';
import { ScannerLoader } from './kokonutui/minimal-loaders';

interface HeaderSearchDropdownProps {
  results: SearchResults | null;
  recentSearches: RecentSearch[];
  isLoading: boolean;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onClose: () => void;
  inputValue: string;
}

export default function HeaderSearchDropdown({
  results,
  recentSearches,
  isLoading,
  selectedIndex,
  onSelectIndex,
  onClose,
  inputValue,
}: HeaderSearchDropdownProps) {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all selectable items
  const getSelectableItems = () => {
    const items: Array<{ type: 'airport' | 'flight' | 'recent'; id: string; data: any }> = [];

    if (results) {
      results.airports.forEach(airport => {
        items.push({ type: 'airport', id: airport.icao, data: airport });
      });
      results.flights.forEach(flight => {
        items.push({ type: 'flight', id: flight.id, data: flight });
      });
    } else if (inputValue.length < 2 && recentSearches.length > 0) {
      recentSearches.forEach(recent => {
        items.push({ type: 'recent', id: recent.id, data: recent });
      });
    }

    return items;
  };

  const selectableItems = getSelectableItems();
  const totalItems = selectableItems.length;

  // Scroll selected item into view
  useEffect(() => {
    if (dropdownRef.current && selectedIndex >= 0 && selectedIndex < totalItems) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-index="${selectedIndex}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, totalItems]);

  // Handle item selection
  const handleSelect = useCallback((item: typeof selectableItems[0]) => {
    if (item.type === 'airport') {
      // Navigate to weather page
      router.push(`/weather/${item.data.icao}`);
      
      // Add to recent searches
      addRecentSearch({
        type: 'airport',
        id: item.data.icao,
        label: `${item.data.icao}${item.data.iata ? ` · ${item.data.iata}` : ''}`,
        sublabel: item.data.name,
      });
    } else if (item.type === 'flight') {
      // Navigate to flight detail
      router.push(`/flights/${item.data.id}`);
      
      // Add to recent searches
      addRecentSearch({
        type: 'flight',
        id: item.data.id,
        label: item.data.code,
        sublabel: `${item.data.origin} → ${item.data.destination}`,
      });
    } else if (item.type === 'recent') {
      // Navigate based on recent search type
      if (item.data.type === 'airport') {
        router.push(`/weather/${item.data.id}`);
      } else {
        router.push(`/flights/${item.data.id}`);
      }
    }

    onClose();
  }, [router, onClose]);

  // Handle Enter key to select current item
  const handleSelectCurrent = useCallback(() => {
    if (selectedIndex >= 0 && selectedIndex < totalItems) {
      handleSelect(selectableItems[selectedIndex]);
    }
  }, [selectedIndex, totalItems, selectableItems, handleSelect]);

  // Expose method to parent for Enter key handling
  useEffect(() => {
    (window as any).__headerSearchSelectCurrent = handleSelectCurrent;
    return () => {
      delete (window as any).__headerSearchSelectCurrent;
    };
  }, [handleSelectCurrent]);

  // Don't render if no results and no recent searches
  const showRecent = inputValue.length < 2 && recentSearches.length > 0;
  const showResults = results && (results.airports.length > 0 || results.flights.length > 0);

  if (!showRecent && !showResults && !isLoading) {
    if (inputValue.length >= 2) {
      return (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2"
        >
          <div className="mx-auto max-w-xl rounded-sm border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.18)] overflow-hidden">
            <div className="p-4 text-center text-xs text-muted-foreground">
              <SearchIcon size={20} className="mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium text-foreground mb-1">No results for &quot;{inputValue}&quot;</p>
              <p className="text-[11px] text-muted-foreground">Try searching for an airport code (e.g., KJFK) or flight number.</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full mt-2"
      role="listbox"
      aria-label="Search results"
    >
      <div className="mx-auto max-w-xl rounded-sm border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.18)] max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="p-4 flex items-center justify-center gap-3 text-xs text-muted-foreground border-b border-border/80">
            <ScannerLoader size="sm" color="text-blue" />
            <span className="font-mono">Searching…</span>
          </div>
        )}

        {/* Recent Searches */}
        {showRecent && (
          <div>
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground bg-muted/40 border-b border-border/80">
              Recent Searches
            </div>
            {recentSearches.map((recent, index) => (
              <button
                key={recent.id}
                data-index={index}
                onClick={() => handleSelect({ type: 'recent', id: recent.id, data: recent })}
                onMouseEnter={() => onSelectIndex(index)}
                className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                  index === selectedIndex 
                    ? 'bg-muted/80' 
                    : 'hover:bg-muted/60'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="flex items-start gap-3">
                  <Clock size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-semibold text-foreground text-xs">
                      {recent.label}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {recent.sublabel}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Airport Results */}
        {results && results.airports.length > 0 && (
          <div>
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground bg-muted/40 border-t border-border/80">
              Airports
            </div>
            {results.airports.map((airport, index) => (
              <AirportResultRow
                key={airport.icao}
                airport={airport}
                index={index}
                isSelected={index === selectedIndex}
                onSelect={() => handleSelect({ type: 'airport', id: airport.icao, data: airport })}
                onMouseEnter={() => onSelectIndex(index)}
              />
            ))}
          </div>
        )}

        {/* Flight Results */}
        {results && results.flights.length > 0 && (
          <div>
            <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground bg-muted/40 border-t border-border/80">
              Flights
            </div>
            {results.flights.map((flight, index) => {
              const globalIndex = results.airports.length + index;
              const statusColors = {
                'On Time': 'text-green',
                'Delayed': 'text-amber',
                'Cancelled': 'text-red',
              };
              const statusColor = statusColors[flight.status as keyof typeof statusColors] || 'text-muted-foreground';

              return (
                <button
                  key={flight.id}
                  data-index={globalIndex}
                  onClick={() => handleSelect({ type: 'flight', id: flight.id, data: flight })}
                  onMouseEnter={() => onSelectIndex(globalIndex)}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                    globalIndex === selectedIndex 
                      ? 'bg-muted/80' 
                      : 'hover:bg-muted/60'
                  }`}
                  role="option"
                  aria-selected={globalIndex === selectedIndex}
                >
                  <div className="flex items-start gap-3">
                    <Plane size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono font-semibold text-foreground text-xs">
                        {flight.code}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {flight.origin} → {flight.destination}
                      </div>
                      <div className={`text-[11px] font-medium ${statusColor}`}>
                        {flight.status}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Airport Result Row with Hover Expansion
// ============================================================================

interface AirportResultRowProps {
  airport: AirportSearchMatch;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

const HOVER_DELAY = 400; // ms - Dieter Rams: Deliberate, not accidental

function AirportResultRow({
  airport,
  index,
  isSelected,
  onSelect,
  onMouseEnter,
}: AirportResultRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Lazy load weather if not prefetched
  const { data: lazyWeather, isLoading } = useAirfieldWeather(
    airport.icao,
    { 
      enabled: isExpanded && !airport.weather,
      staleTime: 5 * 60 * 1000,
    }
  );

  const weatherData = airport.weather || lazyWeather;

  const handleMouseEnterRow = () => {
    onMouseEnter();
    
    // Delayed expansion (400ms)
    const timeout = setTimeout(() => {
      setIsExpanded(true);
    }, HOVER_DELAY);
    
    setHoverTimeout(timeout);
  };

  const handleMouseLeaveRow = () => {
    // Cancel expansion if mouse leaves quickly
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    // Collapse immediately
    setIsExpanded(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <button
      data-index={index}
      onClick={onSelect}
      onMouseEnter={handleMouseEnterRow}
      onMouseLeave={handleMouseLeaveRow}
      className={`
        w-full text-left border-b border-border last:border-0
        transition-all duration-200
        ${isSelected 
          ? 'bg-muted/80' 
          : 'hover:bg-muted/60'
        }
      `}
      role="option"
      aria-selected={isSelected}
    >
      {/* Collapsed State */}
      <AirportResultCompact airport={airport} weather={weatherData} />

      {/* Expanded State - Swiss Grid System */}
      {isExpanded && (
        <div 
          className="grid grid-cols-2 border-t border-border transform-gpu will-change-transform bg-muted/40"
          style={{
            animation: 'expandHeight 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <AirportInfoCell airport={airport} />
          <WeatherCell weather={weatherData} isLoading={isLoading} />
        </div>
      )}
    </button>
  );
}

// Inline keyframes for smooth expansion
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes expandHeight {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  if (!document.head.querySelector('style[data-search-animations]')) {
    style.setAttribute('data-search-animations', 'true');
    document.head.appendChild(style);
  }
}
