"use client";

import React from "react";
import { Cpu, Link } from "lucide-react";
import { SourceCard } from "./SourceCard";

type Source = {
  title: string;
  type?: "database" | "document" | string;
  metadata?: string;
  url?: string;
};

type AIMessageProps = {
  content: React.ReactNode;
  sources?: Source[];
  isTyping?: boolean;
};

export function AIMessage({ content, sources, isTyping }: AIMessageProps) {
  return (
    <div className="flex gap-4 mb-8 w-full max-w-3xl">
      {/* Avatar */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white shadow-sm mt-1">
        <Cpu size={16} />
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-zinc-900">Avion Intelligence</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-500 font-mono border border-zinc-200">
            v2.4
          </span>
        </div>

        {/* Text */}
        <div className="text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
          {content}
          {isTyping && (
            <span className="inline-block w-1.5 h-4 bg-[#F04E30] ml-1 align-middle animate-pulse" />
          )}
        </div>

        {/* Sources Section */}
        {sources && sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-zinc-100">
            <div className="flex items-center gap-2 mb-2">
              <Link size={12} className="text-zinc-400" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Verified Sources
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {sources.map((src, idx) => (
                <SourceCard
                  key={idx}
                  title={src.title}
                  type={src.type}
                  metadata={src.metadata}
                  url={src.url}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
