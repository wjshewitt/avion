"use client"

import React, { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { ToolUIPart } from "ai"

import { cn } from "@/lib/utils"
import { FilePreview } from "@/components/ui/file-preview"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { WeatherToolUI, FlightSelectorToolUI, AirportInfoToolUI } from "@/components/chat/tool-ui"
import { GenericToolUI } from "@/components/chat/GenericToolUI"
import { useChatSettings } from "@/lib/chat-settings-store"
import { ThinkingBlock } from "@/components/chat/ThinkingBlock"
import { BriefingRenderer } from "@/components/chat/BriefingRenderer"
import { Sources, SourcesTrigger, SourcesContent, Source } from "@/components/ai/sources"
import {
  getFileParts,
  getMessageText,
  getReasoningParts,
  getToolParts,
  type FlightChatMessage as Message,
} from "@/lib/chat/messages"

/**
 * Detect if message content is a deep briefing document
 */
function isBriefingDocument(content: string): boolean {
  return content.includes('# FLIGHT OPERATIONS BRIEFING') ||
         (content.includes('## EXECUTIVE SUMMARY') && content.includes('## WEATHER ANALYSIS'));
}

/**
 * Extract sources from message content
 */
function extractSources(content: string): Array<{ title: string; description: string }> | null {
  const sourcesMatch = content.match(/\*\*Sources:\*\*\n([\s\S]*?)(?:\n\n|$)/);
  if (!sourcesMatch) return null;
  
  const sourcesList = sourcesMatch[1];
  const sources: Array<{ title: string; description: string }> = [];
  
  const lines = sourcesList.split('\n').filter(l => l.trim().match(/^\d+\./));
  
  lines.forEach(line => {
    const text = line.replace(/^\d+\.\s*/, '').trim();
    // Remove brackets from category tags like [Weather Data]
    const cleanText = text.replace(/^\[([^\]]+)\]\s*/, '$1: ');
    const [title, ...rest] = cleanText.split(/\s+-\s+/);
    sources.push({
      title: title.trim(),
      description: rest.join(' - ') || cleanText
    });
  });
  
  return sources.length > 0 ? sources : null;
}

/**
 * Remove sources section from content for display
 */
function removeSources(content: string): string {
  return content.replace(/\*\*Sources:\*\*\n[\s\S]*?(?:\n\n|$)/, '');
}

// Re-export Message type for other components
export type { Message }

const chatBubbleVariants = cva(
"group/message relative break-words p-3 text-sm sm:max-w-[70%]",
 {
 variants: {
 isUser: {
 true:"bg-primary text-primary-foreground",
 false:"bg-muted text-foreground",
 },
 animation: {
 none:"",
 slide:"duration-300 animate-in fade-in-0",
 scale:"duration-300 animate-in fade-in-0 zoom-in-75",
 fade:"duration-500 animate-in fade-in-0",
 },
 },
 compoundVariants: [
 {
 isUser: true,
 animation:"slide",
 class:"slide-in-from-right",
 },
 {
 isUser: false,
 animation:"slide",
 class:"slide-in-from-left",
 },
 {
 isUser: true,
 animation:"scale",
 class:"origin-bottom-right",
 },
 {
 isUser: false,
 animation:"scale",
 class:"origin-bottom-left",
 },
 ],
 }
)

type Animation = VariantProps<typeof chatBubbleVariants>["animation"]

export interface ChatMessageProps {
 message: Message
 showTimeStamp?: boolean
 animation?: Animation
 actions?: React.ReactNode
}

/**
 * ✅ Unified message component that works for:
 * 1. Initial messages loaded from database
 * 2. Streaming messages from AI SDK
 * 3. Tool invocations (both loading and completed)
 */
export const ChatMessage: React.FC<ChatMessageProps> = ({
 message,
 showTimeStamp = false,
 animation ="scale",
 actions,
}) => {
 const { showToolCards, currentMode } = useChatSettings()
 const isUser = message.role === "user"

 const timestamp = useMemo(() => (message.createdAt ? new Date(message.createdAt) : undefined), [message.createdAt])

 const content = useMemo(() => getMessageText(message), [message])
 const reasoningParts = useMemo(() => getReasoningParts(message), [message])
 const reasoningText = useMemo(
   () => reasoningParts.map((part) => part.text).filter(Boolean).join("\n\n"),
   [reasoningParts]
 )
 const fileParts = useMemo(() => getFileParts(message), [message])
 const files = useMemo(
   () =>
     fileParts
       .map((part) => filePartToFile(part))
       .filter((file): file is File => file !== null),
   [fileParts]
 )
 // Hide tool cards in deep-briefing mode - the briefing document contains all the info
 const shouldShowToolCards = showToolCards && currentMode !== 'deep-briefing'
 const toolParts = useMemo(() => (shouldShowToolCards ? getToolParts(message) : []), [message, shouldShowToolCards])

 const sources = useMemo(
   () => (isUser ? null : extractSources(content)),
   [content, isUser]
 )
 const cleanContent = useMemo(() => {
   if (isUser) {
     return content
   }
   if (!sources) {
     return content
   }
   return removeSources(content)
 }, [content, isUser, sources])

 // Only show sources if tools were called or explicit citations present
 const shouldShowSources = useMemo(() => {
   if (isUser) return false;
   // Has tool invocations?
   if (toolParts.length > 0) return true;
   // Has explicit sources in content?
   if (sources && sources.length > 0) return true;
   // Otherwise, no sources
   return false;
 }, [isUser, toolParts.length, sources])

 const formattedTime = timestamp?.toLocaleTimeString("en-US", {
 hour:"2-digit",
 minute:"2-digit",
 })

 // User messages are simple
 if (isUser) {
 return (
 <div className={cn("flex flex-col items-end")}>
 {files && files.length > 0 ? (
 <div className="mb-1 flex flex-wrap gap-2">
 {files.map((file: any, index: number) => (
 <FilePreview file={file} key={index} />
 ))}
 </div>
 ) : null}

 <div className={cn(chatBubbleVariants({ isUser, animation }))}>
 <MarkdownRenderer>{content}</MarkdownRenderer>
 </div>

 {showTimeStamp && timestamp ? (
 <time
 dateTime={timestamp.toISOString()}
 className={cn(
"mt-1 block px-1 text-xs opacity-50",
 animation !=="none" &&"duration-500 animate-in fade-in-0"
 )}
 >
 {formattedTime}
 </time>
 ) : null}
 </div>
 )
 }

 // Extract sources and clean content
 // ✅ Assistant messages: unified rendering for all cases
 return (
 <div className="flex flex-col items-start gap-3 max-w-full">
 {/* 1. Sources (only if tools were called or explicit citations) */}
 {shouldShowSources && sources && sources.length > 0 && (
 <Sources>
 <SourcesTrigger count={sources.length} />
 <SourcesContent>
 {sources.map((source, i) => (
 <Source
 key={i}
 href="#"
 title={source.description}
 />
 ))}
 </SourcesContent>
 </Sources>
 )}

 {/* 2. Thinking/Reasoning block (if present) */}
 {reasoningText && (
 <ThinkingBlock content={reasoningText} />
 )}

 {/* 3. Main message container with header */}
 {(cleanContent && cleanContent.trim()) || toolParts.length > 0 ? (
   <div className="w-full max-w-[85%] rounded-sm overflow-hidden border border-border shadow-sm">
     {/* Header bar with subtle groove */}
     <div 
       className="flex items-center justify-between px-4 py-2 border-b border-border"
       style={{
         backgroundColor: 'var(--muted)',
         boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
       }}
     >
       <div className="flex items-center gap-2">
         <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">AVION AI</span>
         <span 
           className="text-[9px] font-mono px-1.5 py-0.5 rounded-[2px]"
           style={{
             backgroundColor: 'rgba(37, 99, 235, 0.1)',
             color: '#2563EB',
           }}
         >
           2.5F
         </span>
       </div>
       {showTimeStamp && timestamp && (
         <time
           dateTime={timestamp.toISOString()}
           className="text-[10px] font-mono tabular-nums text-muted-foreground"
         >
           {formattedTime}
         </time>
       )}
     </div>

     {/* Message body with tungsten treatment */}
     <div 
       className="p-5 border-l-2"
       style={{
         backgroundColor: 'var(--card)',
         borderLeftColor: '#F04E30',
         boxShadow: 'inset 1px 0 3px rgba(240, 78, 48, 0.1)',
       }}
     >
       {/* Check if this is a briefing document */}
       {cleanContent && cleanContent.trim() && isBriefingDocument(cleanContent) ? (
         <BriefingRenderer content={cleanContent} />
       ) : cleanContent && cleanContent.trim() ? (
         <div className="relative">
           <MarkdownRenderer>{cleanContent}</MarkdownRenderer>
           {actions ? (
             <div className="absolute -bottom-4 right-2 flex space-x-1 border border-border rounded-sm bg-background p-1 text-foreground opacity-0 transition-opacity group-hover/message:opacity-100 shadow-sm">
               {actions}
             </div>
           ) : null}
         </div>
       ) : null}

       {/* Tool invocations inside message body */}
       {toolParts.length > 0 && (
         <div className={cn("flex flex-col gap-2", cleanContent && cleanContent.trim() && "mt-4")}>
           {toolParts.map((part) => (
             <ToolInvocationRenderer key={part.toolCallId} part={part} />
           ))}
         </div>
       )}
     </div>
   </div>
 ) : null}

 {/* Timestamp for messages without main content (shouldn't happen but keeping as fallback) */}
 {showTimeStamp && timestamp && !(cleanContent && cleanContent.trim()) && toolParts.length === 0 && (
 <time
 dateTime={timestamp.toISOString()}
 className={cn(
"mt-1 block px-1 text-xs opacity-50",
 animation !=="none" &&"duration-500 animate-in fade-in-0"
 )}
 >
 {formattedTime}
 </time>
 )}
 </div>
 )
}

/**
 * ✅ Render individual tool invocation with loading states and groove treatment
 */
function ToolInvocationRenderer({ part }: { part: ToolUIPart }) {
 const toolName = part.type.replace("tool-", "")

 // Loading state
 if (part.state === "input-streaming" || part.state === "input-available") {
 return (
 <div 
   className="border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground rounded-sm flex items-center gap-2"
   style={{
     boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)'
   }}
 >
 <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
 <span className="font-mono text-xs">Calling {toolName}...</span>
 </div>
 )
 }

 // Error state
 if (part.state === "output-error") {
 return (
 <div 
   className="border border-destructive bg-destructive/10 px-3 py-2 text-sm rounded-sm"
   style={{
     boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)'
   }}
 >
 <span className="text-destructive font-mono text-xs">Error in {toolName}</span>
 </div>
 )
 }

 // Result state - render custom UI components
 if (part.state === "output-available") {
 const data = part.output ?? part.input;

 if (data && typeof data === 'object' && '__cancelled' in data) {
  return (
    <div 
      className="border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground rounded-sm"
      style={{
        boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.05)'
      }}
    >
      <span className="font-mono text-xs">Tool execution was cancelled.</span>
    </div>
  )
 }

 if (toolName === "get_airport_weather") {
  return <WeatherToolUI result={{ data: data as any }} />
 }
 
 if (toolName === "get_airport_capabilities") {
  return <AirportInfoToolUI result={{ data: data as any }} />
 }
 
 if (toolName === "get_user_flights") {
  return <FlightSelectorToolUI result={{ data: data as any }} />
 }
 
 // Fallback: Generic collapsible tool UI
 return <GenericToolUI toolName={toolName} data={data} />
 }

 return null
}

function filePartToFile(part: ReturnType<typeof getFileParts>[number]): File | null {
 if (!part.url) {
  return null
 }

 try {
  const dataArray = dataUrlToUint8Array(part.url)
  return new File([dataArray], part.filename ?? "Attachment", {
    type: part.mediaType ?? "application/octet-stream",
  })
 } catch (error) {
  console.error('Failed to decode file part', error)
  return null
 }
}

function dataUrlToUint8Array(data: string) {
 const base64 = data.split(",")[1]
 const buf = Buffer.from(base64, "base64")
 return new Uint8Array(buf)
}
