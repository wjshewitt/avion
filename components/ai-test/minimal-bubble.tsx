import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface MinimalBubbleProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function MinimalBubble({ messages, input, onInputChange, onSend, isStreaming }: MinimalBubbleProps) {
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-900 px-6 py-4 bg-white">
        <div className="text-sm font-medium text-gray-900">Aviation Assistant</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => {
            const text = getMessageText(message);
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`border border-gray-900 px-4 py-3 text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gray-900 text-white'
                      : 'bg-white text-gray-900'
                  }`}
                  style={{ maxWidth: '70%' }}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <div className="flex justify-start">
              <div className="border border-gray-900 px-4 py-3 text-sm bg-white text-gray-500">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-900 px-6 py-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSend()}
              placeholder="Ask about flights, weather, or airports..."
              className="flex-1 border border-gray-900 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-700"
            />
            <button
              onClick={onSend}
              disabled={!input.trim() || isStreaming}
              className="border border-gray-900 px-6 py-3 text-sm font-medium bg-gray-900 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
