'use client';

import { useState } from 'react';
import { ArrowLeft, Sparkles, Eye, Wrench, Zap } from 'lucide-react';
import { useChatSettings, ChatMode } from '@/lib/chat-settings-store';
import ContextPanel from '@/components/chat/ContextPanel';

interface ChatSettingsPanelProps {
  onBack: () => void;
}

type SettingsSection = 'chat' | 'display' | 'tools' | 'advanced';

const modeOptions: { value: ChatMode; label: string }[] = [
  { value: 'flight-ops', label: '🛫 Flight Ops' },
  { value: 'weather-brief', label: '🌤️ Weather Brief' },
  { value: 'airport-planning', label: '🛬 Airport Planning' },
  { value: 'deep-briefing', label: '📄 Deep Briefing' },
];

export default function ChatSettingsPanel({ onBack }: ChatSettingsPanelProps) {
  const [activeSection, setActiveSection] = useState<SettingsSection>('chat');
  const settings = useChatSettings();

  const sections = [
    { id: 'chat' as SettingsSection, label: 'Chat', icon: Sparkles },
    { id: 'display' as SettingsSection, label: 'Display', icon: Eye },
    { id: 'tools' as SettingsSection, label: 'Tools', icon: Wrench },
    { id: 'advanced' as SettingsSection, label: 'Advanced', icon: Zap },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar Navigation */}
      <aside className="w-32 border-r border-border bg-muted/30 flex-shrink-0 flex flex-col">
        <nav className="flex-1 p-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                title={section.label}
                className={`
                  w-full flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium
                  border-l-2 transition-colors
                  ${
                    activeSection === section.id
                      ? 'border-blue bg-blue/5 text-blue'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
              >
                <Icon size={18} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back Button */}
        <div className="border-t border-border p-1">
          <button
            onClick={onBack}
            className="w-full flex flex-col items-center gap-1 px-2 py-3 text-xs font-medium text-foreground hover:bg-muted/50 transition-colors border-l-2 border-transparent hover:border-blue"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl">
          {/* Chat Behavior */}
          {activeSection === 'chat' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Chat Behavior</h2>
              
              <div className="space-y-6">
                <div className="bg-muted/30 border border-border p-4 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.useSimpleChat}
                      onChange={(e) => settings.setUseSimpleChat(e.target.checked)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Use Simple Chat</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Disable specialized modes for a straightforward interface that can answer any question.
                      </div>
                    </div>
                  </label>

                  {!settings.useSimpleChat && (
                    <>
                      <div className="pt-3 border-t border-border">
                        <label className="text-xs font-medium text-foreground block mb-2">
                          Default Mode (when modes active):
                        </label>
                        <select
                          value={settings.defaultMode}
                          onChange={(e) => settings.setDefaultMode(e.target.value as ChatMode)}
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
                          checked={settings.rememberLastMode}
                          onChange={(e) => settings.setRememberLastMode(e.target.checked)}
                          className="mt-0.5"
                        />
                        <div className="text-sm text-foreground">Remember last mode used</div>
                      </label>
                    </>
                  )}
                </div>

                <div className="text-xs text-muted-foreground p-4 bg-muted/20 border border-border">
                  <strong className="text-foreground">About Chat Modes:</strong>
                  <p className="mt-1">
                    Different modes optimize the AI's context and responses for specific aviation tasks.
                    Simple Chat mode provides a general-purpose assistant without specialized behavior.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Display */}
          {activeSection === 'display' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Display & Appearance</h2>
              
              <div className="space-y-6">
                <div className="bg-muted/30 border border-border p-4 space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showToolCards}
                      onChange={(e) => settings.setShowToolCards(e.target.checked)}
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
                      checked={settings.showRawData}
                      onChange={(e) => settings.setShowRawData(e.target.checked)}
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
                      checked={settings.compactMode}
                      onChange={(e) => settings.setCompactMode(e.target.checked)}
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
                      checked={settings.showTimestamps}
                      onChange={(e) => settings.setShowTimestamps(e.target.checked)}
                      className="mt-0.5"
                    />
                    <div className="text-sm text-foreground">Show timestamps</div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showThinkingProcess}
                      onChange={(e) => settings.setShowThinkingProcess(e.target.checked)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Show thinking process</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Display AI reasoning blocks (experimental)
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showUIElements}
                      onChange={(e) => settings.setShowUIElements(e.target.checked)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">Show advanced UI elements</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Interactive tool calls, live metrics, animations, and enhanced visualizations
                      </div>
                    </div>
                  </label>
                </div>

                <div className="text-xs text-muted-foreground p-4 bg-muted/20 border border-border">
                  <strong className="text-foreground">Display Tips:</strong>
                  <p className="mt-1">
                    Tool cards provide rich visualizations for weather and airport data.
                    Advanced UI elements include experimental features like live token counters and streaming visualizers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Cards */}
          {activeSection === 'tools' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Tool Cards</h2>
              
              <div className="space-y-6">
                {settings.showToolCards ? (
                  <div className="bg-muted/30 border border-border p-4 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoExpandWeather}
                        onChange={(e) => settings.setAutoExpandWeather(e.target.checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Auto-expand weather cards</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Automatically show full weather details without clicking expand
                        </div>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoExpandAirports}
                        onChange={(e) => settings.setAutoExpandAirports(e.target.checked)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">Auto-expand airport cards</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Automatically show full airport details without clicking expand
                        </div>
                      </div>
                    </label>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground p-4 bg-muted/20 border border-border">
                    Tool cards are currently disabled. Enable "Show tool UI components" in Display settings to configure these options.
                  </div>
                )}

                <div className="text-xs text-muted-foreground p-4 bg-muted/20 border border-border">
                  <strong className="text-foreground">About Tool Cards:</strong>
                  <p className="mt-1">
                    When the AI retrieves weather or airport data, it displays formatted cards with key information.
                    Auto-expand options skip the collapsed state and show all details immediately.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Advanced */}
          {activeSection === 'advanced' && (
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">Advanced Features</h2>
              
              <div className="space-y-6">
                <div className="p-4 bg-amber/10 border border-amber text-sm">
                  <strong className="text-foreground">⚠️ Experimental Features</strong>
                  <p className="mt-1 text-muted-foreground">
                    These features are under active development and may impact performance on slower devices.
                    Use with caution in production environments.
                  </p>
                </div>

                <div className="bg-muted/30 border border-border p-4 space-y-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground mb-3">Test Features Panel</div>
                    <p className="text-xs text-muted-foreground mb-3">
                      When enabled, a "Test Features" button appears in the chat header, providing access to:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Interactive tool call inspection with JSON export</li>
                      <li>Live token counters and context window meters</li>
                      <li>Real-time cost tracking for API usage</li>
                      <li>Message streaming visualizers</li>
                    </ul>
                    <div className="mt-3 p-3 bg-muted/50 border border-border">
                      <div className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Current Status:</strong> {settings.showUIElements ? '✓ Enabled' : '✗ Disabled'}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Toggle "Show advanced UI elements" in Display settings to enable.
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="text-sm font-semibold text-foreground mb-2">Performance Impact</div>
                    <div className="text-xs text-muted-foreground space-y-2">
                      <p>
                        <strong className="text-foreground">Low:</strong> Tool cards, timestamps, thinking blocks
                      </p>
                      <p>
                        <strong className="text-foreground">Medium:</strong> Interactive tool calls, metrics tracking
                      </p>
                      <p>
                        <strong className="text-foreground">High:</strong> Streaming visualizers, live token counters (updates every 100ms)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Context Mode Section */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Context Mode</h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    When enabled, the AI automatically detects what page you're viewing and uses that context to provide more relevant responses. For example, on a weather page for KJFK, you can ask "What's the forecast?" without specifying the airport code.
                  </p>
                  <ContextPanel />
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      settings.resetToDefaults();
                      alert('All settings have been reset to defaults');
                    }}
                    className="w-full px-4 py-3 border border-border text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Reset All Settings to Defaults
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
