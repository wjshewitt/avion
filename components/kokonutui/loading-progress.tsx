'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Step {
 label: string;
 description?: string;
}

interface LoadingProgressProps {
 steps: Step[];
 currentStep: number;
}

export default function LoadingProgress({ steps, currentStep }: LoadingProgressProps) {
 return (
 <div className="w-full py-8">
 <div className="relative">
 {steps.map((step, index) => {
 const isCompleted = index < currentStep;
 const isActive = index === currentStep;
 const isPending = index > currentStep;

 return (
 <div key={index} className="relative flex items-start mb-8 last:mb-0">
 {/* Connecting Line */}
 {index < steps.length - 1 && (
 <div 
 className="absolute left-6 top-12 w-0.5 h-full -translate-x-1/2"
 style={{
 background: isCompleted 
 ? '#10b981' 
 : isActive 
 ? 'linear-gradient(to bottom, #2563eb, #cbd5e1)'
 : '#cbd5e1'
 }}
 />
 )}

 {/* Step Circle */}
 <motion.div
 className={`
 relative z-10 flex items-center justify-center
 w-12 h-12 border-2 font-mono font-bold text-sm
 ${isCompleted ? 'bg-green border-green text-white' : ''}
 ${isActive ? 'bg-blue border-blue text-white' : ''}
 ${isPending ? 'bg-white dark:bg-slate-900 border-border dark:border-slate-700 text-text-secondary' : ''}
 `}
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ 
 scale: isActive ? [1, 1.1, 1] : 1,
 opacity: 1 
 }}
 transition={{ 
 scale: {
 duration: 1,
 repeat: isActive ? Infinity : 0,
 repeatType: 'reverse'
 },
 opacity: { duration: 0.3 }
 }}
 >
 {isCompleted ? (
 <Check size={20} strokeWidth={3} />
 ) : (
 <span>{index + 1}</span>
 )}

 {/* Pulse ring for active step */}
 {isActive && (
 <motion.div
 className="absolute inset-0 border-2 border-blue"
 initial={{ scale: 1, opacity: 0.5 }}
 animate={{ scale: 1.5, opacity: 0 }}
 transition={{ duration: 1.5, repeat: Infinity }}
 />
 )}
 </motion.div>

 {/* Step Content */}
 <div className="ml-6 flex-1">
 <motion.h3
 className={`
 text-sm font-semibold mb-1
 ${isCompleted || isActive ? 'text-text-primary' : 'text-text-secondary'}
 `}
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: index * 0.1 }}
 >
 {step.label}
 </motion.h3>
 {step.description && (
 <motion.p
 className="text-xs text-text-secondary dark:text-slate-400"
 initial={{ opacity: 0 }}
 animate={{ opacity: isActive ? 1 : 0.6 }}
 >
 {step.description}
 </motion.p>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
