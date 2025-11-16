import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alert } from './types';

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
}

export const useAppStore = create<AppState>()(
 persist(
 (set) => ({
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
 dismissAlert: (id) => set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) })),
 
 // User preferences
 favoriteAirports: [],
 toggleFavorite: (code) => set((state) => ({
 favoriteAirports: state.favoriteAirports.includes(code)
 ? state.favoriteAirports.filter(c => c !== code)
 : [...state.favoriteAirports, code]
 })),
 
 recentAirports: [],
 addRecentAirport: (code) => set((state) => ({
 recentAirports: [code, ...state.recentAirports.filter(c => c !== code)].slice(0, 10)
 })),
 }),
 {
 name: 'flightops-storage',
 partialize: (state) => ({
 favoriteAirports: state.favoriteAirports,
 recentAirports: state.recentAirports,
 aiChatOpen: state.aiChatOpen,
 mapCollapsed: state.mapCollapsed,
 }),
 }
 )
);
