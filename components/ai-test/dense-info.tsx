import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface DenseInfoProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function DenseInfo({ messages, input, onInputChange, onSend, isStreaming }: DenseInfoProps) {
  return (
    <div className="h-full flex flex-col bg-white text-[11px]">
      {/* Compact Header */}
      <div className="border-b border-gray-400 px-4 py-1.5 bg-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-medium text-gray-900">AI Assistant</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">Vertex AI</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">gemini-2.5-flash</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-600">Thinking: ON</span>
          </div>
          <div className="text-gray-500 text-[10px]">
            {messages.length} msg · {isStreaming ? 'Generating...' : 'Ready'}
          </div>
        </div>
      </div>

      {/* Dense Messages */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-50 border-b border-gray-400 text-[10px]">
            <tr>
              <th className="text-left px-3 py-1 font-medium text-gray-600 w-16">Time</th>
              <th className="text-left px-3 py-1 font-medium text-gray-600 w-20">Role</th>
              <th className="text-left px-3 py-1 font-medium text-gray-600">Content</th>
              <th className="text-left px-3 py-1 font-medium text-gray-600 w-32">Tools</th>
              <th className="text-left px-3 py-1 font-medium text-gray-600 w-24">Meta</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {messages.map((message, index) => {
              const text = getMessageText(message);
              const timestamp = message.createdAt
                ? message.createdAt.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '';
              const tools = message.parts
                .filter((part) => typeof part.type === 'string' && part.type.startsWith('tool-'))
                .map((part: any) => part.type.replace('tool-', ''));
              const hasReasoning = message.parts.some((part) => part.type === 'reasoning');

              return (
                <tr
                  key={message.id}
                  className={`border-b border-gray-300 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-3 py-1.5 text-gray-500 font-mono text-[10px]">
                    {timestamp}
                  </td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-medium ${
                        message.role === 'user'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-300 text-gray-900'
                      }`}
                    >
                      {message.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 py-1.5 text-gray-900 leading-tight max-w-md">
                    <div className="line-clamp-2">{text}</div>
                  </td>
                  <td className="px-3 py-1.5 text-gray-600 text-[10px]">
                    {tools.length > 0 ? tools.join(', ') : '—'}
                  </td>
                  <td className="px-3 py-1.5 text-gray-500 text-[10px]">
                    {hasReasoning && <span className="mr-1">💭</span>}
                    {tools.length > 0 && <span>🔧</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {isStreaming && (
          <div className="border-t border-gray-400 px-4 py-2 bg-yellow-50 text-gray-700">
            ⚡ Streaming response...
          </div>
        )}
      </div>

      {/* Compact Input */}
      <div className="border-t border-gray-400 p-2 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Enter message (Enter to send)"
            className="flex-1 border border-gray-400 px-2 py-1 text-[11px] text-gray-900 placeholder:text-gray-500 outline-none"
            style={{ lineHeight: '1.2' }}
          />
          <button
            onClick={onSend}
            disabled={!input.trim() || isStreaming}
            className="border border-gray-400 px-3 py-1 text-[10px] font-medium bg-gray-900 text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-400 px-4 py-1 bg-gray-900 text-white text-[9px] flex items-center justify-between">
        <div>STATUS: {isStreaming ? 'ACTIVE' : 'IDLE'}</div>
        <div>TOKEN USAGE: ~{messages.length * 150}</div>
        <div>LATENCY: ~250ms</div>
        <div>TOOLS: 3 available</div>
      </div>
    </div>
  );
}
