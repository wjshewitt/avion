'use client';

import { LEDStatus } from './LEDStatus';

interface ContextBadgeProps {
  context: string;
  dataPoints?: number;
  material?: 'ceramic' | 'tungsten';
}

export function ContextBadge({ context, dataPoints = 0, material = 'tungsten' }: ContextBadgeProps) {
  const bgColor = material === 'ceramic' ? 'bg-white' : 'bg-[#1A1A1A]';
  const borderColor = material === 'ceramic' ? 'border-zinc-200' : 'border-[#333]';
  const textColor = material === 'ceramic' ? 'text-zinc-900' : 'text-white';

  return (
    <div className={`${bgColor} ${borderColor} border rounded-sm p-3`}>
      <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-2">
        Context
      </div>
      <div className={`text-sm font-medium ${textColor} mb-2`}>
        {context}
      </div>
      <div className="flex items-center gap-2">
        <LEDStatus status={dataPoints > 0 ? 'ready' : 'ready'} size="sm" label="" />
        <span className="text-xs text-zinc-400 font-mono tabular-nums">
          {dataPoints} data {dataPoints === 1 ? 'point' : 'points'}
        </span>
      </div>
    </div>
  );
}
