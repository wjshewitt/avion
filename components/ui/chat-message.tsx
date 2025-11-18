"use client"

import React, { useMemo } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { ToolUIPart } from "ai"
import { Cpu } from "lucide-react"

import { cn } from "@/lib/utils"
import { FilePreview } from "@/components/ui/file-preview"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { WeatherToolUI, FlightSelectorToolUI, AirportInfoToolUI } from "@/components/chat/tool-ui"
import { GenericToolUI } from "@/components/chat/GenericToolUI"
import { useChatSettings } from "@/lib/chat-settings-store"
import { ThinkingBlock } from "@/components/chat/ThinkingBlock"
import { BriefingRenderer } from "@/components/chat/BriefingRenderer"
import { VerifiedSources, type SourceItem } from "@/components/ai/sources"
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
function extractSources(content: string): SourceItem[] | null {
  const sourcesMatch = content.match(/\*\*Sources:\*\*\n([\s\S]*?)(?:\n\n|$)/);
  if (!sourcesMatch) return null;
  
  const sourcesList = sourcesMatch[1];
  const sources: SourceItem[] = [];
  
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
"group/message relative break-words px-5 py-4 text-sm sm:max-w-[85%] rounded-sm",
 {
 variants: {
 isUser: {
 true:"groove bg-background border border-border/50 text-foreground",
 false:"", // Handled by tungsten-panel
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

 // If content is empty AND no tool parts AND thinking is happening (or not), we should probably render NOTHING
 // BUT, ChatMessage might be used for historical messages too.
 // The key issue is the "empty box" when streaming starts but content hasn't arrived yet.
 // `isThinkingOnly` handles the reasoning phase.
 // But if `isThinkingOnly` is false (e.g. reasoning done, or no reasoning), and content is still empty...
 
 const isEmpty = !isUser && !cleanContent?.trim() && toolParts.length === 0 && !reasoningText;
 if (isEmpty) return null;

 // User messages are simple
 if (isUser) {
 return (
 <div className={cn("flex flex-col items-end mb-8 group")}>
   <div className="flex items-center gap-2 mb-1 opacity-70">
     <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
       COMMAND INPUT
     </span>
     {showTimeStamp && timestamp && (
       <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
         {formattedTime}
       </span>
     )}
   </div>
 
 {files && files.length > 0 ? (
 <div className="mb-1 flex flex-wrap gap-2">
 {files.map((file: any, index: number) => (
 <FilePreview file={file} key={index} />
 ))}
 </div>
 ) : null}

 <div className={cn(chatBubbleVariants({ isUser, animation }))}>
 <div className="text-sm text-foreground leading-relaxed font-medium">
   <MarkdownRenderer>{content}</MarkdownRenderer>
 </div>
 {/* Decorative corner bracket for user input */}
 <div className="absolute -right-1 -bottom-1 w-2 h-2 border-r border-b border-primary/30" />
 </div>
 </div>
 )
 }

 // Extract sources and clean content
 // ✅ Assistant messages: unified rendering for all cases
 return (
 <div className="mb-10 group relative pl-4">
   {/* Connection Line */}
   <div className="absolute left-0 top-0 bottom-0 w-px bg-border/50 group-hover:bg-primary/20 transition-colors" />

 <div className="flex flex-col gap-0 max-w-3xl">
   {/* Header Strip */}
   <div className="flex items-center justify-between mb-2 pl-1">
     <div className="flex items-center gap-3">
       <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900/50 px-2 py-1 rounded-sm border border-border">
         <div className="relative flex h-2 w-2">
           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
           <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F04E30]"></span>
         </div>
         <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
           AVION AI // V2.5
         </span>
       </div>
       <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline-block">
         SYSTEM READOUT
       </span>
     </div>
     
     {showTimeStamp && timestamp && (
       <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
         T+{formattedTime}
       </span>
     )}
   </div>

 {/* 2. Thinking/Reasoning block (if present) */}
 {reasoningText && (
 <ThinkingBlock content={reasoningText} />
 )}

 {/* 3. Main message container with header */}
 {(cleanContent && cleanContent.trim()) || toolParts.length > 0 ? (
   <div className="tungsten-panel relative overflow-hidden rounded-sm">
     {/* Scanline Effect */}
     <div className="scanline-effect opacity-10" />

     {/* Message body */}
     <div className="p-6 relative z-10">
       {/* Check if this is a briefing document */}
       {cleanContent && cleanContent.trim() && isBriefingDocument(cleanContent) ? (
         <BriefingRenderer content={cleanContent} />
       ) : cleanContent && cleanContent.trim() ? (
         <div className="relative text-sm text-zinc-200 leading-7 tracking-wide">
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
         <div className={cn("flex flex-col gap-2", cleanContent && cleanContent.trim() && "mt-4 pt-4 border-t border-white/5")}>
           {toolParts.map((part) => (
             <ToolInvocationRenderer key={part.toolCallId} part={part} />
           ))}
         </div>
       )}
     </div>

     {/* Sources Data Grid */}
     {shouldShowSources && sources && sources.length > 0 && (
        <VerifiedSources sources={sources} />
     )}
     
     {/* Footer Status Bar */}
     <div className="h-6 bg-black/40 border-t border-white/5 flex items-center justify-between px-3 relative z-10">
       <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-zinc-600 uppercase">
            STATUS: NOMINAL
          </span>
          <span className="text-[9px] font-mono text-zinc-600 uppercase">
            LATENCY: 24ms
          </span>
       </div>
       <Cpu size={10} className="text-zinc-700" />
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
   className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-300 rounded-sm flex items-center gap-2"
 >
 <div className="animate-spin h-3 w-3 border-2 border-primary border-t-transparent rounded-full" />
 <span className="font-mono text-xs uppercase tracking-wider">Calling {toolName}...</span>
 </div>
 )
 }

 // Error state
 if (part.state === "output-error") {
 return (
 <div 
   className="border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm rounded-sm"
 >
 <span className="text-destructive font-mono text-xs">ERROR: {toolName} FAILURE</span>
 </div>
 )
 }

 // Result state - render custom UI components
 if (part.state === "output-available") {
 const data = part.output ?? part.input;

 if (data && typeof data === 'object' && '__cancelled' in data) {
  return (
    <div 
      className="border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400 rounded-sm"
    >
      <span className="font-mono text-xs">PROCESS CANCELLED</span>
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

