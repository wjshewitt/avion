/**
 * Page Context Store
 * Tracks the current page context for context-aware AI chat
 */

import { create } from 'zustand';

export type PageContextType = 'weather' | 'airport' | 'flight' | 'briefing' | 'general';

export interface WeatherContext {
  type: 'weather';
  icao: string;
  title?: string;
  metarAvailable?: boolean;
  tafAvailable?: boolean;
}

export interface AirportContext {
  type: 'airport';
  icao: string;
  name?: string;
  runwayCount?: number;
}

export interface FlightContext {
  type: 'flight';
  flightId: string;
  code?: string;
  origin?: string;
  destination?: string;
}

export interface BriefingContext {
  type: 'briefing';
  icao: string;
  title?: string;
}

export interface GeneralContext {
  type: 'general';
}

export type PageContext = WeatherContext | AirportContext | FlightContext | BriefingContext | GeneralContext;

interface PageContextStore {
  context: PageContext;
  contextEnabled: boolean;
  badgeDismissed: boolean;
  
  setContext: (context: PageContext) => void;
  setContextEnabled: (enabled: boolean) => void;
  dismissBadge: () => void;
  resetBadge: () => void;
  clearContext: () => void;
}

export const usePageContextStore = create<PageContextStore>((set) => ({
  context: { type: 'general' },
  contextEnabled: true,
  badgeDismissed: false,
  
  setContext: (context) => set({ context, badgeDismissed: false }),
  setContextEnabled: (enabled) => set({ contextEnabled: enabled }),
  dismissBadge: () => set({ badgeDismissed: true }),
  resetBadge: () => set({ badgeDismissed: false }),
  clearContext: () => set({ context: { type: 'general' }, badgeDismissed: false }),
}));
