'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, Sparkles, Search, Terminal } from 'lucide-react';

type InputMode = 'ask' | 'search' | 'command';

interface AIInputProps {
 onSubmit?: (value: string, mode: InputMode) => void;
 placeholder?: string;
}

export default function AIInput({ onSubmit, placeholder = 'Ask anything...' }: AIInputProps) {
 const [mode, setMode] = useState<InputMode>('ask');
 const [value, setValue] = useState('');

 const modes = [
 { id: 'ask' as InputMode, icon: Sparkles, label: 'Ask', color: '#2563eb' },
 { id: 'search' as InputMode, icon: Search, label: 'Search', color: '#10b981' },
 { id: 'command' as InputMode, icon: Terminal, label: 'Command', color: '#f59e0b' },
 ];

 const currentMode = modes.find((m) => m.id === mode)!;
 const Icon = currentMode.icon;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (value.trim()) {
 onSubmit?.(value, mode);
 setValue('');
 }
 };

 return (
 <form onSubmit={handleSubmit} className="w-full">
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 overflow-hidden">
 <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border dark:border-slate-700">
 {modes.map((m) => {
 const ModeIcon = m.icon;
 return (
 <button
 key={m.id}
 type="button"
 onClick={() => setMode(m.id)}
 className={`relative px-2 py-1 text-xs font-medium transition-colors flex-1 ${
 mode === m.id ? 'text-white' : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'
 }`}
 >
 {mode === m.id && (
 <motion.div
 layoutId="activeMode"
 className="absolute inset-0"
 style={{ backgroundColor: m.color }}
 transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
 />
 )}
 <span className="relative flex items-center justify-center gap-1">
 <ModeIcon size={12} />
 <span className="hidden sm:inline">{m.label}</span>
 </span>
 </button>
 );
 })}
 </div>
 <div className="flex items-center gap-2 px-3 py-2.5">
 <Icon size={16} style={{ color: currentMode.color }} className="flex-shrink-0" />
 <input
 type="text"
 value={value}
 onChange={(e) => setValue(e.target.value)}
 placeholder={placeholder}
 className="flex-1 outline-none text-sm text-text-primary dark:text-slate-50 placeholder:text-text-secondary dark:text-slate-400"
 />
 <button
 type="submit"
 disabled={!value.trim()}
 className="p-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
 style={{ 
 color: value.trim() ? currentMode.color : '#9ca3af',
 backgroundColor: value.trim() ? `${currentMode.color}15` : 'transparent'
 }}
 >
 <Send size={16} />
 </button>
 </div>
 </div>
 </form>
 );
}
