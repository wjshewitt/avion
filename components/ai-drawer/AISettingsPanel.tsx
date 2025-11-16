'use client';

import { ArrowLeft } from 'lucide-react';
import { useChatSettings, ChatMode, ModelSelection } from '@/lib/chat-settings-store';
import { useState } from 'react';

interface AISettingsPanelProps {
  onBack: () => void;
}

const modeOptions: { value: ChatMode; label: string }[] = [
  { value: 'flight-ops', label: '🛫 Flight Ops' },
  { value: 'weather-brief', label: '🌤️ Weather Brief' },
  { value: 'airport-planning', label: '🛬 Airport Planning' },
  { value: 'deep-briefing', label: '📄 Deep Briefing' },
];

export function AISettingsPanel({ onBack }: AISettingsPanelProps) {
  const settings = useChatSettings();
  
  // Local state for form (only commit on save)
  const [localSettings, setLocalSettings] = useState({
    useSimpleChat: settings.useSimpleChat,
    defaultMode: settings.defaultMode,
    rememberLastMode: settings.rememberLastMode,
    selectedModel: settings.selectedModel,
    showToolCards: settings.showToolCards,
    showRawData: settings.showRawData,
    compactMode: settings.compactMode,
    showTimestamps: settings.showTimestamps,
    showThinkingProcess: settings.showThinkingProcess,
    showUIElements: settings.showUIElements,
    autoExpandWeather: settings.autoExpandWeather,
    autoExpandAirports: settings.autoExpandAirports,
  });

  const handleSave = () => {
    settings.setUseSimpleChat(localSettings.useSimpleChat);
    settings.setDefaultMode(localSettings.defaultMode);
    settings.setRememberLastMode(localSettings.rememberLastMode);
    settings.setSelectedModel(localSettings.selectedModel);
    settings.setShowToolCards(localSettings.showToolCards);
    settings.setShowRawData(localSettings.showRawData);
    settings.setCompactMode(localSettings.compactMode);
    settings.setShowTimestamps(localSettings.showTimestamps);
    settings.setShowThinkingProcess(localSettings.showThinkingProcess);
    settings.setShowUIElements(localSettings.showUIElements);
    settings.setAutoExpandWeather(localSettings.autoExpandWeather);
    settings.setAutoExpandAirports(localSettings.autoExpandAirports);
    onBack();
  };

  const handleReset = () => {
    settings.resetToDefaults();
    setLocalSettings({
      useSimpleChat: false,
      defaultMode: 'flight-ops',
      rememberLastMode: true,
      selectedModel: 'auto',
      showToolCards: true,
      showRawData: true,
      compactMode: false,
      showTimestamps: true,
      showThinkingProcess: false,
      showUIElements: false,
      autoExpandWeather: false,
      autoExpandAirports: false,
    });
  };

  return (
    <div 
      className="h-full flex flex-col"
      style={{ backgroundColor: 'var(--color-background-primary)' }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 border-b flex items-center gap-3"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)' 
        }}
      >
        <button
          onClick={onBack}
          className="w-8 h-8 flex items-center justify-center rounded-sm transition-colors hover:bg-surface-subtle"
          title="Back to Chat"
        >
          <ArrowLeft size={16} strokeWidth={1.5} style={{ color: 'var(--color-text-primary)' }} />
        </button>
        <div>
          <span 
            className="text-[10px] font-mono uppercase tracking-widest block"
            style={{ color: 'var(--color-text-muted)' }}
          >
            AI CO-PILOT
          </span>
          <h2 
            className="text-[15px] font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Settings
          </h2>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Chat Behavior Section */}
        <section>
          <h3 
            className="text-[10px] font-mono uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Chat Behavior
          </h3>
          <div 
            className="space-y-3 p-4 rounded-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.useSimpleChat}
                onChange={(e) => setLocalSettings({ ...localSettings, useSimpleChat: e.target.checked })}
                className="mt-1"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="flex-1">
                <div className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Use Simple Chat
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Disable specialized modes for straightforward interface
                </div>
              </div>
            </label>

            <div className="pt-2 border-t" style={{ borderColor: '#333' }}>
              <label className="text-[10px] font-mono uppercase tracking-widest block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                AI Model
              </label>
              <select
                value={localSettings.selectedModel}
                onChange={(e) => setLocalSettings({ ...localSettings, selectedModel: e.target.value as ModelSelection })}
                className="w-full px-3 py-2 rounded-sm text-[13px]"
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              >
                <option value="auto">⚡ Auto (Router)</option>
                <option value="flash-lite">🪶 Flash Lite</option>
                <option value="flash">💎 Flash</option>
              </select>
              <div className="text-[10px] mt-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                {localSettings.selectedModel === 'auto' && 'Automatically routes to best model for each request'}
                {localSettings.selectedModel === 'flash-lite' && 'Faster responses, lower cost, good for simple queries'}
                {localSettings.selectedModel === 'flash' && 'Best quality, reasoning, and complex task handling'}
              </div>
            </div>

            {!localSettings.useSimpleChat && (
              <>
                <div className="pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <label className="text-[10px] font-mono uppercase tracking-widest block mb-2" style={{ color: 'var(--color-text-muted)' }}>
                    Default Mode
                  </label>
                  <select
                    value={localSettings.defaultMode}
                    onChange={(e) => setLocalSettings({ ...localSettings, defaultMode: e.target.value as ChatMode })}
                    className="w-full px-3 py-2 rounded-sm text-[13px]"
                    style={{
                      backgroundColor: 'var(--color-surface-subtle)',
                      border: '1px solid var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {modeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.rememberLastMode}
                    onChange={(e) => setLocalSettings({ ...localSettings, rememberLastMode: e.target.checked })}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                    Remember last mode used
                  </div>
                </label>
              </>
            )}
          </div>
        </section>

        {/* Display Section */}
        <section>
          <h3 
            className="text-[10px] font-mono uppercase tracking-widest mb-3"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Display
          </h3>
          <div 
            className="space-y-3 p-4 rounded-sm"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showToolCards}
                onChange={(e) => setLocalSettings({ ...localSettings, showToolCards: e.target.checked })}
                className="mt-1"
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="flex-1">
                <div className="text-[13px] font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  Show tool UI components
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Display visual cards for weather, airports, and flights
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showRawData}
                onChange={(e) => setLocalSettings({ ...localSettings, showRawData: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                Show raw data sections
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.compactMode}
                onChange={(e) => setLocalSettings({ ...localSettings, compactMode: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                Compact mode
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showTimestamps}
                onChange={(e) => setLocalSettings({ ...localSettings, showTimestamps: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                Show timestamps
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showThinkingProcess}
                onChange={(e) => setLocalSettings({ ...localSettings, showThinkingProcess: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                Show thinking process
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showUIElements}
                onChange={(e) => setLocalSettings({ ...localSettings, showUIElements: e.target.checked })}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                Show advanced UI elements
              </div>
            </label>
          </div>
        </section>

        {/* Tool Cards Section */}
        {localSettings.showToolCards && (
          <section>
            <h3 
              className="text-[10px] font-mono uppercase tracking-widest mb-3"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Tool Cards
            </h3>
            <div 
              className="space-y-3 p-4 rounded-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
              }}
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoExpandWeather}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoExpandWeather: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                  Auto-expand weather cards
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.autoExpandAirports}
                  onChange={(e) => setLocalSettings({ ...localSettings, autoExpandAirports: e.target.checked })}
                  style={{ accentColor: 'var(--accent-primary)' }}
                />
                <div className="text-[13px]" style={{ color: 'var(--color-text-primary)' }}>
                  Auto-expand airport cards
                </div>
              </label>
            </div>
          </section>
        )}
      </div>

      {/* Footer Actions */}
      <div 
        className="px-6 py-4 border-t flex items-center justify-between"
        style={{ 
          backgroundColor: 'var(--color-surface)',
          borderColor: 'var(--color-border)' 
        }}
      >
        <button
          onClick={handleReset}
          className="text-[12px] font-mono uppercase tracking-wider transition-colors"
          style={{ color: 'var(--color-text-muted)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--accent-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-sm text-[13px] font-medium transition-all"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: 'var(--color-background-primary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--accent-primary) 90%, black 10%)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
          }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
