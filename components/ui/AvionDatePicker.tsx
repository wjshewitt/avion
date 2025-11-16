"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format, parseISO } from "date-fns";

interface AvionDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function AvionDatePicker({ value, onChange, placeholder = "Select date" }: AvionDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(
    value ? parseISO(value) : undefined,
  );
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!value) {
      setSelected(undefined);
      return;
    }
    try {
      setSelected(parseISO(value));
    } catch {
      setSelected(undefined);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const displayValue = selected ? format(selected, "yyyy-MM-dd") : "";

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const iso = format(date, "yyyy-MM-dd");
    onChange(iso);
    setSelected(date);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full groove-input p-3 rounded-md flex items-center justify-between text-xs font-mono text-zinc-900 dark:text-zinc-50"
      >
        <span className={displayValue ? "" : "text-zinc-400 dark:text-zinc-500"}>
          {displayValue || placeholder}
        </span>
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          CAL
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-40 w-[min(360px,calc(100vw-4rem))]">
          <div className="rounded-sm border border-zinc-700 bg-[#1a1a1a] shadow-lg groove">
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={handleSelect}
              showOutsideDays
              fixedWeeks
              captionLayout="dropdown"
              fromYear={2010}
              toYear={2035}
              numberOfMonths={1}
              className="rdp-root text-xs font-mono"
              classNames={{
                caption: "px-3 pt-3 pb-2 border-b border-zinc-800 flex items-center justify-between",
                months: "p-3",
                month: "",
                head_row: "text-[10px] text-zinc-500",
                day: "h-7 w-7 rounded-[2px] border border-transparent hover:border-zinc-600",
                selected: "bg-[#F04E30] text-white border-[#F04E30]",
                today: "border-zinc-500 text-zinc-50",
                nav_button:
                  "h-6 w-6 rounded-sm border border-zinc-700 text-zinc-300 hover:bg-zinc-800 flex items-center justify-center",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
