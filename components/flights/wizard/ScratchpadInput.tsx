"use client";

import { Eraser } from "lucide-react";

interface ScratchpadInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  label?: string;
}

export function ScratchpadInput({
  value,
  onChange,
  placeholder = "Enter notes here...",
  rows = 5,
  label = "Scratchpad",
}: ScratchpadInputProps) {
  return (
    <div className="ceramic p-0 rounded-sm h-full flex flex-col overflow-hidden">
      <div className="bg-[#e0e0e0] dark:bg-zinc-700 p-2 border-b border-zinc-300 dark:border-zinc-600 flex justify-between items-center">
        <span className="text-[10px] font-mono uppercase text-zinc-500 dark:text-zinc-400 ml-2">
          {label}
        </span>
        <Eraser
          size={14}
          className="text-zinc-500 dark:text-zinc-400 hover:text-[#F04E30] dark:hover:text-[#F04E30] cursor-pointer mr-2"
          onClick={() => onChange("")}
        />
      </div>
      <textarea
        className="flex-1 w-full bg-[#f4f4f4] dark:bg-zinc-800 p-4 text-sm font-mono text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none placeholder:text-zinc-500"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        style={{
          backgroundImage:
            "linear-gradient(var(--scratchpad-line-color, #e5e5e5) 1px, transparent 1px)",
          backgroundSize: "100% 24px",
          lineHeight: "24px",
        }}
      />
      <style jsx>{`
        .dark textarea {
          --scratchpad-line-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
}
