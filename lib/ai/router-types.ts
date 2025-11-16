import type { LanguageModel } from 'ai';

export type ChatSurface = 'main' | 'sidebar';

export type ModeHint = 'casual' | 'analysis' | 'coding' | 'planning';

export interface RoutingInput {
  surface: ChatSurface;
  userMessage: string;
  totalTokensEstimate: number;
  hasTools: boolean;
  requiresHighReliability?: boolean;
  modeHint?: ModeHint;
  contextType?: 'weather' | 'airport' | 'flight' | 'briefing' | 'general';
}

export interface RoutingDecision {
  model: LanguageModel;
  modelName: string;
  routingReason: string;
  debug?: Record<string, unknown>;
}
