'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { CornerSweepLoader } from '@/components/kokonutui/minimal-loaders';

const SLASH_COMMANDS = [
 { command: '/weather', description: 'Get airport weather' },
 { command: '/flight', description: 'Get flight details' },
 { command: '/route', description: 'Compare route weather' },
 { command: '/brief', description: 'Generate flight briefing' },
 { command: '/risk', description: 'Analyze risk factors' },
 { command: '/help', description: 'Show all commands' },
];

interface ChatInputProps {
 conversationId: string | null;
 onMessageSent?: () => void;
 isGenerating?: boolean;
}

export default function ChatInput({ conversationId, onMessageSent, isGenerating = false }: ChatInputProps) {
 const [input, setInput] = useState('');
 const [showCommands, setShowCommands] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const textareaRef = useRef<HTMLTextAreaElement>(null);

 useEffect(() => {
 if (input.startsWith('/')) {
 setShowCommands(true);
 } else {
 setShowCommands(false);
 }
 }, [input]);

 const handleSend = async () => {
 const trimmedInput = input.trim();
 if (!trimmedInput || isGenerating) return;

 setError(null);
 const userMessage = trimmedInput;
 
 // Clear input immediately for better UX
 setInput('');
 if (textareaRef.current) {
 textareaRef.current.style.height = 'auto';
 }

 try {
 // Send message to API
 const response = await fetch('/api/chat/general', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 message: userMessage,
 conversationId: conversationId,
 }),
 });

 if (!response.ok) {
 const errorData = await response.json().catch(() => ({}));
 throw new Error(errorData.error || 'Failed to send message');
 }

 // Notify parent to refresh messages
 if (onMessageSent) {
 onMessageSent();
 }
 } catch (err) {
 console.error('Error sending message:', err);
 setError(err instanceof Error ? err.message : 'Failed to send message');
 // Restore input on error
 setInput(userMessage);
 }
 };

 const handleKeyDown = (e: React.KeyboardEvent) => {
 if (e.key === 'Enter' && !e.shiftKey) {
 e.preventDefault();
 handleSend();
 }
 };

 const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
 setInput(e.target.value);
 // Auto-resize textarea
 e.target.style.height = 'auto';
 e.target.style.height = `${e.target.scrollHeight}px`;
 };

 const handleCommandClick = (command: string) => {
 setInput(command + ' ');
 setShowCommands(false);
 textareaRef.current?.focus();
 };

 return (
 <div className="border-t border-border bg-background-primary p-4">
 {/* Error Message */}
 {error && (
 <div className="mb-2 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
 {error}
 </div>
 )}

 {/* Slash Commands Dropdown */}
 {showCommands && (
 <div className="mb-2 p-2 bg-surface border border-border">
 <div className="text-xs font-semibold text-text-secondary mb-2">Commands</div>
 <div className="space-y-1">
 {SLASH_COMMANDS.filter((c) => c.command.startsWith(input)).map((cmd) => (
 <button
 key={cmd.command}
 onClick={() => handleCommandClick(cmd.command)}
 className="w-full text-left px-3 py-2 hover:bg-background-primary transition-colors"
 >
 <div className="font-mono text-sm text-blue">{cmd.command}</div>
 <div className="text-xs text-text-secondary">{cmd.description}</div>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* Input Area */}
 <div className="flex gap-2">
 <button 
 className="p-3 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
 disabled={isGenerating}
 >
 <Paperclip size={20} />
 </button>

 <textarea
 ref={textareaRef}
 value={input}
 onChange={handleInputChange}
 onKeyDown={handleKeyDown}
 placeholder="Type a message... (Shift+Enter for new line)"
 className="flex-1 px-4 py-3 border border-border text-sm focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue resize-none min-h-[48px] max-h-[200px] disabled:opacity-50"
 rows={1}
 disabled={isGenerating}
 />

 <button
 onClick={handleSend}
 disabled={!input.trim() || isGenerating}
 className="px-4 py-3 bg-blue text-white hover:bg-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
 >
 {isGenerating ? (
 <CornerSweepLoader size="sm" color="text-white" />
 ) : (
 <Send size={20} />
 )}
 </button>
 </div>

 <div className="mt-2 text-xs text-muted-foreground">
 Use <kbd className="px-1.5 py-0.5 bg-muted" >⌘K</kbd> for new conversation, <kbd className="px-1.5 py-0.5 bg-muted" >/</kbd> for commands
 </div>
 </div>
 );
}
