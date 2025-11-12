'use client';

import { useState } from 'react';

interface CommandBarProps {
 onCommand?: (command: string) => void;
}

export default function CommandBar({ onCommand }: CommandBarProps) {
 const [value, setValue] = useState('');

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (value.trim() && onCommand) {
 onCommand(value);
 setValue('');
 }
 };

 return (
 <form onSubmit={handleSubmit} className="w-full max-w-2xl">
 <div className="relative">
 <input
 type="text"
 value={value}
 onChange={(e) => setValue(e.target.value)}
 placeholder="⌘ Ask about flights, weather, or routes..."
 className="
 w-full px-4 py-3 
 bg-card border border-border 
 text-md text-foreground placeholder:text-muted-foreground
 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue
 transition-all duration-150
"
 />
 </div>
 </form>
 );
}
