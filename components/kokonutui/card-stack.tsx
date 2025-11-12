'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Card {
 id: string;
 title: string;
 content: React.ReactNode;
 color?: string;
}

interface CardStackProps {
 cards: Card[];
}

export default function CardStack({ cards }: CardStackProps) {
 const [expandedCard, setExpandedCard] = useState<string | null>(null);

 return (
 <div className="relative h-[400px] w-full">
 {cards.map((card, index) => {
 const isExpanded = expandedCard === card.id;
 const isStacked = expandedCard !== null && !isExpanded;

 return (
 <motion.div
 key={card.id}
 className="absolute inset-0 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 p-6 cursor-pointer shadow-lg"
 style={{
 zIndex: isExpanded ? 100 : cards.length - index,
 }}
 initial={false}
 animate={{
 top: isStacked ? index * 60 : isExpanded ? 0 : index * 20,
 scale: isStacked ? 0.95 : 1,
 opacity: isStacked ? 0.5 : 1,
 }}
 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
 onClick={() => setExpandedCard(isExpanded ? null : card.id)}
 >
 <div className="relative h-full flex flex-col">
 {/* Header */}
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-bold text-text-primary dark:text-slate-50">{card.title}</h3>
 <div 
 className="w-3 h-3"
 style={{ backgroundColor: card.color || '#2563eb' }}
 />
 </div>

 {/* Content */}
 <AnimatePresence>
 {isExpanded && (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: 20 }}
 transition={{ delay: 0.1 }}
 className="flex-1 overflow-auto"
 >
 {card.content}
 </motion.div>
 )}
 </AnimatePresence>

 {/* Indicator */}
 {!isExpanded && (
 <div className="absolute bottom-6 left-6 right-6 text-center">
 <span className="text-xs text-text-secondary dark:text-slate-400">Click to expand</span>
 </div>
 )}
 </div>
 </motion.div>
 );
 })}
 </div>
 );
}
