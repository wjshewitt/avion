import type { JSONValue } from 'ai';
import type { ChatMode, ModelSelection } from '../../chat-settings-store';
import type { ChatSurface, ModeHint } from '../router-types';
import {
  getAiRouterModelsConfig,
  type AiRouterModelsConfig,
  type AiProvider,
  type ProviderOptionsMap,
} from '../../config/ai';
import { chooseGeminiModel } from '../router';
import {
  SIMPLE_CHAT_PROMPT,
  FLIGHT_OPS_PROMPT,
  WEATHER_BRIEF_PROMPT,
  AIRPORT_PLANNING_PROMPT,
  DEEP_BRIEFING_PROMPT,
} from '../../gemini/prompts';
import type { PageContext } from './request-utils';

export interface ModelResolutionParams {
  selectedModel?: ModelSelection;
  surface: ChatSurface;
  queryContent: string;
  totalTokensEstimate: number;
  hasTools?: boolean;
  requiresHighReliability?: boolean;
  modeHint?: ModeHint;
  pageContextType?: PageContext['type'];
}

export interface ModelResolutionResult {
  routerConfig: AiRouterModelsConfig;
  decision: Awaited<ReturnType<typeof chooseGeminiModel>> | {
    model: Awaited<ReturnType<typeof chooseGeminiModel>>['model'];
    modelName: string;
    routingReason: string;
    debug?: unknown;
  };
  provider: AiProvider;
  supportsThinkingForModel: boolean;
}

const TIMEKEEPING_DIRECTIVE = `

🕒 TIMEKEEPING PROTOCOL (MANDATORY)
- Every response MUST begin with the current Zulu stamp in brackets, e.g., "[14:32 Z]".
- Use Zulu/UTC for all operational timestamps; when referencing local time include the timezone abbreviation, e.g., "14:32 EST (19:32Z)".
- Reference sunrise/sunset and curfew status by calling the get_airport_temporal_profile tool whenever daylight context matters.
- If local time is unknown, explicitly say so instead of guessing.
`;

export function buildSystemPrompt({
  mode,
  pageContext,
}: {
  mode: ChatMode | null | undefined;
  pageContext?: PageContext | null;
}): string {
  const base = getSystemPromptForMode(mode);
  const contextPrefix = getContextPromptPrefix(pageContext);
  const prompt = contextPrefix ? base + contextPrefix : base;
  return `${prompt}${TIMEKEEPING_DIRECTIVE}`;
}

export function determineThinkingBudget(query: string, mode: ChatMode | null | undefined): number {
  const lower = query.toLowerCase();

  if (mode === 'deep-briefing') {
    const generationTriggers = [
      'generate',
      'create the document',
      'ready',
      "that's all",
      'proceed',
      'briefing',
      'start the plan',
      "i'm ready",
    ];

    const isGenerating = generationTriggers.some((trigger) => lower.includes(trigger));
    return isGenerating ? 16_384 : 2_048;
  }

  if (
    lower.includes('analyze') ||
    lower.includes('should i') ||
    lower.includes('recommend') ||
    lower.includes('compare') ||
    lower.includes('assess') ||
    lower.includes('risk') ||
    lower.includes('evaluate')
  ) {
    return 8_192;
  }

  if (
    lower.startsWith('what is') ||
    lower.startsWith('show me') ||
    lower.startsWith('get') ||
    lower.startsWith('list')
  ) {
    return 0;
  }

  return -1;
}

export function buildProviderOptions({
  defaultOptions,
  supportsThinking,
  thinkingBudget,
}: {
  defaultOptions?: ProviderOptionsMap;
  supportsThinking: boolean;
  thinkingBudget: number;
}): ProviderOptionsMap | undefined {
  const merged: ProviderOptionsMap = defaultOptions
    ? Object.fromEntries(Object.entries(defaultOptions).map(([key, value]) => [key, { ...value }]))
    : {};

  if (supportsThinking && thinkingBudget !== 0) {
    const existingGoogleOptions: Record<string, JSONValue> = merged.google
      ? { ...merged.google }
      : {};

    const thinkingConfig: Record<string, JSONValue> = {
      includeThoughts: true,
    };

    if (thinkingBudget > 0) {
      thinkingConfig.thinkingBudget = thinkingBudget;
    }

    merged.google = {
      ...existingGoogleOptions,
      thinkingConfig,
    };
  }

  return Object.keys(merged).length > 0 ? merged : undefined;
}

export function buildMessageMetadata({
  conversationId,
  provider,
  modelId,
  supportsThinking,
}: {
  conversationId: string | null;
  provider: AiProvider;
  modelId: string;
  supportsThinking: boolean;
}): Record<string, unknown> | undefined {
  const metadata: Record<string, unknown> = {
    provider,
    model: modelId,
    supportsThinking,
  };

  if (conversationId) {
    metadata.conversationId = conversationId;
  }

  return metadata;
}

export async function resolveModelDecision({
  selectedModel,
  surface,
  queryContent,
  totalTokensEstimate,
  hasTools = true,
  requiresHighReliability,
  modeHint,
  pageContextType = 'general',
}: ModelResolutionParams): Promise<ModelResolutionResult> {
  const routerConfig = getAiRouterModelsConfig();

  let decision: ModelResolutionResult['decision'];

  if (selectedModel === 'flash-lite') {
    decision = {
      model: routerConfig.lite.model,
      modelName: routerConfig.lite.modelId,
      routingReason: 'User selected Flash Lite',
      debug: { rule: 'user-selection', selection: 'flash-lite' },
    };
  } else if (selectedModel === 'flash') {
    decision = {
      model: routerConfig.full.model,
      modelName: routerConfig.full.modelId,
      routingReason: 'User selected Flash',
      debug: { rule: 'user-selection', selection: 'flash' },
    };
  } else {
    decision = await chooseGeminiModel({
      surface,
      userMessage: queryContent,
      totalTokensEstimate,
      hasTools,
      requiresHighReliability,
      modeHint,
      contextType: pageContextType,
    });
  }

  const supportsThinkingForModel =
    routerConfig.supportsThinking && decision.modelName === routerConfig.full.modelId;

  return {
    routerConfig,
    decision,
    provider: routerConfig.provider,
    supportsThinkingForModel,
  };
}

function getSystemPromptForMode(mode: ChatMode | null | undefined): string {
  if (!mode) return SIMPLE_CHAT_PROMPT;

  switch (mode) {
    case 'flight-ops':
      return FLIGHT_OPS_PROMPT;
    case 'weather-brief':
      return WEATHER_BRIEF_PROMPT;
    case 'airport-planning':
      return AIRPORT_PLANNING_PROMPT;
    case 'deep-briefing':
      return DEEP_BRIEFING_PROMPT;
    default:
      return FLIGHT_OPS_PROMPT;
  }
}

function getContextPromptPrefix(context: PageContext | null | undefined): string {
  if (!context || context.type === 'general') {
    return '';
  }

  const prefix: string[] = [];
  prefix.push('\n\n📍 PAGE CONTEXT:');

  switch (context.type) {
    case 'weather':
      prefix.push(`The user is currently viewing the weather page for ${context.icao}.`);
      prefix.push(
        `When they ask about weather, forecasts, or conditions, assume they mean ${context.icao} unless they specify otherwise.`,
      );
      prefix.push(
        'You can use the get_airport_weather tool to fetch current METAR and TAF data for this airport.',
      );
      break;
    case 'airport':
      prefix.push(`The user is viewing the airport page for ${context.icao}.`);
      prefix.push(
        `When they ask about runways, facilities, or airport information, assume they mean ${context.icao} unless they specify otherwise.`,
      );
      prefix.push(
        'You can use the get_airport_capabilities tool to fetch detailed airport information.',
      );
      break;
    case 'briefing':
      prefix.push(`The user is viewing a professional weather briefing for ${context.icao}.`);
      prefix.push('Provide detailed weather analysis and briefing information for this airport when asked.');
      prefix.push('Use the get_airport_weather tool to fetch the latest METAR and TAF data.');
      break;
    case 'flight':
      prefix.push(`The user is viewing flight details (ID: ${context.flightId}).`);
      prefix.push(
        'When they ask about flight information, weather, or planning, reference this specific flight.',
      );
      break;
  }

  prefix.push(
    'Important: The user does NOT need to specify the airport code or flight ID in their questions - you already know the context.\n',
  );

  return prefix.join('\n');
}
