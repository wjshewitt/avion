'use client';

import { X } from 'lucide-react';
import { useChatSettings, ChatMode } from '@/lib/chat-settings-store';
import { useState } from 'react';

interface ChatSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const modeOptions: { value: ChatMode; label: string }[] = [
  { value: 'flight-ops', label: '🛫 Flight Ops' },
  { value: 'weather-brief', label: '🌤️ Weather Brief' },
  { value: 'airport-planning', label: '🛬 Airport Planning' },
  { value: 'trip-planning', label: '📋 Trip Planning' },
];

export default function ChatSettingsModal({ isOpen, onClose }: ChatSettingsModalProps) {
  const settings = useChatSettings();
  
  // Local state for form (only commit on save)
  const [localSettings, setLocalSettings] = useState({
    useSimpleChat: settings.useSimpleChat,
    defaultMode: settings.defaultMode,
    rememberLastMode: settings.rememberLastMode,
    showToolCards: settings.showToolCards,
    showRawData: settings.showRawData,
    compactMode: settings.compactMode,
    showTimestamps: settings.showTimestamps,
    showThinkingProcess: settings.showThinkingProcess,
    autoExpandWeather: settings.autoExpandWeather,
    autoExpandAirports: settings.autoExpandAirports,
  });

  const handleSave = () => {
    settings.setUseSimpleChat(localSettings.useSimpleChat);
    settings.setDefaultMode(localSettings.defaultMode);
    settings.setRememberLastMode(localSettings.rememberLastMode);
    settings.setShowToolCards(localSettings.showToolCards);
    settings.setShowRawData(localSettings.showRawData);
    settings.setCompactMode(localSettings.compactMode);
    settings.setShowTimestamps(localSettings.showTimestamps);
    settings.setShowThinkingProcess(localSettings.showThinkingProcess);
    settings.setAutoExpandWeather(localSettings.autoExpandWeather);
    settings.setAutoExpandAirports(localSettings.autoExpandAirports);
    onClose();
  };

  const handleReset = () => {
    if (confirm('Reset all settings to defaults?')) {
      settings.resetToDefaults();
      setLocalSettings({
        useSimpleChat: false,
        defaultMode: 'flight-ops',
        rememberLastMode: true,
        showToolCards: true,
        showRawData: true,
        compactMode: false,
        showTimestamps: true,
        showThinkingProcess: false,
        autoExpandWeather: false,
        autoExpandAirports: false,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-card border border-border w-full max-w-md max-h-[80vh] overflow-y-auto pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">Chat Settings</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Chat Behavior */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Chat Behavior</h3>
              <div className="space-y-3 bg-muted/30 border border-border p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.useSimpleChat}
                    onChange={(e) => setLocalSettings({ ...localSettings, useSimpleChat: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Use Simple Chat</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Disable specialized modes for a straightforward interface that can answer any question.
                    </div>
                  </div>
                </label>

                {!localSettings.useSimpleChat && (
                  <>
                    <div className="pt-2 border-t border-border">
                      <label className="text-xs font-medium text-foreground block mb-2">
                        Default Mode (when modes active):
                      </label>
                      <select
                        value={localSettings.defaultMode}
                        onChange={(e) => setLocalSettings({ ...localSettings, defaultMode: e.target.value as ChatMode })}
                        className="w-full px-3 py-2 bg-background border border-border text-sm text-foreground"
                      >
                        {modeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localSettings.rememberLastMode}
                        onChange={(e) => setLocalSettings({ ...localSettings, rememberLastMode: e.target.checked })}
                        className="mt-0.5"
                      />
                      <div className="text-sm text-foreground">Remember last mode used</div>
                    </label>
                  </>
                )}
              </div>
            </section>

            {/* Display */}
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">Display</h3>
              <div className="space-y-3 bg-muted/30 border border-border p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showToolCards}
                    onChange={(e) => setLocalSettings({ ...localSettings, showToolCards: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Show tool UI components</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Display visual cards for weather, airports, and flights
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showRawData}
                    onChange={(e) => setLocalSettings({ ...localSettings, showRawData: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Show raw data sections</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Show expandable raw METAR/TAF
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.compactMode}
                    onChange={(e) => setLocalSettings({ ...localSettings, compactMode: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Compact mode</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Reduce spacing between messages
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showTimestamps}
                    onChange={(e) => setLocalSettings({ ...localSettings, showTimestamps: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="text-sm text-foreground">Show timestamps</div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showThinkingProcess}
                    onChange={(e) => setLocalSettings({ ...localSettings, showThinkingProcess: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Show thinking process</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Display AI reasoning blocks (experimental)
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* Tool Cards */}
            {localSettings.showToolCards && (
              <section>
                <h3 className="text-sm font-semibold text-foreground mb-3">Tool Cards</h3>
                <div className="space-y-3 bg-muted/30 border border-border p-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.autoExpandWeather}
                      onChange={(e) => setLocalSettings({ ...localSettings, autoExpandWeather: e.target.checked })}
                      className="mt-0.5"
                    />
                    <div className="text-sm text-foreground">Auto-expand weather cards</div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSettings.autoExpandAirports}
                      onChange={(e) => setLocalSettings({ ...localSettings, autoExpandAirports: e.target.checked })}
                      className="mt-0.5"
                    />
                    <div className="text-sm text-foreground">Auto-expand airport cards</div>
                  </label>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <button
              onClick={handleReset}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue text-white text-sm hover:bg-blue/90 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
