"use client";

import React from "react";
import { FileText, Database } from "lucide-react";

type SourceCardProps = {
  title: string;
  type?: "database" | "document" | string;
  metadata?: string;
  url?: string;
};

export function SourceCard({ title, type, metadata, url }: SourceCardProps) {
  return (
    <a
      href={url || "#"}
      className="group flex items-start gap-3 p-3 bg-white border border-zinc-200 rounded-md hover:border-[#F04E30] hover:shadow-sm transition-all cursor-pointer min-w-[200px] max-w-[240px] text-left no-underline"
    >
      <div className="mt-0.5 p-1.5 bg-zinc-50 rounded-sm border border-zinc-100 text-zinc-500 group-hover:text-[#F04E30] transition-colors shrink-0">
        {type === "database" ? <Database size={14} /> : <FileText size={14} />}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-xs font-semibold text-zinc-800 truncate pr-2 group-hover:text-zinc-900 transition-colors">
          {title}
        </span>
        <span className="text-[10px] text-zinc-400 font-mono mt-1 truncate">
          {metadata}
        </span>
      </div>
    </a>
  );
}
