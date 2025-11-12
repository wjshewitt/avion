'use client';

import { usePathname } from 'next/navigation';
import Sidebar from"@/components/sidebar";
import AiChatPanel from"@/components/ai-chat-panel";
import AppHeader from"@/components/app-header";

export default function AppLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 const pathname = usePathname();

 return (
   <div className="h-screen flex bg-background">
     {/* Left Navigation Sidebar */}
     <Sidebar />

     {/* Main Content Area */}
     <div className="flex-1 flex flex-col min-w-0">
       {/* Header */}
       <AppHeader currentRoute={pathname} />

       {/* Page Content + AI Panel */}
       <div className="flex-1 flex min-h-0">
         {/* Main Page Content */}
         <div className="flex-1 min-w-0 overflow-y-auto">
           {children}
         </div>

         {/* Right AI Chat Panel */}
         <AiChatPanel />
       </div>
     </div>
   </div>
 );
}


