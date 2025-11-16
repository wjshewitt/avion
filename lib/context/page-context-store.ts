/**
 * Page Context Store
 * Tracks the current page context for context-aware AI chat
 */

import { create } from 'zustand';

export type PageContextType = 'weather' | 'airport' | 'flight' | 'briefing' | 'page' | 'general';

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

export interface PageRouteContext {
  type: 'page';
  path: string;
  label: string;
  content?: string;
}

export interface GeneralContext {
  type: 'general';
}

export type PageContext =
  | WeatherContext
  | AirportContext
  | FlightContext
  | BriefingContext
  | PageRouteContext
  | GeneralContext;

interface PageContextStore {
  context: PageContext;
  contextEnabled: boolean;
  isContextSetByUser: boolean; // True if context was set by a user action (e.g. clicking a button)
  
  setContext: (context: PageContext, isUserAction?: boolean) => void;
  clearContext: () => void;
  setContextEnabled: (enabled: boolean) => void;
}

export const usePageContextStore = create<PageContextStore>((set) => ({
  context: { type: 'general' },
  contextEnabled: true,
  isContextSetByUser: false,
  
  setContext: (context, isUserAction = false) =>
    set({
      context,
      isContextSetByUser: isUserAction,
    }),
  
  clearContext: () =>
    set({
      context: { type: 'general' },
      isContextSetByUser: false,
    }),

  setContextEnabled: (enabled) =>
    set((state) => {
      // If disabling context, also clear it
      if (!enabled) {
        return {
          contextEnabled: false,
          context: { type: 'general' },
          isContextSetByUser: false,
        };
      }
      return { contextEnabled: true };
    }),
}));
