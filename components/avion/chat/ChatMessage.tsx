

import { cn } from "@/lib/utils";
import { FlightChatMessage, getMessageText } from "@/lib/chat/messages";
import { Bot, User } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { memo } from "react";

interface ChatMessageProps {
    message: FlightChatMessage;
    showTimestamps?: boolean;
}

export const ChatMessage = memo(({ message, showTimestamps = false }: ChatMessageProps) => {
    const isUser = message.role === 'user';
    const content = getMessageText(message);

    const timestamp = new Date(message.createdAt || Date.now()).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className={cn("flex items-start gap-3", isUser ? "justify-end" : "justify-start")}>
            {!isUser && (
                <div className="w-8 h-8 flex-shrink-0 rounded-sm flex items-center justify-center bg-card border border-border">
                    <Bot size={18} className="text-muted-foreground" />
                </div>
            )}

            <div className={cn("w-full max-w-[80%]", isUser ? "flex justify-end" : "")}>
                <div className={cn("rounded-md space-y-2", 
                    isUser ? "bg-primary text-primary-foreground p-3" : ""
                )}>
                    {!isUser && (
                        <div className="flex items-center justify-between">
                            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                                Avion AI
                            </div>
                            {showTimestamps && (
                                <div className="text-xs text-muted-foreground/70">{timestamp}</div>
                            )}
                        </div>
                    )}
                    
                    {content && (
                         <div className={cn("prose prose-sm dark:prose-invert max-w-none", {
                            "prose-p:text-primary-foreground": isUser,
                            "prose-headings:text-primary-foreground": isUser,
                            "prose-strong:text-primary-foreground": isUser,
                         })}>
                            <ReactMarkdown>{content}</ReactMarkdown>
                        </div>
                    )}

                    {isUser && showTimestamps && (
                        <div className="text-xs text-primary-foreground/70 pt-1 text-right">
                            {timestamp}
                        </div>
                    )}
                </div>
            </div>

            {isUser && (
                 <div className="w-8 h-8 flex-shrink-0 rounded-sm flex items-center justify-center bg-muted">
                    <User size={18} className="text-muted-foreground" />
                </div>
            )}
        </div>
    );
});

ChatMessage.displayName = 'ChatMessage';
