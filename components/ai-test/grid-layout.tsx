import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface GridLayoutProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

const mockConversations = [
  { id: '1', title: 'Weather Briefing - KJFK', count: 8, active: true },
  { id: '2', title: 'Flight Planning AAL123', count: 12, active: false },
  { id: '3', title: 'Airport Capabilities', count: 5, active: false },
  { id: '4', title: 'Route Analysis', count: 15, active: false },
];

export function GridLayout({ messages, input, onInputChange, onSend, isStreaming }: GridLayoutProps) {
  return (
    <div className="h-full grid grid-cols-[280px_1fr_320px]">
      {/* Left: Conversations List */}
      <div className="border-r border-gray-900 bg-gray-50 flex flex-col">
        <div className="border-b border-gray-900 px-4 py-3 bg-white">
          <div className="text-xs font-medium text-gray-900">Conversations</div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {mockConversations.map((conv) => (
            <div
              key={conv.id}
              className={`border-b border-gray-900 px-4 py-3 ${
                conv.active ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-gray-900 bg-gray-100 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-medium text-gray-900 truncate">
                    {conv.title}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {conv.count} messages
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-900 p-4 bg-white">
          <button className="w-full border border-gray-900 px-4 py-2 text-xs font-medium text-gray-900 hover:bg-gray-50">
            New Conversation
          </button>
        </div>
      </div>

      {/* Center: Active Chat */}
      <div className="flex flex-col bg-white">
        <div className="border-b border-gray-900 px-6 py-3">
          <div className="text-xs font-medium text-gray-900">Weather Briefing - KJFK</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {messages.length} messages · Vertex AI
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((message) => {
            const text = getMessageText(message);
            const isUser = message.role === 'user';

            return (
              <div key={message.id} className="space-y-2">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                  {isUser ? 'You' : 'Assistant'}
                </div>
                <div className="text-xs text-gray-900 leading-relaxed">
                  {text}
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <div className="space-y-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                Assistant
              </div>
              <div className="text-xs text-gray-500">Generating response...</div>
            </div>
          )}
        </div>

        <div className="border-t border-gray-900 px-6 py-4">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Type message"
            className="w-full border border-gray-900 px-4 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none"
          />
        </div>
      </div>

      {/* Right: Info Panel */}
      <div className="border-l border-gray-900 bg-gray-50 flex flex-col">
        <div className="border-b border-gray-900 px-4 py-3 bg-white">
          <div className="text-xs font-medium text-gray-900">Information</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              Model
            </div>
            <div className="border border-gray-900 p-3 bg-white">
              <div className="text-[11px] text-gray-900 font-medium">
                gemini-2.5-flash
              </div>
              <div className="text-[10px] text-gray-500 mt-1">Vertex AI</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              Context
            </div>
            <div className="border border-gray-900 p-3 bg-white space-y-2">
              <div className="text-[11px] text-gray-900">3 active flights</div>
              <div className="text-[11px] text-gray-900">2 airports tracked</div>
              <div className="text-[11px] text-gray-900">Weather data current</div>
            </div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              Tools Used
            </div>
            <div className="border border-gray-900 p-3 bg-white space-y-1">
              <div className="text-[10px] text-gray-700">get_airport_weather</div>
              <div className="text-[10px] text-gray-700">get_user_flights</div>
              <div className="text-[10px] text-gray-700">get_airport_capabilities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
