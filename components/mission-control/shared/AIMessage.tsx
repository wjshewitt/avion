'use client';

interface AIMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
  material?: 'ceramic' | 'tungsten';
  showTimestamp?: boolean;
}

export function AIMessage({
  content,
  isUser,
  timestamp,
  material = 'tungsten',
  showTimestamp = false,
}: AIMessageProps) {
  if (isUser) {
    const bgColor = material === 'ceramic' ? 'bg-white' : 'bg-[#2A2A2A]';
    const textColor = material === 'ceramic' ? 'text-zinc-900' : 'text-zinc-200';
    const borderColor = material === 'ceramic' ? 'border-zinc-200' : 'border-[#333]';

    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%]">
          <div className={`${bgColor} ${borderColor} border rounded-sm p-3 shadow-sm`}>
            <p className={`text-sm ${textColor}`}>{content}</p>
          </div>
          {showTimestamp && timestamp && (
            <div className="text-[10px] font-mono text-zinc-400 mt-1 text-right">
              {timestamp}
            </div>
          )}
        </div>
      </div>
    );
  }

  // AI Message
  const bgColor = material === 'ceramic' ? 'bg-white' : 'bg-[#2A2A2A]';
  const textColor = material === 'ceramic' ? 'text-zinc-900' : 'text-zinc-200';
  const borderColor = material === 'ceramic' ? 'border-zinc-200' : 'border-[#333]';

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
          Avion AI
        </span>
        <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#2563eb] text-white rounded-sm">
          v1.5
        </span>
      </div>
      <div className={`${bgColor} ${borderColor} border border-l-2 border-l-[#2563eb] rounded-sm p-3`}>
        <p className={`text-sm ${textColor} leading-relaxed`}>{content}</p>
      </div>
      {showTimestamp && timestamp && (
        <div className="text-[10px] font-mono text-zinc-400 mt-1">
          {timestamp}
        </div>
      )}
    </div>
  );
}
