Avion Chat Components Library

Aesthetic: Ceramic/Tungsten/Orange (Avion Design System)
Dependencies: lucide-react, framer-motion, tailwindcss

You can copy these components directly into your React project.

1. Thinking Indicator

Visualizes the AI processing state. A subtle, pulsing animation with status text.

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ThinkingIndicator = () => {
    const [step, setStep] = useState(0);
    const steps = ["Parsing Request", "Querying Knowledge Base", "Synthesizing Response"];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % steps.length);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-lg border border-zinc-100 w-fit shadow-sm">
            <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1 h-4 bg-zinc-800 rounded-full"
                        animate={{ 
                            height: ["4px", "16px", "4px"],
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{ 
                            duration: 1, 
                            repeat: Infinity, 
                            delay: i * 0.2,
                            ease: "easeInOut" 
                        }}
                    />
                ))}
            </div>
            <div className="h-4 w-[1px] bg-zinc-200 mx-1"></div>
            <AnimatePresence mode="wait">
                <motion.span 
                    key={step}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -2 }}
                    className="text-xs font-mono text-zinc-500 uppercase tracking-wide"
                >
                    {steps[step]}...
                </motion.span>
            </AnimatePresence>
        </div>
    );
};


2. Source / Citation Card

Displays data sources used by the AI. Styled like a physical data card.

import { FileText, Database } from 'lucide-react'; // Ensure icons are imported

export const SourceCard = ({ title, type, metadata, url }) => {
    return (
        <a 
            href={url || '#'} 
            className="group flex items-start gap-3 p-3 bg-white border border-zinc-200 rounded-md hover:border-[#F04E30] hover:shadow-sm transition-all cursor-pointer min-w-[200px] max-w-[240px] text-left no-underline"
        >
            <div className="mt-0.5 p-1.5 bg-zinc-50 rounded-sm border border-zinc-100 text-zinc-500 group-hover:text-[#F04E30] transition-colors shrink-0">
                {type === 'database' ? <Database size={14} /> : <FileText size={14} />}
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
};


3. AI Response Container

The main message bubble for the AI, including support for rendering sources.

import { Cpu, Link } from 'lucide-react';

export const AIMessage = ({ content, sources, isTyping }) => {
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
                        <span className="inline-block w-1.5 h-4 bg-[#F04E30] ml-1 align-middle animate-pulse"/>
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
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
