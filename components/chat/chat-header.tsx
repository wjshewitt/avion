'use client';

import { Download, Settings } from 'lucide-react';
import ContextSelector from './context-selector';

interface ChatHeaderProps {
 conversationTitle?: string;
}

export default function ChatHeader({ conversationTitle }: ChatHeaderProps) {
 return (
 <header className="border-b border-border bg-background-primary px-6 py-4">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-lg font-semibold text-text-primary">
 {conversationTitle || 'Select a conversation'}
 </h1>
 <div className="text-xs text-text-secondary mt-1">
 AI Aviation Assistant
 </div>
 </div>

 <div className="flex items-center gap-3">
 <ContextSelector />
 
 <button
 className="p-2 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
 title="Settings"
 >
 <Settings size={18} />
 </button>
 </div>
 </div>
 </header>
 );
}
