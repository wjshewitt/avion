import type {
  ReasoningUIPart,
  TextUIPart,
  ToolUIPart,
  UIMessage,
  FileUIPart,
} from 'ai';

import type { AiProvider } from '@/lib/config/ai';
import type { ConversationMessage } from '@/lib/tanstack/hooks/useConversationMessages';

export interface FlightChatMetadata {
  conversationId: string;
  provider?: AiProvider;
  model?: string;
  supportsThinking?: boolean;
}

export interface WeatherToolInput {
  icao: string;
}

export interface WeatherToolOutput {
  icao: string;
  metar: unknown;
  taf: unknown;
  flightCategory: string | null;
  timestamp: string;
}

export interface AirportCapabilitiesInput {
  icao: string;
  aircraft_type?: string;
  check_type?: 'ils_availability' | 'runway_length' | 'navigation_aids' | 'all';
}

export type AirportCapabilitiesOutput = Record<string, unknown>;

export interface UserFlightsInput {
  filter_type: 'upcoming' | 'past' | 'recent' | 'date_range' | 'all';
  origin_icao?: string;
  destination_icao?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

export type UserFlightsOutput = Record<string, unknown>;

export type FlightChatMessage = UIMessage<FlightChatMetadata> & {
  createdAt?: Date;
};

type AnyMessage = Pick<UIMessage, 'parts'>;

export function getMessageText(message: AnyMessage): string {
  return message.parts
    .filter((part): part is TextUIPart => part.type === 'text')
    .map((part) => part.text)
    .join('');
}

export function getReasoningParts(message: AnyMessage): ReasoningUIPart[] {
  return message.parts.filter((part): part is ReasoningUIPart => part.type === 'reasoning');
}

export function getFileParts(message: AnyMessage): FileUIPart[] {
  return message.parts.filter((part): part is FileUIPart => part.type === 'file');
}

export function getToolParts(message: FlightChatMessage): ToolUIPart[] {
  return message.parts.filter(
    (part): part is ToolUIPart => typeof part.type === 'string' && part.type.startsWith('tool-')
  );
}

export function mapConversationMessageToFlightChatMessage(
  message: ConversationMessage
): FlightChatMessage {
  if (message.ui_message) {
    const stored = message.ui_message as FlightChatMessage;
    return {
      ...stored,
      createdAt: new Date(message.created_at),
    };
  }

  const parts: FlightChatMessage['parts'] = [];

  if (message.content?.trim()) {
    parts.push({
      type: 'text',
      text: message.content,
      state: 'done',
    });
  }

  if (message.thinking_content?.trim()) {
    parts.push({
      type: 'reasoning',
      text: message.thinking_content,
      state: 'done',
    });
  }

  const weatherData = Array.isArray(message.weather_tool_data)
    ? message.weather_tool_data
    : [];
  weatherData.forEach((rawData, index) => {
    const data = rawData as WeatherToolOutput & WeatherToolInput;
    const toolCallId = `weather-${message.id}-${index}`;
    parts.push({
      type: 'tool-get_airport_weather',
      toolCallId,
      state: 'output-available',
      input: { icao: data.icao },
      output: data,
      providerExecuted: true,
    });
  });

  const airportData = Array.isArray(message.airport_tool_data)
    ? message.airport_tool_data
    : [];

  airportData.forEach((rawData, index) => {
    const data = rawData as Record<string, unknown>;
    const toolName = detectAirportToolName(data);
    const toolCallId = `${toolName}-${message.id}-${index}`;

    parts.push({
      type: `tool-${toolName}` as const,
      toolCallId,
      state: 'output-available',
      input: buildAirportToolInput(toolName, data),
      output: data,
      providerExecuted: true,
    });
  });

  return {
    id: message.id,
    role: message.role,
    parts,
    metadata: buildMetadata(message),
    createdAt: new Date(message.created_at),
  } as FlightChatMessage;
}

function detectAirportToolName(data: Record<string, unknown>): 'get_user_flights' | 'get_airport_capabilities' {
  if ('flights' in data || 'count' in data) {
    return 'get_user_flights';
  }
  return 'get_airport_capabilities';
}

function buildAirportToolInput(
  toolName: 'get_user_flights' | 'get_airport_capabilities',
  data: Record<string, unknown>
): UserFlightsInput | AirportCapabilitiesInput {
  switch (toolName) {
    case 'get_user_flights':
      return {
        filter_type: 'all',
      };
    case 'get_airport_capabilities': {
      const icao = typeof data?.icao === 'string' ? data.icao : undefined;
      return {
        icao: (icao ?? 'ZZZZ').toUpperCase(),
      };
    }
    default:
      return { filter_type: 'all' };
  }
}

export function cloneMessageWithTimestamp(message: FlightChatMessage, timestamp: Date): FlightChatMessage {
  return {
    ...message,
    createdAt: timestamp,
  };
}

export function withMetadata(
  message: FlightChatMessage,
  metadata: Partial<FlightChatMetadata>
): FlightChatMessage {
  const current = message.metadata ?? { conversationId: '' };
  return {
    ...message,
    metadata: {
      conversationId: metadata.conversationId ?? current.conversationId ?? '',
      provider: metadata.provider ?? current.provider,
      model: metadata.model ?? current.model,
      supportsThinking: metadata.supportsThinking ?? current.supportsThinking,
    },
  };
}

function buildMetadata(message: ConversationMessage): FlightChatMetadata {
  const rawMetadata = (message.metadata ?? {}) as Record<string, unknown>;

  const metadata: FlightChatMetadata = {
    conversationId:
      typeof rawMetadata.conversationId === 'string' && rawMetadata.conversationId.length > 0
        ? rawMetadata.conversationId
        : message.conversation_id,
  };

  const provider = rawMetadata.provider;
  if (isAiProvider(provider)) {
    metadata.provider = provider;
  }

  const model = rawMetadata.model;
  if (typeof model === 'string' && model.length > 0) {
    metadata.model = model;
  }

  const supportsThinking = rawMetadata.supportsThinking;
  if (typeof supportsThinking === 'boolean') {
    metadata.supportsThinking = supportsThinking;
  }

  return metadata;
}

function isAiProvider(value: unknown): value is AiProvider {
  return value === 'gemini' || value === 'vertex';
}
