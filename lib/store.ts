import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { Alert } from './types';

const PIN_LIMIT = 8;

interface AppState {
  // Flight selection
  selectedFlightId: string | null;
  setSelectedFlightId: (id: string | null) => void;

  // UI state
  aiChatOpen: boolean;
  toggleAiChat: () => void;

  aiSettingsOpen: boolean;
  setAiSettingsOpen: (open: boolean) => void;

  mapCollapsed: boolean;
  toggleMap: () => void;

  // Search state (shared between header and AI sidebar)
  searchValue: string;
  setSearchValue: (value: string) => void;

  // Alerts
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  dismissAlert: (id: string) => void;

  // User preferences
  favoriteAirports: string[];
  toggleFavorite: (code: string) => void;

  recentAirports: string[];
  addRecentAirport: (code: string) => void;

  // Weather pins
  pinnedAirports: string[];
  setPinnedAirports: (icaos: string[]) => void;
  pinAirport: (icao: string) => void;
  unpinAirport: (icao: string) => void;
  isPinned: (icao: string) => boolean;
}

const createStore: StateCreator<AppState> = (set, get) => ({
  // Flight selection
  selectedFlightId: null,
  setSelectedFlightId: (id) => set({ selectedFlightId: id }),

  // UI state
  aiChatOpen: false,
  toggleAiChat: () => set((state) => ({ aiChatOpen: !state.aiChatOpen })),

  aiSettingsOpen: false,
  setAiSettingsOpen: (open) => set({ aiSettingsOpen: open }),

  mapCollapsed: false,
  toggleMap: () => set((state) => ({ mapCollapsed: !state.mapCollapsed })),

  // Search state
  searchValue: '',
  setSearchValue: (value) => set({ searchValue: value }),

  // Alerts
  alerts: [],
  addAlert: (alert) => set((state) => ({ alerts: [...state.alerts, alert] })),
  dismissAlert: (id) => set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

  // User preferences
  favoriteAirports: [],
  toggleFavorite: (code) =>
    set((state) => ({
      favoriteAirports: state.favoriteAirports.includes(code)
        ? state.favoriteAirports.filter((c) => c !== code)
        : [...state.favoriteAirports, code],
    })),

  recentAirports: [],
  addRecentAirport: (code) =>
    set((state) => ({
      recentAirports: [code, ...state.recentAirports.filter((c) => c !== code)].slice(0, 10),
    })),

  // Weather pins
  pinnedAirports: [],
  setPinnedAirports: (icaos) => set({ pinnedAirports: icaos }),
  pinAirport: (icao) =>
    set((state) => ({
      pinnedAirports: state.pinnedAirports.includes(icao)
        ? state.pinnedAirports
        : [...state.pinnedAirports, icao].slice(0, PIN_LIMIT),
    })),
  unpinAirport: (icao) =>
    set((state) => ({
      pinnedAirports: state.pinnedAirports.filter((code) => code !== icao),
    })),
  isPinned: (icao) => get().pinnedAirports.includes(icao),
});

export const useAppStore = create<AppState>()(
  persist(createStore, {
    name: 'flightops-storage',
    partialize: (state) => ({
      favoriteAirports: state.favoriteAirports,
      recentAirports: state.recentAirports,
      aiChatOpen: state.aiChatOpen,
      mapCollapsed: state.mapCollapsed,
    }),
  })
);
