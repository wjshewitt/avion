'use client';

import { Send } from 'lucide-react';
import { type CSSProperties, KeyboardEvent } from 'react';

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

  const palette = material === 'ceramic'
    ? {
        background: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text-primary)',
        placeholder: 'var(--color-text-muted)',
        buttonBg: 'var(--color-surface-subtle)',
        buttonBorder: 'var(--color-border)',
        icon: 'var(--color-text-primary)',
      }
    : {
        background: 'var(--color-surface)',
        border: 'var(--color-border)',
        text: 'var(--color-text-primary)',
        placeholder: 'var(--color-text-muted)',
        buttonBg: 'var(--color-surface-subtle)',
        buttonBorder: 'var(--color-border)',
        icon: 'var(--color-text-primary)',
      };

  const sharedShadow = 'inset 1px 1px 3px rgba(0,0,0,0.12), inset -1px -1px 4px rgba(255,255,255,0.04)';

  const containerStyle: CSSProperties = {
    backgroundColor: palette.background,
    borderColor: palette.border,
    boxShadow: sharedShadow,
  };

  const inputStyle: CSSProperties & { ['--placeholder-color']?: string } = {
    fontFamily:
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    color: palette.text,
    '--placeholder-color': palette.placeholder,
  };

  const buttonStyle: CSSProperties = {
    backgroundColor: palette.buttonBg,
    borderLeft: `1px solid ${palette.buttonBorder}`,
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
  };

  const buttonDisabled = !value.trim() || disabled;

  return (
    <div
      className="flex w-full items-center rounded-md border transition-all duration-200 focus-within:border-[#F04E30] focus-within:shadow-[0_0_0_3px_rgba(240,78,48,0.12)]"
      style={containerStyle}
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          flex-1 h-11 bg-transparent border-0 px-4 text-[13px] font-mono
          focus:outline-none focus:ring-0
          transition-all duration-200 placeholder:text-[color:var(--placeholder-color)]
          disabled:opacity-40 disabled:cursor-not-allowed
        `}
        style={inputStyle}
      />
      <button
        onClick={onSend}
        disabled={buttonDisabled}
        style={buttonStyle}
        className={`
          mr-1 my-1 w-10 h-9 flex items-center justify-center rounded-[6px]
          transition-all duration-200
          ${buttonDisabled
            ? 'opacity-40 cursor-not-allowed'
            : 'hover:brightness-125 active:scale-95'}
        `}
        aria-label="Send message"
      >
        <Send size={16} strokeWidth={1.4} className="text-current" color={palette.icon} />
      </button>
    </div>
  );
}
