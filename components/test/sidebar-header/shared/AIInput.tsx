'use client';

import { Send } from 'lucide-react';
import { KeyboardEvent } from 'react';

interface AIInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  material?: 'ceramic' | 'tungsten';
  placeholder?: string;
  disabled?: boolean;
}

export function AIInput({
  value,
  onChange,
  onSend,
  material = 'tungsten',
  placeholder = 'Ask about operations...',
  disabled = false,
}: AIInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onSend();
    }
  };

  const inputClasses =
    material === 'ceramic'
      ? 'bg-[#e8e8e8] text-zinc-900 border-zinc-300 placeholder:text-zinc-400 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.7)]'
      : 'bg-[#1A1A1A] text-white border-[#333] placeholder:text-zinc-500 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3)]';

  const buttonDisabled = !value.trim() || disabled;

  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          flex-1 h-10 px-4 text-sm font-inter
          border rounded-sm
          focus:outline-none focus:ring-1 focus:ring-[#F04E30]/30
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${inputClasses}
        `}
      />
      <button
        onClick={onSend}
        disabled={buttonDisabled}
        className={`
          w-10 h-10 flex items-center justify-center rounded-sm
          transition-all
          ${
            buttonDisabled
              ? 'bg-zinc-400 cursor-not-allowed'
              : 'bg-[#F04E30] hover:bg-[#d33f24]'
          }
        `}
      >
        <Send size={16} className="text-white" strokeWidth={1.5} />
      </button>
    </div>
  );
}
