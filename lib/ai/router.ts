import { getAiRouterModelsConfig } from '../config/ai';
import type { RoutingInput, RoutingDecision } from './router-types';

const MAIN_CONTEXT_THRESHOLD = Number(process.env.GEMINI_MAIN_CONTEXT_THRESHOLD_TOKENS ?? 6000);
const SIDEBAR_CONTEXT_THRESHOLD = Number(process.env.GEMINI_SIDEBAR_CONTEXT_THRESHOLD_TOKENS ?? 8000);

const COMPLEX_KEYWORDS = [
  'debug',
  'optimize',
  'refactor',
  'architecture',
  'time complexity',
  'space complexity',
  'proof',
  'security review',
  'security',
  'formal analysis',
  'risk',
  'risk assessment',
  'flight plan validation',
  'regulatory',
  'compliance',
];

function containsAny(haystack: string, needles: string[]): boolean {
  const lower = haystack.toLowerCase();
  return needles.some((needle) => lower.includes(needle.toLowerCase()));
}

const routerModels = getAiRouterModelsConfig();

export async function chooseGeminiModel(input: RoutingInput): Promise<RoutingDecision> {
  const {
    surface,
    userMessage,
    totalTokensEstimate,
    hasTools,
    requiresHighReliability,
    modeHint,
    contextType,
  } = input;

  const contextLimit = surface === 'main' ? MAIN_CONTEXT_THRESHOLD : SIDEBAR_CONTEXT_THRESHOLD;
  const isComplex = containsAny(userMessage, COMPLEX_KEYWORDS);

  // Hard rules
  if (totalTokensEstimate > contextLimit) {
    return {
      model: routerModels.full.model,
      modelName: routerModels.full.modelId,
      routingReason: `hard:context>${contextLimit}`,
      debug: buildDebug(input, { isComplex, rule: 'context' }),
    };
  }

  if (requiresHighReliability) {
    return {
      model: routerModels.full.model,
      modelName: routerModels.full.modelId,
      routingReason: 'hard:requiresHighReliability',
      debug: buildDebug(input, { isComplex, rule: 'requiresHighReliability' }),
    };
  }

  if (surface === 'main' && hasTools) {
    return {
      model: routerModels.full.model,
      modelName: routerModels.full.modelId,
      routingReason: 'hard:main+tools',
      debug: buildDebug(input, { isComplex, rule: 'main+tools' }),
    };
  }

  // Surface-specific heuristics
  if (surface === 'main') {
    if (isComplex && modeHint !== 'casual') {
      return {
        model: routerModels.full.model,
        modelName: routerModels.full.modelId,
        routingReason: 'heuristic:main+complex',
        debug: buildDebug(input, { isComplex, rule: 'main+complex' }),
      };
    }

    return {
      model: routerModels.lite.model,
      modelName: routerModels.lite.modelId,
      routingReason: 'default:main->lite',
      debug: buildDebug(input, { isComplex, rule: 'main-default' }),
    };
  }

  if (surface === 'sidebar') {
    const isShort = userMessage.length < 300;

    if (modeHint === 'casual' || isShort) {
      return {
        model: routerModels.lite.model,
        modelName: routerModels.lite.modelId,
        routingReason: 'default:sidebar->lite',
        debug: buildDebug(input, { isComplex, rule: 'sidebar-default' }),
      };
    }

    if (isComplex) {
      return {
        model: routerModels.full.model,
        modelName: routerModels.full.modelId,
        routingReason: 'heuristic:sidebar+complex',
        debug: buildDebug(input, { isComplex, rule: 'sidebar-complex' }),
      };
    }

    return {
      model: routerModels.lite.model,
      modelName: routerModels.lite.modelId,
      routingReason: 'fallback:sidebar->lite',
      debug: buildDebug(input, { isComplex, rule: 'sidebar-fallback' }),
    };
  }

  // Fallback for unknown surfaces
  return {
    model: routerModels.lite.model,
    modelName: routerModels.lite.modelId,
    routingReason: 'fallback:unknown-surface->lite',
    debug: buildDebug(input, { isComplex, rule: 'unknown-surface' }),
  };
}

function buildDebug(
  input: RoutingInput,
  extras: { isComplex: boolean; rule: string },
): Record<string, unknown> {
  return {
    surface: input.surface,
    modeHint: input.modeHint,
    totalTokensEstimate: input.totalTokensEstimate,
    hasTools: input.hasTools,
    requiresHighReliability: input.requiresHighReliability ?? false,
    contextType: input.contextType,
    isComplex: extras.isComplex,
    rule: extras.rule,
  };
}
