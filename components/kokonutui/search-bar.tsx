'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
 onSearch?: (query: string) => void;
 placeholder?: string;
 suggestions?: string[];
}

export default function SearchBar({ 
 onSearch, 
 placeholder = 'Search...', 
 suggestions = [] 
}: SearchBarProps) {
 const [query, setQuery] = useState('');
 const [isFocused, setIsFocused] = useState(false);

 const filteredSuggestions = suggestions.filter((s) =>
 s.toLowerCase().includes(query.toLowerCase())
 );

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (query.trim()) {
 onSearch?.(query);
 }
 };

 return (
 <div className="relative w-full">
 <form onSubmit={handleSubmit}>
 <motion.div
 animate={{
 boxShadow: isFocused
 ? '0 0 0 3px rgba(37, 99, 235, 0.1)'
 : '0 0 0 0px rgba(37, 99, 235, 0)',
 }}
 className="relative bg-white dark:bg-slate-900 border border-border dark:border-slate-700 overflow-hidden"
 >
 <div className="flex items-center gap-3 px-4 py-3">
 <Search size={18} className="text-text-secondary dark:text-slate-400" />
 <input
 type="text"
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 onFocus={() => setIsFocused(true)}
 onBlur={() => setTimeout(() => setIsFocused(false), 200)}
 placeholder={placeholder}
 className="flex-1 outline-none text-text-primary dark:text-slate-50 placeholder:text-text-secondary dark:text-slate-400"
 />
 <AnimatePresence>
 {query && (
 <motion.button
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 type="button"
 onClick={() => setQuery('')}
 className="text-text-secondary dark:text-slate-400 hover:text-text-primary dark:text-slate-50 transition-colors"
 >
 <X size={18} />
 </motion.button>
 )}
 </AnimatePresence>
 </div>
 </motion.div>
 </form>

 <AnimatePresence>
 {isFocused && query && filteredSuggestions.length > 0 && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -10 }}
 className="absolute top-full mt-2 left-0 right-0 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 shadow-xl overflow-hidden z-50"
 >
 {filteredSuggestions.map((suggestion, i) => (
 <button
 key={i}
 onClick={() => {
 setQuery(suggestion);
 onSearch?.(suggestion);
 }}
 className="w-full text-left px-4 py-3 hover:bg-surface dark:bg-slate-800 transition-colors text-sm text-text-primary dark:text-slate-50"
 >
 {suggestion}
 </button>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
