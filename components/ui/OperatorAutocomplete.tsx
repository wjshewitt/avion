'use client';

import { useState, useEffect, useRef } from 'react';
import { Building2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface Operator {
  id: string;
  name: string;
  domain: string | null;
  region: string | null;
  logo_url?: string | null;
}

interface OperatorAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Logo component with loading and fallback - Direct CDN loading
const OperatorLogo = ({ domain }: { domain: string | null }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  
  if (!domain || error) {
    return <Building2 size={16} className="text-zinc-400" strokeWidth={1.5} />;
  }
  
  // Use Logo.dev CDN directly with publishable key (browser cached)
  const apiKey = process.env.NEXT_PUBLIC_LOGO_DEV_KEY || '';
  const logoUrl = apiKey 
    ? `https://img.logo.dev/${domain}?token=${apiKey}&size=64&format=webp&theme=auto&fallback=monogram`
    : `https://img.logo.dev/${domain}?size=64&format=webp&fallback=monogram`;
  
  return (
    <div className="relative w-8 h-8 shrink-0">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Building2 size={16} className="text-zinc-600" strokeWidth={1.5} />
        </div>
      )}
      <img
        src={logoUrl}
        alt=""
        className="w-8 h-8 object-contain"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        style={{ display: loading ? 'none' : 'block' }}
      />
    </div>
  );
};

export default function OperatorAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search operators or enter custom name...",
  className = ""
}: OperatorAutocompleteProps) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch operators with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim().length > 0) {
        fetchOperators(value);
      } else {
        fetchOperators(''); // Fetch all when empty
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const fetchOperators = async (search: string) => {
    setLoading(true);
    try {
      const url = search 
        ? `/api/operators?search=${encodeURIComponent(search)}`
        : '/api/operators';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setOperators(data.operators || []);
        setShowSuggestions(true);
        setSelectedIndex(0);
      }
    } catch (error) {
      console.error('Error fetching operators:', error);
      setOperators([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle operator selection
  const handleOperatorSelect = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
    setSelectedIndex(0);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || operators.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, operators.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (operators[selectedIndex]) {
          handleOperatorSelect(operators[selectedIndex].name);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        break;
    }
  };

  // Scroll selected item into view
  useEffect(() => {
    if (showSuggestions && dropdownRef.current) {
      const selectedButton = dropdownRef.current.querySelector(
        `[data-operator-index="${selectedIndex}"]`
      );
      if (selectedButton) {
        selectedButton.scrollIntoView({ 
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, showSuggestions]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Integrated Input with Avion Styling */}
      <div className="groove-input rounded-sm px-4 py-3 flex items-center gap-2">
        <Building2 size={16} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            // Fetch all operators on focus if not already loaded
            if (operators.length === 0 && value.trim().length === 0) {
              fetchOperators('');
            } else if (operators.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className="w-full text-sm text-foreground placeholder:text-muted-foreground focus:outline-none bg-transparent"
        />
      </div>

      {/* Integrated Dropdown Panel */}
      <AnimatePresence>
        {showSuggestions && operators.length > 0 && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-50 w-full mt-1 rounded-sm overflow-hidden bg-white dark:bg-[#2A2A2A] border border-zinc-300 dark:border-[#333]"
            style={{
              boxShadow: '0 4px 12px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.1)',
            }}
          >
            {/* Header Bar - Instrument Style */}
            <div className="px-3 py-1.5 border-b border-zinc-300/50 dark:border-zinc-700/50 bg-zinc-100/80 dark:bg-zinc-900/50">
              <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-500">
                Charter Operators
              </div>
            </div>

            {/* Scrollable Operators List */}
            <div className="max-h-64 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                    Loading...
                  </div>
                </div>
              ) : (
                operators.map((op, idx) => (
                  <button
                    key={op.id}
                    data-operator-index={idx}
                    onClick={() => handleOperatorSelect(op.name)}
                    className="w-full px-3 py-2.5 flex items-center gap-3 text-left transition-all border-b border-zinc-300/30 dark:border-zinc-800/50 last:border-b-0 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 group [&[data-zebra='true']]:bg-zinc-100/40 dark:[&[data-zebra='true']]:bg-black/20"
                    style={{
                      background: idx === selectedIndex 
                        ? 'rgba(240, 78, 48, 0.1)' 
                        : undefined,
                    }}
                    data-zebra={idx % 2 === 0 ? 'true' : 'false'}
                  >
                    {/* Logo with LED-style indicator */}
                    <div className="relative shrink-0">
                      <OperatorLogo domain={op.domain} />
                      {/* LED indicator on hover */}
                      <div 
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                        style={{ boxShadow: '0 0 4px rgba(16,185,129,0.6)' }} 
                      />
                    </div>

                    {/* Operator Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                        {op.name}
                      </div>
                      {op.region && (
                        <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-500 mt-0.5">
                          {op.region}
                        </div>
                      )}
                    </div>

                    {/* Arrow indicator on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <div 
                        className="w-1 h-4 bg-[#F04E30]" 
                        style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} 
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
