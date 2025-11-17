import { performance } from 'node:perf_hooks';
import type { UIMessage } from 'ai';
import type { ChatMode, ModelSelection } from '../../chat-settings-store';
import type { ModeHint, ChatSurface } from '../router-types';

export interface PageContext {
  type: 'weather' | 'airport' | 'flight' | 'briefing' | 'general';
  icao?: string;
  flightId?: string;
  title?: string;
  [key: string]: unknown;
}

export interface ChatRequestBody {
  id?: string;
  messages?: Array<UIMessage & { metadata?: { conversationId?: string } }>;
  conversationId?: string | null;
  mode?: ChatMode | null;
  selectedModel?: ModelSelection;
  pageContext?: PageContext | null;
  surface?: ChatSurface;
  modeHint?: ModeHint;
  requiresHighReliability?: boolean;
  trigger?: 'submit-message' | 'regenerate-message';
  messageId?: string | null;
}

export interface ChatTimings {
  start: number;
  authStart: number;
  authEnd: number;
  conversationStart: number;
  conversationEnd: number;
  persistStart: number;
  persistEnd: number;
}

export function createChatTimings(): ChatTimings {
  const now = performance.now();
  return {
    start: now,
    authStart: 0,
    authEnd: 0,
    conversationStart: 0,
    conversationEnd: 0,
    persistStart: 0,
    persistEnd: 0,
  };
}

export function markTiming(
  timings: ChatTimings,
  key: Exclude<keyof ChatTimings, 'start'>,
  value = performance.now(),
): void {
  timings[key] = value;
}

export async function parseChatRequest(req: Request): Promise<ChatRequestBody> {
  const body = (await req.json()) as ChatRequestBody;
  body.messages = body.messages ?? [];
  return body;
}

export function readUsageNumber(usage: unknown, key: string): number | undefined {
  if (!usage || typeof usage !== 'object') {
    return undefined;
  }

  const record = usage as Record<string, unknown>;
  const value = record[key];

  return typeof value === 'number' ? value : undefined;
}

export function calculateCost(usage: { promptTokens: number; completionTokens: number }): number {
  const inputCostPer1M = 0.00015;
  const outputCostPer1M = 0.0006;

  const inputCost = (usage.promptTokens / 1_000_000) * inputCostPer1M;
  const outputCost = (usage.completionTokens / 1_000_000) * outputCostPer1M;

  return inputCost + outputCost;
}

export function safeClone<T>(value: T): T {
  const cloner = (globalThis as unknown as { structuredClone?: <U>(item: U) => U }).structuredClone;
  if (typeof cloner === 'function') {
    return cloner(value);
  }
  return JSON.parse(JSON.stringify(value));
}

export function cloneUiMessageForStorage(message: UIMessage, conversationId: string | null): UIMessage {
  const cloned = safeClone(message);
  cloned.metadata = {
    ...(cloned.metadata ?? {}),
    conversationId: conversationId ?? cloned.metadata?.conversationId ?? null,
  };
  return cloned;
}
