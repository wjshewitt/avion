import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface SplitPanelProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function SplitPanel({ messages, input, onInputChange, onSend, isStreaming }: SplitPanelProps) {
  return (
    <div className="h-full flex">
      {/* Document Area - 60% */}
      <div className="w-[60%] bg-white border-r border-gray-900 p-8">
        <div className="max-w-3xl">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-4">
            Context Document
          </div>
          <div className="space-y-6">
            <div>
              <div className="text-xs font-medium text-gray-900 mb-2">Current Flight Operations</div>
              <div className="border border-gray-900 p-4 space-y-2 text-[11px] text-gray-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>Flight: AAL123</div>
                  <div>Aircraft: B77W</div>
                  <div>Origin: KJFK</div>
                  <div>Destination: EGLL</div>
                  <div>ETD: 14:30 UTC</div>
                  <div>Status: Scheduled</div>
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-900 mb-2">Weather Summary</div>
              <div className="border border-gray-900 p-4 text-[11px] text-gray-700 font-mono">
                KJFK 131251Z 27012KT 10SM FEW250 08/M03 A3012
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-900 mb-2">Airport Information</div>
              <div className="border border-gray-900 p-4 space-y-1 text-[11px] text-gray-700">
                <div>EGLL - London Heathrow Airport</div>
                <div>Elevation: 83 ft MSL</div>
                <div>Runways: 09L/27R (3902m), 09R/27L (3660m)</div>
                <div>Navigation: ILS, VOR, DME, NDB</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Panel - 40% */}
      <div className="w-[40%] flex flex-col bg-gray-50">
        {/* Chat Header */}
        <div className="border-b border-gray-900 px-4 py-3 bg-white">
          <div className="text-xs font-medium text-gray-900">AI Assistant</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Vertex AI · gemini-2.5-flash
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((message) => {
            const text = getMessageText(message);
            const isUser = message.role === 'user';

            return (
              <div key={message.id} className={isUser ? 'flex justify-end' : ''}>
                <div
                  className={`border border-gray-900 p-3 text-[11px] leading-relaxed ${
                    isUser ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                  }`}
                  style={{ maxWidth: '85%' }}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {isStreaming && (
            <div className="border border-gray-900 p-3 text-[11px] text-gray-500 bg-white">
              Generating...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-900 p-4 bg-white">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Type message"
            className="w-full border border-gray-900 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-700"
          />
        </div>
      </div>
    </div>
  );
}
