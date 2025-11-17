"use client";

import { useState, useEffect, useRef } from "react";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Search } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useFlights } from "@/lib/tanstack/hooks/useFlights";
import HeaderSearchDropdown from "@/components/header-search-dropdown";
import {
  debouncedSearch,
  cancelSearch,
  getRecentSearches,
  type SearchResults,
  type RecentSearch,
} from "@/lib/search/unified-search";

interface AnimatedSearchBoxProps {
  currentRoute: string;
}

const PLACEHOLDERS: Record<string, string> = {
  "/": "Search flights, weather, airports...",
  "/flights": "Filter by FL###, airport code, status...",
  "/weather": "Compare weather: KJFK KLAX",
  "/airports": "Search by ICAO, IATA, or city...",
  "/chat": "Ask about operations, weather, risks...",
  "/chat-enhanced": "Ask about operations, weather, risks...",
};

export function AnimatedSearchBox({ currentRoute }: AnimatedSearchBoxProps) {
  const { aiChatOpen, searchValue, setSearchValue } = useAppStore();
  const { data: flights = [] } = useFlights();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchSelectedIndex, setSearchSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (aiChatOpen) {
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
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSearchDropdown]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!aiChatOpen) {
          inputRef.current?.focus();
          setShowSearchDropdown(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aiChatOpen]);

  const placeholder = aiChatOpen 
    ? "Ask about flights, weather, airports..."
    : (PLACEHOLDERS[currentRoute] || "Search...");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      if (aiChatOpen) {
        if ((window as any).__aiChatSend) {
          (window as any).__aiChatSend(searchValue);
          setSearchValue("");
        }
      } else {
        if ((window as any).__headerSearchSelectCurrent) {
          (window as any).__headerSearchSelectCurrent();
          setSearchValue("");
          setShowSearchDropdown(false);
        }
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (aiChatOpen) return;

    if (!showSearchDropdown) {
      if (e.key !== "Escape") {
        setShowSearchDropdown(true);
      }
      return;
    }

    const totalResults = (searchResults?.airports.length || 0) + (searchResults?.flights.length || 0);
    const hasRecent = searchValue.length < 2 && recentSearches.length > 0;
    const maxIndex = hasRecent ? recentSearches.length - 1 : totalResults - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSearchSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSearchSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Escape":
        e.preventDefault();
        setShowSearchDropdown(false);
        setSearchSelectedIndex(0);
        break;
    }
  };

  const handleAISendClick = () => {
    if (searchValue.trim() && aiChatOpen) {
      if ((window as any).__aiChatSend) {
        (window as any).__aiChatSend(searchValue);
        setSearchValue("");
      }
    }
  };

  return (
    <form onSubmit={handleSearchSubmit} className="relative" style={{ width: "418px" }}>
      <div ref={dropdownContainerRef} className="relative">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => !aiChatOpen && setShowSearchDropdown(true)}
            onKeyDown={handleSearchKeyDown}
            placeholder={placeholder}
            className={`${aiChatOpen ? "h-10" : "h-8"} px-5 placeholder:text-muted-foreground focus:outline-none transition-all duration-200 ease-out bg-surface text-foreground rounded-sm`}
            style={{
              width: "418px",
              borderColor: "var(--border)",
              borderWidth: "1px",
              borderStyle: "solid",
              boxShadow:
                "inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)",
              paddingRight: aiChatOpen ? "48px" : "80px",
              fontFamily:
                "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
              fontSize: "12px",
            }}
            autoComplete="off"
          />

          
          <AnimatePresence mode="wait">
            {!aiChatOpen && (
              <motion.div
                key="search-icons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
              >
                <span className="text-[10px] font-mono text-muted-foreground">⌘K</span>
                <Search size={16} className="text-muted-foreground" strokeWidth={1.5} />
              </motion.div>
            )}
            
            {aiChatOpen && (
              <motion.button
                key="send-button"
                type="button"
                onClick={handleAISendClick}
                disabled={!searchValue.trim()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 ${aiChatOpen ? "w-8 h-8" : "w-6 h-6"} rounded-sm flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{
                  backgroundColor: "var(--accent-primary)",
                  color: "var(--color-text-inverse)",
                  border: "1px solid color-mix(in srgb, var(--accent-primary) 65%, black 35%)",
                  boxShadow:
                    "0 2px 4px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
                title="Send (Enter)"
              >
                <Send size={aiChatOpen ? 16 : 14} className="text-[color:var(--color-text-inverse)]" strokeWidth={1.5} />
              </motion.button>
            )}
          </AnimatePresence>

          {!aiChatOpen && showSearchDropdown && (
            <HeaderSearchDropdown
              results={searchResults}
              recentSearches={recentSearches}
              isLoading={isSearching}
              selectedIndex={searchSelectedIndex}
              onSelectIndex={setSearchSelectedIndex}
              onClose={() => {
                setShowSearchDropdown(false);
                setSearchValue("");
                setSearchSelectedIndex(0);
                setRecentSearches(getRecentSearches());
              }}
              inputValue={searchValue}
            />
          )}
        </div>
      </div>
    </form>
  );
}
