/**
 * Chat Settings Store
 * Manages user preferences for chat behavior, display, and tool settings
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ChatMode = 'flight-ops' | 'weather-brief' | 'airport-planning' | 'deep-briefing';
export type ModelSelection = 'auto' | 'flash-lite' | 'flash';

interface ChatSettings {
  // Behavior
  useSimpleChat: boolean;
  currentMode: ChatMode | null; // null when simple mode active
  defaultMode: ChatMode;
  rememberLastMode: boolean;
  selectedModel: ModelSelection;
  
  // Display
  showToolCards: boolean;
  showRawData: boolean;
  compactMode: boolean;
  showTimestamps: boolean;
  showThinkingProcess: boolean;
  showUIElements: boolean; // New: controls interactive tool calls, metrics, animations
  
  // Tools
  autoExpandWeather: boolean;
  autoExpandAirports: boolean;
  
  // Actions
  setUseSimpleChat: (use: boolean) => void;
  setShowToolCards: (show: boolean) => void;
  setShowRawData: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setShowTimestamps: (show: boolean) => void;
  setShowThinkingProcess: (show: boolean) => void;
  setShowUIElements: (show: boolean) => void;
  setAutoExpandWeather: (expand: boolean) => void;
  setAutoExpandAirports: (expand: boolean) => void;
  setMode: (mode: ChatMode | null) => void;
  setDefaultMode: (mode: ChatMode) => void;
  setRememberLastMode: (remember: boolean) => void;
  setSelectedModel: (model: ModelSelection) => void;
  resetToDefaults: () => void;
}

const DEFAULT_SETTINGS = {
  useSimpleChat: false,
  currentMode: 'flight-ops' as ChatMode,
  defaultMode: 'flight-ops' as ChatMode,
  rememberLastMode: true,
  selectedModel: 'auto' as ModelSelection,
  showToolCards: true,
  showRawData: true,
  compactMode: false,
  showTimestamps: true,
  showThinkingProcess: true,
  showUIElements: false,
  autoExpandWeather: false,
  autoExpandAirports: false,
};

export const useChatSettings = create<ChatSettings>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      
      setUseSimpleChat: (use) => set({ 
        useSimpleChat: use,
        currentMode: use ? null : DEFAULT_SETTINGS.currentMode
      }),
      
      setShowToolCards: (show) => set({ showToolCards: show }),
      setShowRawData: (show) => set({ showRawData: show }),
      setCompactMode: (compact) => set({ compactMode: compact }),
      setShowTimestamps: (show) => set({ showTimestamps: show }),
      setShowThinkingProcess: (show) => set({ showThinkingProcess: show }),
      setShowUIElements: (show) => set({ showUIElements: show }),
      setAutoExpandWeather: (expand) => set({ autoExpandWeather: expand }),
      setAutoExpandAirports: (expand) => set({ autoExpandAirports: expand }),
      
      setMode: (mode) => set({ currentMode: mode }),
      setDefaultMode: (mode) => set({ defaultMode: mode }),
      setRememberLastMode: (remember) => set({ rememberLastMode: remember }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      
      resetToDefaults: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'flightchat-chat-settings',
      partialize: (state) => ({
        useSimpleChat: state.useSimpleChat,
        currentMode: state.currentMode,
        defaultMode: state.defaultMode,
        rememberLastMode: state.rememberLastMode,
        selectedModel: state.selectedModel,
        showToolCards: state.showToolCards,
        showRawData: state.showRawData,
        compactMode: state.compactMode,
        showTimestamps: state.showTimestamps,
        showThinkingProcess: state.showThinkingProcess,
        showUIElements: state.showUIElements,
        autoExpandWeather: state.autoExpandWeather,
        autoExpandAirports: state.autoExpandAirports,
      }),
    }
  )
);
