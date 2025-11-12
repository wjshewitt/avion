'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plane, Clock, Search as SearchIcon } from 'lucide-react';
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
  const handleSelect = (item: typeof selectableItems[0]) => {
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
  };

  // Handle Enter key to select current item
  const handleSelectCurrent = () => {
    if (selectedIndex >= 0 && selectedIndex < totalItems) {
      handleSelect(selectableItems[selectedIndex]);
    }
  };

  // Expose method to parent for Enter key handling
  useEffect(() => {
    (window as any).__headerSearchSelectCurrent = handleSelectCurrent;
    return () => {
      delete (window as any).__headerSearchSelectCurrent;
    };
  }, [selectedIndex, totalItems]);

  // Don't render if no results and no recent searches
  const showRecent = inputValue.length < 2 && recentSearches.length > 0;
  const showResults = results && (results.airports.length > 0 || results.flights.length > 0);

  if (!showRecent && !showResults && !isLoading) {
    if (inputValue.length >= 2) {
      return (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-card border border-border shadow-lg max-h-96 overflow-y-auto"
        >
          <div className="p-4 text-center text-sm text-text-secondary">
            <SearchIcon size={32} className="mx-auto mb-2 text-text-tertiary" />
            <p>No results found for &quot;{inputValue}&quot;</p>
            <p className="text-xs mt-1 text-text-tertiary">Try searching for an airport code (e.g., KJFK) or flight number</p>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute z-50 w-full mt-1 bg-white dark:bg-card border border-border shadow-lg max-h-96 overflow-y-auto"
      role="listbox"
      aria-label="Search results"
    >
      {isLoading && (
        <div className="p-4 flex items-center justify-center gap-3 text-sm text-text-secondary">
          <ScannerLoader size="sm" color="text-blue" />
          <span className="font-mono">Searching...</span>
        </div>
      )}

      {/* Recent Searches */}
      {showRecent && (
        <div>
          <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wide bg-surface border-l-2 border-transparent hover:border-gray hover:bg-gradient-to-r hover:from-gray/5 hover:to-transparent transition-all duration-200 cursor-default">
            Recent Searches
          </div>
          {recentSearches.map((recent, index) => (
            <button
              key={recent.id}
              data-index={index}
              onClick={() => handleSelect({ type: 'recent', id: recent.id, data: recent })}
              onMouseEnter={() => onSelectIndex(index)}
              className={`w-full text-left p-3 transition-all duration-200 ${
                index === selectedIndex 
                  ? 'bg-gradient-to-r from-gray/5 via-gray/3 to-transparent' 
                  : 'hover:bg-gradient-to-r hover:from-gray/5 hover:via-gray/3 hover:to-transparent'
              }`}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <div className="flex items-start gap-3">
                <Clock size={16} className="text-text-tertiary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-mono font-semibold text-text-primary text-sm">
                    {recent.label}
                  </div>
                  <div className="text-xs text-text-secondary truncate">
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
          <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wide bg-surface border-l-2 border-transparent hover:border-blue hover:bg-gradient-to-r hover:from-blue/5 hover:to-transparent transition-all duration-200 cursor-default">
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
          <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wide bg-surface border-l-2 border-transparent hover:border-blue hover:bg-gradient-to-r hover:from-blue/5 hover:to-transparent transition-all duration-200 cursor-default">
            Flights
          </div>
          {results.flights.map((flight, index) => {
            const globalIndex = results.airports.length + index;
            const statusColors = {
              'On Time': 'text-green',
              'Delayed': 'text-amber',
              'Cancelled': 'text-red',
            };
            const statusColor = statusColors[flight.status as keyof typeof statusColors] || 'text-text-secondary';

            return (
              <button
                key={flight.id}
                data-index={globalIndex}
                onClick={() => handleSelect({ type: 'flight', id: flight.id, data: flight })}
                onMouseEnter={() => onSelectIndex(globalIndex)}
                className={`w-full text-left p-3 transition-all duration-200 ${
                  globalIndex === selectedIndex 
                    ? 'bg-gradient-to-r from-blue/5 via-blue/3 to-transparent' 
                    : 'hover:bg-gradient-to-r hover:from-blue/5 hover:via-blue/3 hover:to-transparent'
                }`}
                role="option"
                aria-selected={globalIndex === selectedIndex}
              >
                <div className="flex items-start gap-3">
                  <Plane size={16} className="text-blue mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono font-semibold text-text-primary text-sm">
                      {flight.code}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {flight.origin} → {flight.destination}
                    </div>
                    <div className={`text-xs font-medium ${statusColor}`}>
                      {flight.status}
                    </div>
                  </div>
                  <div className="text-xs text-blue font-medium">
                    Details
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
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
          ? 'bg-gradient-to-r from-blue/5 via-blue/3 to-transparent' 
          : 'hover:bg-gradient-to-r hover:from-blue/5 hover:via-blue/3 hover:to-transparent'
        }
      `}
      role="option"
      aria-selected={isSelected}
      aria-expanded={isExpanded}
    >
      {/* Collapsed State */}
      <AirportResultCompact airport={airport} weather={weatherData} />

      {/* Expanded State - Swiss Grid System */}
      {isExpanded && (
        <div 
          className="grid grid-cols-2 border-t border-border transform-gpu will-change-transform bg-gradient-to-b from-blue/5 to-transparent"
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
