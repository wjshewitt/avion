import type { FlightChatMessage } from '@/lib/chat/messages';

export const mockMessages: FlightChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    parts: [
      {
        type: 'text',
        text: 'What are the current weather conditions at KJFK?',
        state: 'done',
      },
    ],
    createdAt: new Date('2025-11-13T10:30:00'),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    parts: [
      {
        type: 'reasoning',
        text: 'The user is requesting weather information for John F. Kennedy International Airport (KJFK). I should use the get_airport_weather tool to fetch the current METAR and TAF data.',
        state: 'done',
      },
      {
        type: 'tool-get_airport_weather',
        toolCallId: 'tool-weather-1',
        state: 'output-available',
        input: { icao: 'KJFK' },
        output: {
          icao: 'KJFK',
          metar: {
            raw: 'KJFK 131251Z 27012KT 10SM FEW250 08/M03 A3012',
            temp: 8,
            dewpoint: -3,
            wind_speed: 12,
            wind_direction: 270,
            visibility: 10,
            altimeter: 30.12,
          },
          taf: {
            raw: 'KJFK 131120Z 1312/1418 27015G25KT P6SM FEW250',
            forecast_period: '13/12:00 - 14/18:00',
          },
          flightCategory: 'VFR',
          timestamp: '2025-11-13T12:51:00Z',
        },
        providerExecuted: true,
      },
      {
        type: 'text',
        text: 'Current conditions at KJFK are excellent for flying:\n\n**METAR**: Wind 270° at 12 knots, visibility 10 statute miles, few clouds at 25,000 feet. Temperature 8°C, dewpoint -3°C. Altimeter 30.12 inHg.\n\n**Flight Category**: VFR\n\nConditions are clear with good visibility and light winds. Perfect for operations.',
        state: 'done',
      },
    ],
    metadata: {
      conversationId: 'conv-1',
      provider: 'vertex',
      model: 'gemini-2.5-flash',
      supportsThinking: true,
    },
    createdAt: new Date('2025-11-13T10:30:15'),
  },
  {
    id: 'msg-3',
    role: 'user',
    parts: [
      {
        type: 'text',
        text: 'Show me all my upcoming flights',
        state: 'done',
      },
    ],
    createdAt: new Date('2025-11-13T10:31:00'),
  },
  {
    id: 'msg-4',
    role: 'assistant',
    parts: [
      {
        type: 'tool-get_user_flights',
        toolCallId: 'tool-flights-1',
        state: 'output-available',
        input: { filter_type: 'upcoming', limit: 10 },
        output: {
          count: 3,
          flights: [
            {
              id: 'flight-1',
              code: 'AAL123',
              origin: 'KJFK',
              destination: 'EGLL',
              departure_time: '2025-11-14T14:30:00Z',
              arrival_time: '2025-11-15T02:45:00Z',
              aircraft_type: 'B77W',
              status: 'scheduled',
            },
            {
              id: 'flight-2',
              code: 'UAL456',
              origin: 'KSFO',
              destination: 'RJTT',
              departure_time: '2025-11-16T11:00:00Z',
              arrival_time: '2025-11-17T15:30:00Z',
              aircraft_type: 'B789',
              status: 'scheduled',
            },
            {
              id: 'flight-3',
              code: 'DAL789',
              origin: 'KATL',
              destination: 'LFPG',
              departure_time: '2025-11-18T18:00:00Z',
              arrival_time: '2025-11-19T08:15:00Z',
              aircraft_type: 'A359',
              status: 'scheduled',
            },
          ],
        },
        providerExecuted: true,
      },
      {
        type: 'text',
        text: 'You have 3 upcoming flights scheduled:\n\n1. **AAL123** KJFK → EGLL on Nov 14, departing 14:30 UTC (B777-300ER)\n2. **UAL456** KSFO → RJTT on Nov 16, departing 11:00 UTC (B787-9)\n3. **DAL789** KATL → LFPG on Nov 18, departing 18:00 UTC (A350-900)\n\nAll flights are currently on schedule.',
        state: 'done',
      },
    ],
    metadata: {
      conversationId: 'conv-1',
      provider: 'vertex',
      model: 'gemini-2.5-flash',
      supportsThinking: false,
    },
    createdAt: new Date('2025-11-13T10:31:08'),
  },
  {
    id: 'msg-5',
    role: 'user',
    parts: [
      {
        type: 'text',
        text: 'What are the airport capabilities at EGLL?',
        state: 'done',
      },
    ],
    createdAt: new Date('2025-11-13T10:32:00'),
  },
  {
    id: 'msg-6',
    role: 'assistant',
    parts: [
      {
        type: 'reasoning',
        text: 'The user wants to know about London Heathrow (EGLL) airport capabilities. I\'ll query the airport capabilities tool to get comprehensive information about runways, navigation aids, and services.',
        state: 'done',
      },
      {
        type: 'tool-get_airport_capabilities',
        toolCallId: 'tool-airport-1',
        state: 'output-available',
        input: { icao: 'EGLL', check_type: 'all' },
        output: {
          icao: 'EGLL',
          name: 'London Heathrow Airport',
          runways: [
            { identifier: '09L/27R', length: 3902, width: 50, surface: 'ASPH' },
            { identifier: '09R/27L', length: 3660, width: 50, surface: 'ASPH' },
          ],
          ils_available: true,
          navigation_aids: ['ILS', 'VOR', 'DME', 'NDB'],
          services: ['Fuel', 'Maintenance', 'Customs', 'Immigration'],
          elevation: 83,
          coordinates: { lat: 51.4775, lon: -0.4614 },
        },
        providerExecuted: true,
      },
      {
        type: 'text',
        text: 'London Heathrow (EGLL) is a major international airport with excellent capabilities:\n\n**Runways**:\n- 09L/27R: 3,902m × 50m (ASPH)\n- 09R/27L: 3,660m × 50m (ASPH)\n\n**Navigation**: ILS, VOR, DME, NDB available\n\n**Services**: Full fuel, maintenance, customs, and immigration facilities\n\n**Elevation**: 83 feet MSL\n\nThe airport is well-equipped for all commercial operations including heavy wide-body aircraft.',
        state: 'done',
      },
    ],
    metadata: {
      conversationId: 'conv-1',
      provider: 'vertex',
      model: 'gemini-2.5-flash',
      supportsThinking: true,
    },
    createdAt: new Date('2025-11-13T10:32:12'),
  },
];

export const streamingMessage: FlightChatMessage = {
  id: 'msg-streaming',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: 'Analyzing flight conditions for your route',
      state: 'streaming',
    },
  ],
  metadata: {
    conversationId: 'conv-1',
    provider: 'vertex',
    model: 'gemini-2.5-flash',
  },
  createdAt: new Date(),
};

export const loadingToolMessage: FlightChatMessage = {
  id: 'msg-loading',
  role: 'assistant',
  parts: [
    {
      type: 'tool-get_airport_weather',
      toolCallId: 'tool-loading-1',
      state: 'input-available',
      input: { icao: 'KSFO' },
      providerExecuted: false,
    },
  ],
  metadata: {
    conversationId: 'conv-1',
    provider: 'vertex',
    model: 'gemini-2.5-flash',
  },
  createdAt: new Date(),
};
