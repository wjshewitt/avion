'use client';

import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface ConversationalPanelProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function ConversationalPanel({
  messages,
  input,
  onInputChange,
  onSend,
  isStreaming,
}: ConversationalPanelProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-gray-900">Conversational Interface</div>
            <div className="text-[10px] text-gray-600 mt-1">
              Using AI Elements Components · Dieter Rams Aesthetic
            </div>
          </div>
          <div className="text-[10px] text-gray-600">
            Vertex AI · gemini-2.5-flash · Thinking Mode
          </div>
        </div>
      </div>

      {/* Messages - AI Elements Style */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => {
            const text = getMessageText(message);
            const isUser = message.role === 'user';
            const timestamp = message.createdAt
              ? message.createdAt.toLocaleString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';
            const reasoning = message.parts.find((part) => part.type === 'reasoning');
            const tools = message.parts.filter(
              (part) => typeof part.type === 'string' && part.type.startsWith('tool-')
            );

            return (
              <div key={message.id} className="space-y-3">
                {/* Message Header */}
                <div className="flex items-baseline gap-3">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">
                    {isUser ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-[10px] text-gray-400">{timestamp}</div>
                </div>

                {/* Reasoning Block */}
                {reasoning && 'text' in reasoning && (
                  <div className="border-l-2 border-gray-900 pl-4 py-2">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                      Reasoning Process
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed font-mono">
                      {reasoning.text}
                    </div>
                  </div>
                )}

                {/* Tool Calls */}
                {tools.map((tool: any, idx) => {
                  const toolName = tool.type.replace('tool-', '');
                  const isLoading = tool.state === 'input-available' || tool.state === 'input-streaming';

                  return (
                    <div key={idx} className="border border-gray-900 p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] uppercase tracking-wider text-gray-600 font-medium">
                          Tool: {toolName}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {isLoading ? 'Loading...' : 'Completed'}
                        </div>
                      </div>
                      <div className="text-[10px] font-mono text-gray-700">
                        Input: {JSON.stringify(tool.input)}
                      </div>
                    </div>
                  );
                })}

                {/* Main Content */}
                {text && (
                  <div className={`${isUser ? 'border border-gray-900 bg-gray-900 text-white p-4' : ''}`}>
                    <div className="text-sm text-gray-900 leading-relaxed">
                      {isUser ? (
                        <div className="text-white">{text}</div>
                      ) : (
                        <div className="text-gray-900">{text}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {isStreaming && (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-2 h-2 border border-gray-900 animate-pulse" />
              <div className="text-xs">Generating response...</div>
            </div>
          )}
        </div>
      </div>

      {/* Input - AI Elements Prompt Style */}
      <div className="border-t border-gray-900 px-6 py-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    onSend();
                  }
                }}
                placeholder="Ask about flights, weather, or airports... (Shift+Enter for new line)"
                className="w-full border border-gray-900 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 outline-none resize-none"
                rows={3}
              />
            </div>
            <button
              onClick={onSend}
              disabled={!input.trim() || isStreaming}
              className="border border-gray-900 px-6 py-3 text-sm font-medium bg-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              Send
            </button>
          </div>
          <div className="mt-2 text-[10px] text-gray-500">
            Enter to send · Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
