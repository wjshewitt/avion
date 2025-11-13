'use client';

import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';
import { useState } from 'react';

interface FullStudioProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function FullStudio({ messages, input, onInputChange, onSend, isStreaming }: FullStudioProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  return (
    <div className="h-full flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Toolbar */}
        <div className="border-b border-gray-900 px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xs font-medium text-gray-900">Studio Mode</div>
              
              {/* Model Selector */}
              <div className="flex items-center gap-2">
                <label className="text-[10px] text-gray-600">Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="border border-gray-900 px-2 py-1 text-[10px] text-gray-900 outline-none"
                >
                  <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                </select>
              </div>

              <div className="h-4 w-px bg-gray-400" />

              {/* Toolbar Actions */}
              <button className="text-[10px] text-gray-600 hover:text-gray-900">
                Export
              </button>
              <button className="text-[10px] text-gray-600 hover:text-gray-900">
                Clear
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-[10px] text-gray-600 hover:text-gray-900"
              >
                {showSettings ? 'Hide Settings' : 'Settings'}
              </button>
            </div>

            <div className="flex items-center gap-3 text-[10px] text-gray-600">
              <div>Vertex AI</div>
              <div>·</div>
              <div>{messages.length} messages</div>
              <div>·</div>
              <div className={isStreaming ? 'text-green-600' : 'text-gray-400'}>
                {isStreaming ? '● Streaming' : '○ Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => {
              const text = getMessageText(message);
              const isUser = message.role === 'user';
              const tools = message.parts.filter(
                (part) => typeof part.type === 'string' && part.type.startsWith('tool-')
              );

              return (
                <div key={message.id} className="space-y-3">
                  {/* Message Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 border border-gray-900 flex items-center justify-center text-[10px] font-medium ${
                          isUser ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                        }`}
                      >
                        {isUser ? 'U' : 'A'}
                      </div>
                      <div className="text-xs font-medium text-gray-900">
                        {isUser ? 'You' : 'Assistant'}
                      </div>
                    </div>
                    {message.createdAt && (
                      <div className="text-[10px] text-gray-500">
                        {message.createdAt.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>

                  {/* Tool Visualization */}
                  {tools.map((tool: any, idx) => {
                    const toolName = tool.type.replace('tool-', '');
                    return (
                      <div key={idx} className="border border-gray-900 bg-gray-50">
                        <div className="border-b border-gray-900 px-3 py-2 bg-white">
                          <div className="text-[10px] font-medium text-gray-900 uppercase tracking-wider">
                            🔧 {toolName}
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="text-[10px] text-gray-600 mb-2">Input:</div>
                          <pre className="text-[10px] font-mono text-gray-800 mb-3 overflow-x-auto">
                            {JSON.stringify(tool.input, null, 2)}
                          </pre>
                          {tool.state === 'output-available' && (
                            <>
                              <div className="text-[10px] text-gray-600 mb-2">Output:</div>
                              <pre className="text-[10px] font-mono text-gray-800 overflow-x-auto max-h-32">
                                {JSON.stringify(tool.output, null, 2)}
                              </pre>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Message Content */}
                  {text && (
                    <div className="border border-gray-900 p-4 bg-white">
                      <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                        {text}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {isStreaming && (
              <div className="border border-gray-900 p-4 bg-white flex items-center gap-3">
                <div className="w-2 h-2 bg-gray-900 animate-pulse" />
                <div className="text-sm text-gray-600">Generating response...</div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-900 px-6 py-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <textarea
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Type your message... (Cmd/Ctrl+Enter to send)"
              className="w-full border border-gray-900 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none resize-none"
              rows={4}
            />
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[10px] text-gray-500">
                Cmd/Ctrl+Enter to send · Shift+Enter for new line
              </div>
              <button
                onClick={onSend}
                disabled={!input.trim() || isStreaming}
                className="border border-gray-900 px-6 py-2 text-xs font-medium bg-gray-900 text-white disabled:opacity-50"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel (Conditional) */}
      {showSettings && (
        <div className="w-80 border-l border-gray-900 bg-gray-50 flex flex-col">
          <div className="border-b border-gray-900 px-4 py-3 bg-white">
            <div className="text-xs font-medium text-gray-900">Settings & Context</div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Model Settings */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Model Configuration
              </div>
              <div className="border border-gray-900 p-3 bg-white space-y-2">
                <label className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-700">Temperature</span>
                  <input type="range" min="0" max="2" step="0.1" defaultValue="0.7" className="w-24" />
                </label>
                <label className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-700">Max Tokens</span>
                  <input type="number" defaultValue="2048" className="w-20 border border-gray-400 px-2 py-0.5 text-[10px]" />
                </label>
                <label className="flex items-center gap-2 text-[11px]">
                  <input type="checkbox" defaultChecked />
                  <span className="text-gray-700">Enable Thinking</span>
                </label>
              </div>
            </div>

            {/* Context Sources */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Active Context
              </div>
              <div className="border border-gray-900 p-3 bg-white space-y-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600" />
                  <div className="text-gray-700">3 flights loaded</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-600" />
                  <div className="text-gray-700">Weather data current</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-yellow-600" />
                  <div className="text-gray-700">2 airports tracked</div>
                </div>
              </div>
            </div>

            {/* Available Tools */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                Available Tools
              </div>
              <div className="border border-gray-900 bg-white divide-y divide-gray-300">
                {['get_airport_weather', 'get_user_flights', 'get_airport_capabilities'].map((tool) => (
                  <div key={tool} className="px-3 py-2">
                    <div className="text-[10px] font-mono text-gray-900">{tool}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
