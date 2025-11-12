'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  'aria-label'?: string;
}

export function Select<T = string>({
  value,
  onChange,
  options,
  placeholder = 'Select...',
  disabled = false,
  size = 'default',
  className,
  'aria-label': ariaLabel,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'h-8 px-3 py-2 text-sm gap-1.5',
    default: 'h-9 px-4 py-2 text-sm gap-2',
    lg: 'h-10 px-6 py-2 text-base gap-2',
  };

  const itemSizeClasses = {
    sm: 'py-2 px-3 text-sm',
    default: 'py-2.5 px-4 text-sm',
    lg: 'py-3 px-6 text-base',
  };

  const selectedOption = options.find((opt) => opt.value === value);
  const enabledOptions = options.filter(opt => !opt.disabled);

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
          setFocusedIndex((prev) =>
            prev < enabledOptions.length - 1 ? prev + 1 : prev
          );
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
    <div
      ref={containerRef}
      className={cn('relative', className)}
      onKeyDown={handleKeyDown}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          'w-full border border-border text-left',
          'flex items-center justify-between',
          'bg-card text-foreground',
          'transition-all duration-150 ease-out',
          'focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue',
          sizeClasses[size],
          !disabled && 'hover:bg-muted',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'border-blue ring-1 ring-blue'
        )}
      >
        <span className={cn(!selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className={cn(
            'absolute left-0 right-0 z-50',
            'border-l border-r border-b border-blue ring-1 ring-blue bg-card shadow-lg',
            'max-h-64 overflow-auto',
            'animate-in fade-in-0 slide-in-from-top-1 duration-150'
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
                  'w-full text-left bg-card',
                  itemSizeClasses[size],
                  index !== options.length - 1 && 'border-b border-border',
                  !option.disabled && !isSelected && 'hover:bg-gradient-to-r hover:from-blue-100/60 hover:to-transparent dark:hover:from-blue-500/10 dark:hover:to-transparent',
                  !option.disabled && isSelected && 'hover:bg-gradient-to-r hover:from-blue-100/40 hover:to-muted dark:hover:from-blue-500/10 dark:hover:to-muted',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  isSelected && 'bg-muted font-medium',
                  isFocused && !option.disabled && 'bg-muted'
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
