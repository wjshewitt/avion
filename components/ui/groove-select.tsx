'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface GrooveSelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  variant?: 'ceramic' | 'tungsten';
}

export function GrooveSelect<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  className,
  'aria-label': ariaLabel,
  variant = 'ceramic',
}: GrooveSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const enabledOptions = options.filter((opt) => !opt.disabled);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen && focusedIndex >= 0) {
          const option = enabledOptions[focusedIndex];
          if (option && !option.disabled) {
            onChange(option.value);
            setIsOpen(false);
            setFocusedIndex(-1);
            triggerRef.current?.focus();
          }
        } else {
          setIsOpen(!isOpen);
        }
        break;

      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        triggerRef.current?.focus();
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          setFocusedIndex((prev) => (prev < enabledOptions.length - 1 ? prev + 1 : prev));
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(enabledOptions.length - 1);
        } else {
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        }
        break;

      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setFocusedIndex(-1);
        }
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[focusedIndex] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn('relative', className)} onKeyDown={handleKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full px-4 py-2.5 text-sm text-left',
          'flex items-center justify-between',
          'transition-all duration-200 ease-out',
          'focus:outline-none',
          // Tungsten variant (always dark)
          variant === 'tungsten' && [
            'bg-[#2A2A2A] text-zinc-200',
            'border border-[#333]',
            'shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]',
            !disabled && 'hover:bg-[#323232]',
            'focus:bg-[#323232] focus:border-[#3a3a3a]',
            'focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_0_2px_rgba(240,78,48,0.2)]',
            isOpen && 'bg-[#323232] border-[#3a3a3a]',
            isOpen && 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_0_2px_rgba(240,78,48,0.2)]',
          ],
          // Ceramic variant (adapts to theme)
          variant === 'ceramic' && [
            'bg-[#F4F4F4] text-zinc-900',
            'border border-zinc-200',
            'shadow-[inset_0_1px_3px_rgba(0,0,0,0.06)]',
            'dark:bg-[#2A2A2A] dark:text-zinc-200',
            'dark:border-[#333]',
            'dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.3)]',
            !disabled && 'hover:bg-white dark:hover:bg-[#323232]',
            'focus:bg-white focus:border-zinc-300',
            'focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_0_0_2px_rgba(240,78,48,0.1)]',
            'dark:focus:bg-[#323232] dark:focus:border-[#3a3a3a]',
            'dark:focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_0_2px_rgba(240,78,48,0.2)]',
            isOpen && 'bg-white dark:bg-[#323232]',
            isOpen && 'border-zinc-300 dark:border-[#3a3a3a]',
            isOpen && 'shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_0_0_2px_rgba(240,78,48,0.1)]',
            isOpen && 'dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2),0_0_0_2px_rgba(240,78,48,0.2)]',
          ],
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            !selectedOption &&
              (variant === 'tungsten' ? 'text-zinc-500' : 'text-zinc-400 dark:text-zinc-500')
          )}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            variant === 'tungsten' ? 'text-zinc-500' : 'text-zinc-400 dark:text-zinc-500',
            isOpen && 'rotate-180'
          )}
          strokeWidth={1.5}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute left-0 right-0 z-50 mt-1',
            'max-h-64 overflow-y-auto',
            'animate-in fade-in-0 slide-in-from-top-1 duration-150',
            variant === 'tungsten' && [
              'bg-[#2A2A2A] border border-[#333]',
              'shadow-lg shadow-black/50',
            ],
            variant === 'ceramic' && [
              'bg-white border border-zinc-300',
              'shadow-lg',
              'dark:bg-[#2A2A2A] dark:border-[#333]',
              'dark:shadow-lg dark:shadow-black/50',
            ]
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isFocused = enabledOptions.indexOf(option) === focusedIndex;

            return (
              <button
                key={String(option.value)}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={option.disabled}
                onClick={() => handleSelect(option)}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm',
                  'transition-colors duration-150',
                  variant === 'tungsten' && [
                    'bg-[#2A2A2A] text-zinc-200',
                    index !== options.length - 1 && 'border-b border-[#333]',
                    !option.disabled && 'hover:bg-[#323232]',
                    option.disabled && 'text-zinc-600',
                    isSelected && 'bg-[#323232] font-medium',
                    isFocused && !option.disabled && 'bg-[#323232]',
                  ],
                  variant === 'ceramic' && [
                    'bg-white text-zinc-900',
                    'dark:bg-[#2A2A2A] dark:text-zinc-200',
                    index !== options.length - 1 && 'border-b border-zinc-200 dark:border-[#333]',
                    !option.disabled && 'hover:bg-zinc-50 dark:hover:bg-[#323232]',
                    option.disabled && 'text-zinc-400 dark:text-zinc-600',
                    isSelected && 'bg-zinc-100 dark:bg-[#323232] font-medium',
                    isFocused && !option.disabled && 'bg-zinc-100 dark:bg-[#323232]',
                  ],
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
