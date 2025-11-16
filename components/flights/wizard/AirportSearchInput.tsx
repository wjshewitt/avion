'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Clock, Star } from 'lucide-react';
import { useAirportSearch, useRecentAirports, useAirportFavorites } from '@/lib/tanstack/hooks/useAirports';
import { motion, AnimatePresence } from 'framer-motion';
import type { AirportSearchResult } from '@/types/airports';

interface SelectedAirport {
  icao: string;
  iata?: string;
  name: string;
  city: string;
  country: string;
}

interface AirportSearchInputProps {
  label: string;
  value: SelectedAirport | null;
  onChange: (airport: SelectedAirport | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
}

export default function AirportSearchInput({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Search by ICAO, IATA, or name...',
}: AirportSearchInputProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { recent, addRecent } = useRecentAirports();
  const { favorites, isFavorite } = useAirportFavorites();

  const { data: searchResults, isLoading } = useAirportSearch(
    {
      query,
      limit: 10,
      popularFirst: true,
    },
    {
      enabled: query.length >= 2,
    }
  );

  // Show recent/favorites when input is empty
  const showSuggestions = query.length === 0 && (recent.length > 0 || favorites.length > 0);
  const displayResults = query.length >= 2 ? searchResults : [];
  const showDropdown = isOpen && (displayResults?.length || showSuggestions);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults, query]);

  const handleSelect = (airport: AirportSearchResult | SelectedAirport) => {
    const selected: SelectedAirport = 'airport' in airport
      ? {
          icao: airport.airport.icao,
          iata: airport.airport.iata || undefined,
          name: airport.airport.name,
          city: airport.airport.city,
          country: airport.airport.country,
        }
      : {
          icao: airport.icao,
          iata: airport.iata,
          name: airport.name,
          city: airport.city || '',
          country: airport.country || '',
        };

    onChange(selected);
    addRecent(selected);
    setQuery('');
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;

    const results = displayResults || [];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-1">
        {label}
        {required && <span className="text-red ml-1">*</span>}
      </label>

      {value ? (
        <div className="flex items-center justify-between p-3 border border-border bg-surface rounded-sm">
          <div className="flex-1">
            <div className="font-mono font-semibold text-foreground">
              {value.icao}
              {value.iata && ` (${value.iata})`}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {value.name}
              {value.city && `, ${value.city}`}
            </div>
          </div>
          <button
            onClick={handleClear}
            className="ml-3 text-[11px] font-mono uppercase tracking-[0.14em] text-blue hover:underline"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full h-10 pl-10 pr-4 text-sm bg-background border rounded-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] ${
              error ? 'border-red' : 'border-border'
            }`}
          />
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red">{error}</p>
      )}

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-surface border border-border shadow-lg max-h-80 overflow-y-auto rounded-sm"
          >
            {/* Loading */}
            {isLoading && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                Searching...
              </div>
            )}

            {/* Search Results */}
            {displayResults && displayResults.length > 0 && (
              <div>
                {displayResults.map((result, index) => (
                  <button
                    key={result.airport.icao}
                    onClick={() => handleSelect(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left p-3 transition-colors ${
                      index === selectedIndex ? 'bg-muted' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin size={16} className="text-blue mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-mono font-semibold text-foreground">
                          {result.airport.icao}
                          {result.airport.iata && ` · ${result.airport.iata}`}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.airport.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {result.airport.city}, {result.airport.country}
                        </div>
                      </div>
                      {isFavorite(result.airport.icao) && (
                        <Star size={14} className="text-amber flex-shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !isLoading && displayResults?.length === 0 && (
              <div className="p-4 text-sm text-muted-foreground text-center">
                No airports found for &quot;{query}&quot;
              </div>
            )}

            {/* Recent airports */}
            {showSuggestions && recent.length > 0 && (
              <div>
                <div className="px-3 py-2 text-[10px] font-mono font-semibold text-muted-foreground uppercase tracking-[0.18em] bg-muted">
                  Recent
                </div>
                {recent.slice(0, 5).map((airport) => (
                  <button
                    key={airport.icao}
                    onClick={() => handleSelect(airport)}
                    className="w-full text-left p-3 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <Clock size={16} className="text-gray mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-mono font-semibold text-foreground">
                          {airport.icao}
                          {airport.iata && ` · ${airport.iata}`}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {airport.name}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
