'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
 tags: string[];
 onChange: (tags: string[]) => void;
 placeholder?: string;
}

export default function TagInput({ tags, onChange, placeholder = 'Add tags...' }: TagInputProps) {
 const [input, setInput] = useState('');

 const addTag = (tag: string) => {
 const trimmed = tag.trim();
 if (trimmed && !tags.includes(trimmed)) {
 onChange([...tags, trimmed]);
 }
 setInput('');
 };

 const removeTag = (index: number) => {
 onChange(tags.filter((_, i) => i !== index));
 };

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 addTag(input);
 } else if (e.key === 'Backspace' && !input && tags.length > 0) {
 removeTag(tags.length - 1);
 }
 };

 return (
 <div className="w-full bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-3 flex flex-wrap gap-2 items-center">
 <AnimatePresence>
 {tags.map((tag, index) => (
 <motion.div
 key={tag}
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-medium"
 >
 <span>{tag}</span>
 <button
 onClick={() => removeTag(index)}
 className="hover:text-blue-900 transition-colors"
 >
 <X size={14} />
 </button>
 </motion.div>
 ))}
 </AnimatePresence>
 <input
 type="text"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={handleKeyDown}
 onBlur={() => input && addTag(input)}
 placeholder={tags.length === 0 ? placeholder : ''}
 className="flex-1 min-w-[120px] outline-none text-text-primary dark:text-slate-50 placeholder:text-text-secondary dark:text-slate-400"
 />
 </div>
 );
}
