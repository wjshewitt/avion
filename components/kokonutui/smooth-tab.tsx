'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Tab {
 id: string;
 label: string;
 content: React.ReactNode;
}

interface SmoothTabProps {
 tabs: Tab[];
}

export default function SmoothTab({ tabs }: SmoothTabProps) {
 const [activeTab, setActiveTab] = useState(tabs[0].id);

 return (
 <div className="bg-white dark:bg-slate-900 border border-border dark:border-slate-700 overflow-hidden shadow-sm">
 {/* Tab Headers */}
 <div className="flex border-b border-border dark:border-slate-700 bg-surface dark:bg-slate-800">
 {tabs.map((tab) => (
 <button
 key={tab.id}
 onClick={() => setActiveTab(tab.id)}
 className={`
 relative flex-1 px-6 py-3 text-sm font-medium
 transition-colors duration-200
 ${activeTab === tab.id ? 'text-blue' : 'text-text-secondary dark:text-slate-400 hover:text-text-primary'}
 `}
 >
 {tab.label}
 
 {/* Animated underline */}
 {activeTab === tab.id && (
 <motion.div
 layoutId="activeTab"
 className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue"
 transition={{ type: 'spring', stiffness: 500, damping: 30 }}
 />
 )}
 </button>
 ))}
 </div>

 {/* Tab Content */}
 <div className="p-6">
 {tabs.map((tab) => (
 <motion.div
 key={tab.id}
 initial={false}
 animate={{
 opacity: activeTab === tab.id ? 1 : 0,
 y: activeTab === tab.id ? 0 : 10,
 }}
 transition={{ duration: 0.2 }}
 className={activeTab === tab.id ? 'block' : 'hidden'}
 >
 {tab.content}
 </motion.div>
 ))}
 </div>
 </div>
 );
}
