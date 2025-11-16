'use client';

import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsiblePanelProps {
 title: string;
 children: React.ReactNode;
 defaultExpanded?: boolean;
 storageKey?: string;
 minHeight?: string;
}

export default function CollapsiblePanel({
 title,
 children,
 defaultExpanded = true,
 storageKey,
 minHeight = '60px',
}: CollapsiblePanelProps) {
 const [isExpanded, setIsExpanded] = useState(defaultExpanded);

 useEffect(() => {
 if (storageKey) {
 const stored = localStorage.getItem(storageKey);
 if (stored !== null) {
 setIsExpanded(stored === 'true');
 }
 }
 }, [storageKey]);

 const toggle = () => {
 const newState = !isExpanded;
 setIsExpanded(newState);
 if (storageKey) {
 localStorage.setItem(storageKey, String(newState));
 }
 };

 return (
 <div className="bg-card shadow-sm border border-border overflow-hidden">
 {/* Header */}
 <button
 onClick={toggle}
 className="w-full px-6 py-4 flex items-center justify-between hover:bg-accent transition-colors duration-150"
 >
 <h3 className="text-md font-semibold text-foreground">{title}</h3>
 <ChevronDown
 size={18}
 className={`text-muted-foreground transition-transform duration-300 ${
 isExpanded ? 'rotate-180' : ''
 }`}
 />
 </button>

 {/* Content */}
 <div
 className="transition-all duration-300 ease-in-out overflow-hidden"
 style={{
 maxHeight: isExpanded ? '2000px' : '0',
 minHeight: isExpanded ? minHeight : '0',
 }}
 >
 <div className="pt-0">{children}</div>
 </div>
 </div>
 );
}
