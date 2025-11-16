"use client";

import { Settings, Sliders, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AISettingsDropdownProps {
  isOpen: boolean;
  onOpenSettings: () => void;
}

export function AISettingsDropdown({ isOpen, onOpenSettings }: AISettingsDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="absolute z-[100] right-0 top-full mt-2"
        >
          <div
            className="w-64 rounded-sm border border-border bg-card shadow-[0_8px_24px_rgba(0,0,0,0.18)] overflow-hidden"
            role="menu"
          >
            {/* Header */}
            <div className="px-3 py-2.5 flex items-center gap-3 bg-muted/40">
              <div className="w-7 h-7 rounded-sm border border-border flex items-center justify-center text-[11px] text-[color:var(--accent-primary)]">
                <Sparkles size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-foreground truncate">AI Co-Pilot</div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground truncate">
                  Gemini 2.5 · Flash
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="border-t border-border/80 py-1 bg-card">
              <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                role="menuitem"
              >
                <Settings size={14} className="text-muted-foreground" />
                <span>Open AI Settings</span>
              </button>
              <button
                onClick={onOpenSettings}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
                role="menuitem"
              >
                <Sliders size={14} className="text-muted-foreground" />
                <span>Model & Preferences</span>
              </button>
            </div>

            {/* Footer microcopy */}
            <div className="border-t border-border/80 px-3 py-1.5 bg-card">
              <p className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                <span>AI</span>
                <span>⌘J Toggle</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
