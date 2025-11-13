import { FlightChatMessage, getMessageText } from '@/lib/chat/messages';

interface TerminalChatProps {
  messages: FlightChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isStreaming: boolean;
}

export function TerminalChat({ messages, input, onInputChange, onSend, isStreaming }: TerminalChatProps) {
  return (
    <div className="h-full bg-black text-green-400 font-mono flex flex-col">
      {/* Terminal Header */}
      <div className="border-b border-green-900 px-4 py-2 bg-black">
        <div className="text-xs">AVION TERMINAL v1.0.0 — Connected to Vertex AI</div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => {
          const text = getMessageText(message);
          const timestamp = message.createdAt
            ? message.createdAt.toLocaleTimeString('en-US', { hour12: false })
            : '';

          return (
            <div key={message.id} className="space-y-1">
              {/* Timestamp + Role */}
              <div className="text-[10px] text-green-600">
                [{timestamp}] {message.role === 'user' ? 'USER' : 'ASSISTANT'}
              </div>
              
              {/* Message Content */}
              <div className="pl-4">
                {message.role === 'user' ? (
                  <div className="text-white">
                    <span className="text-green-400">&gt;</span> {text}
                  </div>
                ) : (
                  <div className="text-green-400 whitespace-pre-wrap">{text}</div>
                )}
              </div>

              {/* Tool Calls */}
              {message.parts
                .filter((part) => typeof part.type === 'string' && part.type.startsWith('tool-'))
                .map((part: any, idx) => {
                  const toolName = part.type.replace('tool-', '');
                  return (
                    <div key={idx} className="pl-4 text-[11px] text-green-600">
                      [TOOL] {toolName}({JSON.stringify(part.input)})
                      {part.state === 'output-available' && ' → OK'}
                      {part.state === 'input-available' && ' → LOADING...'}
                    </div>
                  );
                })}
            </div>
          );
        })}

        {isStreaming && (
          <div className="text-green-600 animate-pulse text-xs">
            [STREAMING] Generating response...
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-green-900 px-4 py-3 bg-black">
        <div className="flex items-center gap-2">
          <span className="text-green-400">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Enter command..."
            className="flex-1 bg-transparent text-white outline-none font-mono text-sm placeholder:text-green-900"
          />
          {isStreaming && (
            <span className="text-[10px] text-green-600">ESC to stop</span>
          )}
        </div>
      </div>
    </div>
  );
}
