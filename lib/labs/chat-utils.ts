/**
 * Premium Labs Chat - Utility Functions
 */

import { format, isToday, isYesterday, isThisWeek, isThisYear } from "date-fns";

export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}

export function formatMessageTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  
  if (isYesterday(date)) {
    return `Yesterday ${format(date, "HH:mm")}`;
  }
  
  if (isThisWeek(date)) {
    return format(date, "EEE HH:mm");
  }
  
  if (isThisYear(date)) {
    return format(date, "MMM d, HH:mm");
  }
  
  return format(date, "MMM d, yyyy");
}

export function groupConversationsByDate(conversations: Array<{ id: string; updatedAt: string; title: string }>) {
  const groups: Record<string, typeof conversations> = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };
  
  conversations.forEach((conv) => {
    const date = new Date(conv.updatedAt);
    
    if (isToday(date)) {
      groups.today.push(conv);
    } else if (isYesterday(date)) {
      groups.yesterday.push(conv);
    } else if (isThisWeek(date)) {
      groups.lastWeek.push(conv);
    } else if (isThisYear(date)) {
      groups.lastMonth.push(conv);
    } else {
      groups.older.push(conv);
    }
  });
  
  return groups;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function estimateTextareaHeight(text: string, minHeight: number, maxHeight: number): number {
  const lineHeight = 24;
  const lines = text.split("\n").length;
  const estimatedHeight = Math.max(minHeight, lines * lineHeight + 32);
  return Math.min(estimatedHeight, maxHeight);
}
