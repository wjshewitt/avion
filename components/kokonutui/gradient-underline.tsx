'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GradientUnderlineProps {
 children: ReactNode;
 href?: string;
 onClick?: () => void;
}

export default function GradientUnderline({ children, href, onClick }: GradientUnderlineProps) {
 const Component = href ? 'a' : 'button';
 
 return (
 <Component
 href={href}
 onClick={onClick}
 className="relative inline-block text-text-primary dark:text-slate-50 hover:text-blue transition-colors duration-200 font-medium group"
 >
 <span className="relative z-10">{children}</span>
 
 {/* Gradient underline */}
 <motion.div
 className="absolute bottom-0 left-0 h-0.5 w-full origin-left"
 style={{
 background: 'linear-gradient(90deg, #2563eb, #8b5cf6)',
 }}
 initial={{ scaleX: 0 }}
 whileHover={{ scaleX: 1 }}
 transition={{ duration: 0.3, ease: 'easeOut' }}
 />
 
 {/* Glow effect */}
 <motion.div
 className="absolute bottom-0 left-0 h-1 w-full blur-sm origin-left"
 style={{
 background: 'linear-gradient(90deg, #2563eb, #8b5cf6)',
 }}
 initial={{ scaleX: 0, opacity: 0 }}
 whileHover={{ scaleX: 1, opacity: 0.5 }}
 transition={{ duration: 0.3, ease: 'easeOut' }}
 />
 </Component>
 );
}
