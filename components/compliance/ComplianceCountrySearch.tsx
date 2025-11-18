'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { restructuredCountryRequirements } from '@/lib/compliance/restructured-countries';
import type { RestructuredCountryRequirement } from '@/types/compliance';

interface ComplianceCountrySearchProps {
  onCountrySelect: (country: RestructuredCountryRequirement) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function ComplianceCountrySearch({
  onCountrySelect,
  placeholder = "Search countries by name or code...",
  autoFocus = false,
}: ComplianceCountrySearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [results, setResults] = useState<RestructuredCountryRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchValue.trim().length < 1) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    searchTimeoutRef.current = setTimeout(() => {
      const query = searchValue.trim().toLowerCase();
      const filteredResults = restructuredCountryRequirements.filter(country => 
        country.countryName.toLowerCase().includes(query) || 
        country.countryCode.toLowerCase().includes(query)
      );
      setResults(filteredResults);
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

  const handleSelect = useCallback((country: RestructuredCountryRequirement) => {
    onCountrySelect(country);
    setSearchValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
  }, [onCountrySelect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!results || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        } else if (results.length > 0) {
          handleSelect(results[0]);
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
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent pl-3 pr-4 py-2.5 border-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          autoFocus={autoFocus}
          autoComplete="off"
        />
        {isLoading && (
          <Loader2 size={14} className="text-muted-foreground mr-4 animate-spin flex-shrink-0" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 rounded-sm border border-border bg-card shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {results.map((country, index) => (
            <div
              key={country.id}
              onClick={() => handleSelect(country)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer ${selectedIndex === index ? 'bg-muted' : 'hover:bg-muted/50'}`}
              role="option"
              aria-selected={selectedIndex === index}
            >
              <p className="font-semibold text-sm text-foreground">{country.countryName}</p>
              <p className="text-xs text-muted-foreground">{country.countryCode} - {country.region}</p>
            </div>
          ))}
        </div>
      )}

      {isOpen && !isLoading && results.length === 0 && searchValue.length >= 1 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 rounded-sm border border-border bg-card shadow-lg p-4 text-center text-sm text-muted-foreground"
        >
          No countries found for &quot;{searchValue}&quot;
        </div>
      )}
    </div>
  );
}
