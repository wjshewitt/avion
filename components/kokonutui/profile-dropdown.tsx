'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { User, Settings, Bell, LogOut, ChevronDown } from 'lucide-react';

interface MenuItem {
 icon: React.ReactNode;
 label: string;
 onClick: () => void;
 variant?: 'default' | 'danger';
}

interface User {
 name: string;
 email?: string;
 avatar?: string;
}

interface ProfileDropdownProps {
 user: User;
 menuItems?: MenuItem[];
}

export default function ProfileDropdown({ 
 user,
 menuItems = [
 { icon: <User size={16} />, label: 'View Profile', onClick: () => {} },
 { icon: <Settings size={16} />, label: 'Settings', onClick: () => {} },
 { icon: <Bell size={16} />, label: 'Notifications', onClick: () => {} },
 { icon: <LogOut size={16} />, label: 'Log Out', onClick: () => {}, variant: 'danger' },
 ]
}: ProfileDropdownProps) {
 const [isOpen, setIsOpen] = useState(false);
 const dropdownRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 const handleClickOutside = (event: MouseEvent) => {
 if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
 setIsOpen(false);
 }
 };

 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 return (
 <div ref={dropdownRef} className="relative">
 {/* Trigger Button */}
 <motion.button
 onClick={() => setIsOpen(!isOpen)}
 className="
 flex items-center gap-2 px-3 py-2 
 border border-border dark:border-slate-700 bg-white
 hover:bg-surface dark:bg-slate-800 transition-colors duration-200
"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 {user.avatar ? (
 <div className="w-8 h-8 bg-blue text-white flex items-center justify-center font-semibold text-sm">
 {user.avatar}
 </div>
 ) : (
 <div className="w-8 h-8 bg-blue text-white flex items-center justify-center font-semibold text-sm">
 {user.name.charAt(0).toUpperCase()}
 </div>
 )}
 <span className="text-sm font-medium text-text-primary dark:text-slate-50">{user.name}</span>
 <motion.div
 animate={{ rotate: isOpen ? 180 : 0 }}
 transition={{ duration: 0.2 }}
 >
 <ChevronDown size={16} className="text-text-secondary dark:text-slate-400" />
 </motion.div>
 </motion.button>

 {/* Dropdown Menu */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: -10, scale: 0.95 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -10, scale: 0.95 }}
 transition={{ duration: 0.2 }}
 className="
 absolute right-0 mt-2 w-56
 bg-white dark:bg-slate-900 border border-border dark:border-slate-700 
 shadow-xl overflow-hidden
 z-50
"
 >
 {menuItems.map((item, index) => (
 <div key={index}>
 <motion.button
 onClick={() => {
 item.onClick();
 setIsOpen(false);
 }}
 className={`
 w-full flex items-center gap-3 px-4 py-3
 hover:bg-surface dark:bg-slate-800 transition-colors duration-150
 text-left
 ${item.variant === 'danger' ? 'text-red hover:bg-red-50' : 'text-text-primary'}
 `}
 whileHover={{ x: 4 }}
 transition={{ duration: 0.15 }}
 >
 {item.icon}
 <span className="text-sm font-medium">{item.label}</span>
 </motion.button>
 {index < menuItems.length - 1 && (
 <div className="h-px bg-border mx-2" />
 )}
 </div>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 );
}
