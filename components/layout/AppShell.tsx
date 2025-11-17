'use client';

import { useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { AISettingsDropdown } from '@/components/ai-drawer/AISettingsDropdown';
import { FlightBreadcrumb } from '@/components/ui/flight-breadcrumb';
import { useAppStore } from '@/lib/store';

const SidebarFallback = () => (
  <div className="w-14 bg-card border-r border-border" aria-hidden />
);

const HeaderFallback = () => (
  <div className="h-10 border-b border-border bg-card" aria-hidden />
);

const SearchBoxFallback = () => (
  <div
    className="rounded-sm border border-border bg-muted/40"
    style={{ width: 418, height: 40 }}
    aria-hidden
  />
);

const AdaptiveSidebar = dynamic(
  () =>
    import('@/components/mission-control/AdaptiveSidebar').then((mod) => ({
      default: mod.AdaptiveSidebar,
    })),
  { ssr: false, loading: SidebarFallback }
);

const AdaptiveHeader = dynamic(
  () =>
    import('@/components/mission-control/AdaptiveHeader').then((mod) => ({
      default: mod.AdaptiveHeader,
    })),
  { ssr: false, loading: HeaderFallback }
);

const AnimatedSearchBox = dynamic(
  () =>
    import('@/components/mission-control/AnimatedSearchBox').then((mod) => ({
      default: mod.AnimatedSearchBox,
    })),
  { ssr: false, loading: SearchBoxFallback }
);

const AiChatDrawer = dynamic(() => import('@/components/ai-chat-drawer'), {
  ssr: false,
  loading: () => null,
});

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { aiChatOpen, toggleAiChat, setAiSettingsOpen } = useAppStore();
  const [showAIDropdown, setShowAIDropdown] = useState(false);

  const isTestPage = pathname === '/sidebar-header-test';
  const isChatEnhancedPage = pathname === '/chat-enhanced';

  if (isTestPage) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex bg-background">
      <AdaptiveSidebar />

      <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        <div className="relative">
          <AdaptiveHeader currentRoute={pathname} />

          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 pr-0">
            {!isChatEnhancedPage && (
              <div
                className="relative"
                onMouseEnter={() => setShowAIDropdown(true)}
                onMouseLeave={() => setShowAIDropdown(false)}
              >
                <button
                  onClick={toggleAiChat}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-sm border transition-colors shadow-sm flex-shrink-0 ${
                    aiChatOpen
                      ? 'bg-[color:var(--accent-primary)] border-[color:color-mix(in_srgb,var(--accent-primary)_65%,black_35%)] text-[color:var(--color-text-inverse)]'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  }`}
                  title={aiChatOpen ? `AI Active \u0014 Close (\u0010J)` : `AI Co-Pilot (\u0010J)`}
                >
                  <Sparkles
                    size={14}
                    strokeWidth={aiChatOpen ? 2 : 1.5}
                    className={
                      aiChatOpen
                        ? 'text-[color:var(--color-text-inverse)]'
                        : 'text-muted-foreground'
                    }
                  />
                  <span className="hidden sm:inline">AI</span>
                </button>

                <AISettingsDropdown
                  isOpen={showAIDropdown && aiChatOpen}
                  onOpenSettings={() => {
                    setShowAIDropdown(false);
                    setAiSettingsOpen(true);
                  }}
                />
              </div>
            )}

            <AnimatedSearchBox currentRoute={pathname} />
          </div>
        </div>

        {aiChatOpen && !isChatEnhancedPage && (
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-40"
            style={{ width: '2px', right: 420, backgroundColor: 'var(--accent-primary)' }}
          />
        )}

        <FlightBreadcrumb />

        <motion.div
          animate={{ marginRight: aiChatOpen && !isChatEnhancedPage ? 420 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="flex-1 overflow-y-auto"
        >
          {children}
        </motion.div>

        {!isChatEnhancedPage && <AiChatDrawer />}
      </div>
    </div>
  );
}
