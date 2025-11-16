'use client';

import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import AiChatDrawer from"@/components/ai-chat-drawer";
import { AdaptiveSidebar } from "@/components/mission-control/AdaptiveSidebar";
import { AdaptiveHeader } from "@/components/mission-control/AdaptiveHeader";
import { AnimatedSearchBox } from "@/components/mission-control/AnimatedSearchBox";
import { FlightBreadcrumb } from "@/components/ui/flight-breadcrumb";
import { AISettingsDropdown } from "@/components/ai-drawer/AISettingsDropdown";
import { useAppStore } from '@/lib/store';

export default function AppLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const pathname = usePathname();
 const { aiChatOpen, toggleAiChat, setAiSettingsOpen } = useAppStore();
 const [showAIDropdown, setShowAIDropdown] = useState(false);
 
 // Hide chrome for test pages
 const isTestPage = pathname === '/sidebar-header-test';
 
 // Hide AI button on chat-enhanced page
 const isChatEnhancedPage = pathname === '/chat-enhanced';

 // If it's a test page, render children directly without chrome
 if (isTestPage) {
   return <>{children}</>;
 }

 return (
   <div className="h-screen flex bg-background">
     {/* Left Navigation Sidebar */}
     <AdaptiveSidebar />

     {/* Main Content Area */}
     <div className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
       {/* Header with integrated search/chat bar */}
       <div className="relative">
         <AdaptiveHeader currentRoute={pathname} />
         
         {/* AI Button + Search/Chat Bar - Positioned in header's right section */}
         <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 pr-0">
           {/* AI Activate Button with Dropdown - Hidden on chat-enhanced page */}
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
                 title={aiChatOpen ? "AI Active  Close (J)" : "AI Co-Pilot (J)"}
               >
                 <Sparkles
                   size={14}
                   strokeWidth={aiChatOpen ? 2 : 1.5}
                   className={aiChatOpen ? "text-[color:var(--color-text-inverse)]" : "text-muted-foreground"}
                 />
                 <span className="hidden sm:inline">AI</span>
               </button>
               
               {/* Settings Dropdown */}
               <AISettingsDropdown 
                 isOpen={showAIDropdown && aiChatOpen}
                 onOpenSettings={() => {
                   setShowAIDropdown(false);
                   setAiSettingsOpen(true);
                 }}
               />
             </div>
           )}
           
           {/* Search/Chat Input - Exactly 420px */}
           <AnimatedSearchBox currentRoute={pathname} />
         </div>
       </div>

       {/* Vertical accent line at left edge of AI drawer, extending into header when open (except on chat-enhanced page) */}
       {aiChatOpen && !isChatEnhancedPage && (
         <div
           className="pointer-events-none absolute top-0 bottom-0 z-40"
           style={{
             width: "2px",
             right: 420,
             backgroundColor: "var(--accent-primary)",
           }}
         />
       )}

       {/* Breadcrumb Navigation */}
       <FlightBreadcrumb />

       {/* Page Content - Pushes left when drawer opens (except on chat-enhanced page) */}
       <motion.div
         animate={{ marginRight: (aiChatOpen && !isChatEnhancedPage) ? 420 : 0 }}
         transition={{ type: 'spring', stiffness: 400, damping: 35 }}
         className="flex-1 overflow-y-auto"
       >
         {children}
       </motion.div>

       {/* AI Chat Drawer (Absolute Position) - Hidden on chat-enhanced page */}
       {!isChatEnhancedPage && <AiChatDrawer />}
     </div>
   </div>
 );
}


