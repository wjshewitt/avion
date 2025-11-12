'use client';

import { ChatMessage, type ChatMessageProps } from '@/components/ui/chat-message';
import CornerBracket from './corner-bracket';

export function ChatMessageWithBrackets(props: ChatMessageProps) {
 const isUser = props.role === 'user';
 
 return (
 <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}>
 <CornerBracket
 size="md"
 variant={isUser ? 'active' : 'default'}
 className="w-full max-w-[70%]"
 >
 <ChatMessage {...props} />
 </CornerBracket>
 </div>
 );
}
