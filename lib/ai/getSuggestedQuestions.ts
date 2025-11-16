import type { PageContext } from '@/lib/context/page-context-store';
import type { ChatContext } from '@/lib/chat-store';

export type SuggestedQuestion = {
  id: string;
  label: string;
  description?: string;
  payload?: string;
};

interface GetSuggestedQuestionsArgs {
  pageContext: PageContext;
  chatContext: ChatContext;
  hasMessages: boolean;
}

const MAX_SUGGESTIONS = 5;

export function getSuggestedQuestions({
  pageContext,
  chatContext,
  hasMessages,
}: GetSuggestedQuestionsArgs): SuggestedQuestion[] {
  const pageType = getPageType(pageContext);

  const icao =
    (pageContext.type === 'airport' || pageContext.type === 'weather' || pageContext.type === 'briefing')
      ? pageContext.icao
      : chatContext.type === 'airport'
        ? chatContext.airportCodes?.[0]
        : undefined;

  const flightCode =
    pageContext.type === 'flight'
      ? pageContext.code
      : chatContext.type === 'flight'
        ? chatContext.flightIds?.[0]
        : undefined;

  const base: SuggestedQuestion[] = [];

  if (hasMessages) {
    base.push(
      {
        id: 'conversation-summarize',
        label: 'Summarize the key points so far',
      },
      {
        id: 'conversation-checklist',
        label: 'Turn this into a reusable checklist',
      },
      {
        id: 'conversation-followups',
        label: 'What follow-up questions should I ask before deciding?',
      },
    );
  } else {
    base.push(
      {
        id: 'intro-operations',
        label: 'What can you help me with for flight operations and planning?',
      },
      {
        id: 'intro-high-value',
        label: 'Give me examples of high-value questions for this operation.',
      },
    );
  }

  const contextual: SuggestedQuestion[] = [];

  switch (pageType) {
    case 'dashboard':
    case 'mission_control':
      contextual.push(
        {
          id: 'dashboard-risks',
          label: 'Summarize the key risks in my current flights and airports.',
        },
        {
          id: 'dashboard-focus',
          label: 'What should I pay attention to for today’s operations?',
        },
        {
          id: 'dashboard-weather-hotspots',
          label: 'Identify any airports with marginal or worse conditions right now.',
        },
      );
      break;

    case 'flights_list':
      if (flightCode) {
        contextual.push(
          {
            id: 'flight-briefing',
            label: `Give me a briefing for flight ${flightCode}.`,
          },
          {
            id: 'flight-notam-weather',
            label: 'Summarize NOTAM and weather risks for this flight.',
          },
        );
      } else {
        contextual.push(
          {
            id: 'flights-risk-scan',
            label: 'Scan today’s flights and highlight any operational risks.',
          },
          {
            id: 'flights-weather-exposure',
            label: 'Which flights have the most weather exposure today?',
          },
          {
            id: 'flights-schedule-optimizations',
            label: 'Suggest optimizations to today’s schedule.',
          },
        );
      }
      break;

    case 'flight_create_wizard':
      contextual.push(
        {
          id: 'wizard-route',
          label: 'Help me choose a route for this flight given current winds and constraints.',
        },
        {
          id: 'wizard-alternates',
          label: 'Suggest suitable alternates for this pairing.',
        },
        {
          id: 'wizard-duty-rest',
          label: 'Check duty and rest constraints for this crew and schedule.',
        },
      );
      break;

    case 'airports_list':
      contextual.push(
        {
          id: 'airports-weather-risk',
          label: 'Which of our primary airports have the most weather risk today?',
        },
        {
          id: 'airports-crosswind',
          label: 'Identify airports with crosswind or tailwind concerns.',
        },
      );
      break;

    case 'airport_detail':
      contextual.push(
        {
          id: 'airport-briefing',
          label: `Brief me on current and forecast conditions at ${icao ?? 'this airport'}.`,
        },
        {
          id: 'airport-runway-notam',
          label: `Summarize runway, NOTAM, and approach considerations for ${icao ?? 'this airport'}.`,
        },
        {
          id: 'airport-alternates',
          label: `Compare ${icao ?? 'this airport'} to nearby alternates for today.`,
        },
      );
      break;

    case 'weather_page':
      contextual.push(
        {
          id: 'weather-summary',
          label: 'Summarize METAR and TAF trends for the airports on this page.',
        },
        {
          id: 'weather-hazards',
          label: 'Highlight any airports with low ceilings, visibility, or storms.',
        },
      );
      break;

    case 'weather_detail':
      contextual.push(
        {
          id: 'weather-briefing',
          label: `Turn the METAR and TAF at ${icao ?? 'this airport'} into a pilot-friendly briefing.`,
        },
        {
          id: 'weather-hazards-detail',
          label: `Explain the main hazards at ${icao ?? 'this airport'} for arrivals in the next 6 hours.`,
        },
        {
          id: 'weather-seasonal',
          label: `Compare today’s conditions at ${icao ?? 'this airport'} to typical seasonal patterns.`,
        },
      );
      break;

    case 'settings':
      contextual.push(
        {
          id: 'settings-recommend',
          label: 'Recommend chat settings and models for quick operational checks.',
        },
        {
          id: 'settings-workflow',
          label: 'Design an ideal workflow for using this assistant during preflight.',
        },
      );
      break;

    case 'onboarding':
      contextual.push(
        {
          id: 'onboarding-explain',
          label: 'Explain how you can help with daily flight planning and risk management.',
        },
        {
          id: 'onboarding-checklist',
          label: 'Help me establish a standard preflight AI checklist.',
        },
      );
      break;

    case 'generic':
    default:
      break;
  }

  const all = [...contextual, ...base];
  const uniqueById = new Map<string, SuggestedQuestion>();

  for (const q of all) {
    if (!q.label.trim()) continue;
    if (!uniqueById.has(q.id)) {
      uniqueById.set(q.id, q);
    }
  }

  return Array.from(uniqueById.values()).slice(0, MAX_SUGGESTIONS);
}

type PageTypeBucket =
  | 'dashboard'
  | 'mission_control'
  | 'flights_list'
  | 'flight_create_wizard'
  | 'airports_list'
  | 'airport_detail'
  | 'weather_page'
  | 'weather_detail'
  | 'settings'
  | 'onboarding'
  | 'generic';

function getPageType(context: PageContext): PageTypeBucket {
  if (context.type === 'weather') return 'weather_detail';
  if (context.type === 'airport') return 'airport_detail';
  if (context.type === 'flight') return 'flights_list';

  if (context.type === 'page') {
    const path = context.path || '';
    if (path === '/' || path.startsWith('/dashboard')) return 'dashboard';
    if (path.startsWith('/mission-control')) return 'mission_control';
    if (path.startsWith('/flights/create')) return 'flight_create_wizard';
    if (path.startsWith('/flights')) return 'flights_list';
    if (path.startsWith('/airports')) return 'airports_list';
    if (path.startsWith('/weather/')) return 'weather_detail';
    if (path.startsWith('/weather')) return 'weather_page';
    if (path.startsWith('/settings')) return 'settings';
    if (path.startsWith('/onboarding')) return 'onboarding';
  }

  return 'generic';
}
