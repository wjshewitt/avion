import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createVertex } from '@ai-sdk/google-vertex';
import type { JSONValue } from 'ai';
import type { LanguageModel } from 'ai';

export type AiProvider = 'gemini' | 'vertex';

export interface AiProviderConfig {
  provider: AiProvider;
  model: LanguageModel;
  modelId: string;
  supportsThinking: boolean;
  defaultProviderOptions?: ProviderOptionsMap;
}

export interface AiRouterModelsConfig {
  provider: AiProvider;
  supportsThinking: boolean;
  defaultProviderOptions?: ProviderOptionsMap;
  lite: {
    model: LanguageModel;
    modelId: string;
  };
  full: {
    model: LanguageModel;
    modelId: string;
  };
}

export type ProviderOptionsMap = Record<string, Record<string, JSONValue>>;

export class MissingAiProviderKeyError extends Error {
  readonly provider: AiProvider;
  readonly code: 'missing_vertex_credentials' | 'missing_gemini_api_key';

  constructor(provider: AiProvider, reason?: string) {
    const baseMessage = provider === 'vertex'
      ? 'Vertex AI configuration incomplete. Set GOOGLE_VERTEX_PROJECT (or GOOGLE_CLOUD_PROJECT) and ensure authentication is configured.'
      : 'Gemini API key missing. Set GOOGLE_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) in environment variables.';
    super(reason ? `${baseMessage} ${reason}` : baseMessage);
    this.name = 'MissingAiProviderKeyError';
    this.provider = provider;
    this.code = provider === 'vertex' ? 'missing_vertex_credentials' : 'missing_gemini_api_key';
  }
}

/**
 * Get AI provider configuration with automatic fallback
 * Priority: Vertex AI (if configured) → Gemini API (fallback)
 */
export function getAiProviderConfig(): AiProviderConfig {
  const config = getAiRouterModelsConfig();

  // For backwards compatibility, expose the "full" model as the default
  return {
    provider: config.provider,
    model: config.full.model,
    modelId: config.full.modelId,
    supportsThinking: config.supportsThinking,
    defaultProviderOptions: config.defaultProviderOptions,
  };
}

/**
 * Get routing-ready configuration with both Lite and Full Gemini models.
 * Priority: Vertex AI (if configured) → Gemini API (fallback).
 */
export function getAiRouterModelsConfig(): AiRouterModelsConfig {
  const env = process.env;

  const geminiApiKey = env.GOOGLE_API_KEY || env.GOOGLE_GENERATIVE_AI_API_KEY;

  const rawVertexProjectId = env.GOOGLE_VERTEX_PROJECT || env.GOOGLE_CLOUD_PROJECT;
  const vertexProjectId = rawVertexProjectId?.trim();
  const rawVertexLocation = env.GOOGLE_VERTEX_LOCATION || env.GOOGLE_CLOUD_LOCATION;
  const vertexLocation = rawVertexLocation?.trim() || 'us-central1';
  const rawVertexFullModelId = env.GOOGLE_VERTEX_MODEL?.trim();
  const vertexFullModelId = rawVertexFullModelId && rawVertexFullModelId.length > 0 ? rawVertexFullModelId : 'gemini-2.5-flash';
  const rawVertexLiteModelId = env.GOOGLE_VERTEX_LITE_MODEL?.trim();
  const vertexLiteModelId = rawVertexLiteModelId && rawVertexLiteModelId.length > 0 ? rawVertexLiteModelId : 'gemini-2.5-flash-lite';
  const vertexSearchGrounding = parseBoolean(env.GOOGLE_VERTEX_USE_SEARCH_GROUNDING ?? 'false');
  const vertexEnableThinking = parseBoolean(env.GOOGLE_VERTEX_ENABLE_THINKING ?? 'true');

  const serviceAccountEmail = (env.GOOGLE_VERTEX_CLIENT_EMAIL || env.GOOGLE_CLIENT_EMAIL)?.trim();
  const rawPrivateKey = env.GOOGLE_VERTEX_PRIVATE_KEY || env.GOOGLE_PRIVATE_KEY;
  const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;

  const hasVertexCredentials = Boolean(serviceAccountEmail && privateKey);

  const shouldUseVertex = Boolean(vertexProjectId && vertexProjectId.length > 0);

  if (shouldUseVertex) {
    const projectId = vertexProjectId!;

    const vertexOptions: Parameters<typeof createVertex>[0] = {
      project: projectId,
      location: vertexLocation,
    };

    if (hasVertexCredentials && serviceAccountEmail && privateKey) {
      vertexOptions.googleAuthOptions = {
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey,
        },
      };
    }

    const vertexProvider = createVertex(vertexOptions);
    const liteModel = vertexProvider(vertexLiteModelId);
    const fullModel = vertexProvider(vertexFullModelId);
    const supportsThinking = vertexEnableThinking;

    console.log(
      `✅ Using Vertex AI provider (lite: ${vertexLiteModelId}, full: ${vertexFullModelId}${supportsThinking ? ', thinking enabled' : ''})`,
    );

    return {
      provider: 'vertex',
      supportsThinking,
      defaultProviderOptions: vertexSearchGrounding
        ? {
            google: {
              useSearchGrounding: true,
            },
          }
        : undefined,
      lite: {
        model: liteModel,
        modelId: vertexLiteModelId,
      },
      full: {
        model: fullModel,
        modelId: vertexFullModelId,
      },
    };
  }

  if (geminiApiKey) {
    const geminiFullModelId = env.GOOGLE_GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
    const geminiLiteModelId = env.GOOGLE_GEMINI_LITE_MODEL?.trim() || 'gemini-2.5-flash-lite';
    console.log(`✅ Using Gemini API provider (lite: ${geminiLiteModelId}, full: ${geminiFullModelId})`);
    const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });
    return {
      provider: 'gemini',
      supportsThinking: false,
      lite: {
        model: google(geminiLiteModelId),
        modelId: geminiLiteModelId,
      },
      full: {
        model: google(geminiFullModelId),
        modelId: geminiFullModelId,
      },
    };
  }

  throw new MissingAiProviderKeyError('gemini');
}

export function isMissingAiProviderKeyError(error: unknown): error is MissingAiProviderKeyError {
  return error instanceof MissingAiProviderKeyError;
}

function parseBoolean(value: string): boolean {
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}
