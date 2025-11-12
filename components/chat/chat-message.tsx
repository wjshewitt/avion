'use client';

import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { Message } from '@/lib/types';
import CornerBracket from '../corner-bracket';

interface ChatMessageProps {
 message: Message;
 onCopy?: () => void;
 onRegenerate?: () => void;
 onDelete?: () => void;
}

export default function ChatMessage({ message, onCopy, onRegenerate, onDelete }: ChatMessageProps) {
 const isUser = message.role === 'user';

 return (
 <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
 <CornerBracket
 size="md"
 variant={isUser ? 'active' : 'default'}
 className="max-w-[80%]"
 >
 <div
 className={` px-4 py-3 ${
 isUser ? 'bg-blue text-white' : 'bg-muted text-foreground'
 }`}
 >
 <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>

 <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
 <span className={`text-xs ${isUser ? 'opacity-70' : 'text-text-secondary'}`}>
 {new Date(message.timestamp).toLocaleTimeString()}
 </span>

 {!isUser && (
 <div className="flex items-center gap-2">
 <button
 onClick={onCopy}
 className="p-1 hover:bg-white/10 transition-colors"
 title="Copy"
 >
 <Copy size={14} />
 </button>
 <button
 onClick={onRegenerate}
 className="p-1 hover:bg-white/10 transition-colors"
 title="Regenerate"
 >
 <RefreshCw size={14} />
 </button>
 <button
 onClick={onDelete}
 className="p-1 hover:bg-white/10 transition-colors"
 title="Delete"
 >
 <Trash2 size={14} />
 </button>
 </div>
 )}
 </div>
 </div>
 </CornerBracket>
 </div>
 );
}
