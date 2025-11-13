import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface HorizontalTimelineProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function HorizontalTimeline({
  messages,
  input,
  onInputChange,
  onSend,
  isStreaming,
}: HorizontalTimelineProps) {
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-4">
        <div className="text-sm font-medium text-gray-900">Conversation Timeline</div>
        <div className="text-[10px] text-gray-500 mt-1">
          {messages.length} exchanges · Scroll horizontally
        </div>
      </div>

      {/* Horizontal Timeline */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="h-full flex items-center px-6 py-8 gap-0">
          {messages.map((message, index) => {
            const text = getMessageText(message);
            const isUser = message.role === 'user';
            const timestamp = message.createdAt
              ? message.createdAt.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div key={message.id} className="flex items-center">
                {/* Message Card */}
                <div className="flex-shrink-0" style={{ width: '320px' }}>
                  <div className="h-full flex flex-col">
                    <div className="border border-gray-900 bg-gray-50 p-4 h-64 flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500">
                          {isUser ? 'User' : 'Assistant'}
                        </div>
                        <div className="text-[10px] text-gray-400">{timestamp}</div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 overflow-y-auto text-xs text-gray-900 leading-relaxed">
                        {text}
                      </div>

                      {/* Tool Indicators */}
                      {message.parts.filter(
                        (part) => typeof part.type === 'string' && part.type.startsWith('tool-')
                      ).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <div className="text-[10px] text-gray-500">
                            {message.parts
                              .filter(
                                (part) => typeof part.type === 'string' && part.type.startsWith('tool-')
                              )
                              .map((part: any) => part.type.replace('tool-', ''))
                              .join(', ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Number */}
                    <div className="text-center mt-2 text-[10px] text-gray-400">
                      {index + 1}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < messages.length - 1 && (
                  <div className="flex-shrink-0 h-px bg-gray-900" style={{ width: '40px' }} />
                )}
              </div>
            );
          })}

          {/* Input Card */}
          <div className="flex items-center">
            {messages.length > 0 && (
              <div className="flex-shrink-0 h-px bg-gray-900" style={{ width: '40px' }} />
            )}
            <div className="flex-shrink-0" style={{ width: '320px' }}>
              <div className="border border-gray-900 bg-white p-4 h-64 flex flex-col">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
                  New Message
                </div>
                <textarea
                  value={input}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 resize-none text-xs text-gray-900 placeholder:text-gray-400 outline-none"
                />
                <button
                  onClick={onSend}
                  disabled={!input.trim() || isStreaming}
                  className="mt-3 border border-gray-900 px-4 py-2 text-xs font-medium bg-gray-900 text-white disabled:opacity-50"
                >
                  {isStreaming ? 'Sending...' : 'Send'}
                </button>
              </div>
              <div className="text-center mt-2 text-[10px] text-gray-400">
                {messages.length + 1}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-900 px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <div>Use arrow keys or scroll to navigate</div>
          <div>Vertex AI · gemini-2.5-flash</div>
        </div>
      </div>
    </div>
  );
}
