import type { Flight } from '@/lib/supabase/types';

interface StatusLEDProps {
  status: Flight['status'];
}

export function StatusLED({ status }: StatusLEDProps) {
  const config = {
    'On Time': {
      color: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/50',
      text: 'text-emerald-500',
    },
    Delayed: {
      color: 'bg-amber-500',
      shadow: 'shadow-amber-500/50',
      text: 'text-amber-500',
    },
    Cancelled: {
      color: 'bg-[#F04E30]',
      shadow: 'shadow-[#F04E30]/50',
      text: 'text-[#F04E30]',
    },
  };

  const { color, shadow, text } = config[status];

  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 rounded-full ${color} shadow-lg ${shadow}`} />
      <span className={`text-[11px] font-mono uppercase tracking-wider ${text}`}>
        {status}
      </span>
    </div>
  );
}
