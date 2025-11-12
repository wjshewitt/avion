'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Check } from 'lucide-react';

interface HoldToActionButtonProps {
 children: React.ReactNode;
 onComplete: () => void;
 holdDuration?: number;
}

export default function HoldToActionButton({ 
 children, 
 onComplete, 
 holdDuration = 2000 
}: HoldToActionButtonProps) {
 const [isHolding, setIsHolding] = useState(false);
 const [progress, setProgress] = useState(0);
 const [isComplete, setIsComplete] = useState(false);
 const intervalRef = useRef<NodeJS.Timeout | null>(null);

 useEffect(() => {
 if (isHolding) {
 const startTime = Date.now();
 intervalRef.current = setInterval(() => {
 const elapsed = Date.now() - startTime;
 const newProgress = Math.min((elapsed / holdDuration) * 100, 100);
 setProgress(newProgress);

 if (newProgress >= 100) {
 setIsComplete(true);
 setIsHolding(false);
 onComplete();
 setTimeout(() => {
 setIsComplete(false);
 setProgress(0);
 }, 2000);
 }
 }, 16);
 } else {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 }
 if (!isComplete) {
 setProgress(0);
 }
 }

 return () => {
 if (intervalRef.current) {
 clearInterval(intervalRef.current);
 }
 };
 }, [isHolding, holdDuration, onComplete, isComplete]);

 const handleMouseDown = () => {
 if (!isComplete) setIsHolding(true);
 };

 const handleMouseUp = () => {
 setIsHolding(false);
 };

 return (
 <motion.button
 onMouseDown={handleMouseDown}
 onMouseUp={handleMouseUp}
 onMouseLeave={handleMouseUp}
 onTouchStart={handleMouseDown}
 onTouchEnd={handleMouseUp}
 className={`
 relative overflow-hidden
 px-6 py-3 
 font-mono font-semibold text-sm
 transition-all duration-300
 ${isComplete 
 ? 'bg-green text-white' 
 : 'bg-gradient-to-r from-amber to-red hover:from-amber-600 hover:to-red-600 text-white'
 }
 shadow-md hover:shadow-lg
 select-none cursor-pointer
 `}
 whileTap={{ scale: 0.95 }}
 >
 <span className="relative z-10 flex items-center gap-2">
 {isComplete ? (
 <>
 <Check size={16} />
 <span>Confirmed</span>
 </>
 ) : (
 <span>{isHolding ? 'Hold...' : children}</span>
 )}
 </span>

 {/* Progress ring */}
 {!isComplete && (
 <motion.div
 className="absolute inset-0 bg-white/20"
 initial={{ scaleX: 0 }}
 animate={{ scaleX: progress / 100 }}
 style={{ transformOrigin: 'left' }}
 transition={{ duration: 0.05 }}
 />
 )}
 </motion.button>
 );
}
