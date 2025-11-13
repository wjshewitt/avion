'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Check } from 'lucide-react';

interface Team {
 id: string;
 name: string;
 icon?: string;
 color?: string;
}

interface TeamSelectorProps {
 teams: Team[];
 onSelect: (teamId: string) => void;
 defaultTeam?: string;
}

export default function TeamSelector({ teams, onSelect, defaultTeam }: TeamSelectorProps) {
 const [selectedTeam, setSelectedTeam] = useState(defaultTeam || teams[0]?.id);

 const handleSelect = (teamId: string) => {
 setSelectedTeam(teamId);
 onSelect(teamId);
 };

 return (
 <div className="flex flex-wrap gap-2">
 {teams.map((team) => {
 const isSelected = team.id === selectedTeam;
 
 return (
 <motion.button
 key={team.id}
 onClick={() => handleSelect(team.id)}
 className={`
 relative flex items-center gap-2 px-4 py-2.5 
 border-2 transition-all duration-200
 ${isSelected 
 ? 'border-blue bg-blue-50' 
 : 'border-border dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-blue-300'
 }
 `}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 >
 {/* Team Icon/Avatar */}
        {team.icon ? (
         <Image src={team.icon} alt={team.name} width={20} height={20} className="w-5 h-5 rounded-full object-cover" />
 ) : (
 <div 
 className="w-5 h-5 flex items-center justify-center text-xs font-bold text-white"
 style={{ backgroundColor: team.color || '#2563eb' }}
 >
 {team.name.charAt(0)}
 </div>
 )}

 {/* Team Name */}
 <span className={`text-sm font-medium ${isSelected ? 'text-blue' : 'text-text-primary'}`}>
 {team.name}
 </span>

 {/* Check Icon */}
 <AnimatePresence>
 {isSelected && (
 <motion.div
 initial={{ scale: 0, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 exit={{ scale: 0, opacity: 0 }}
 transition={{ duration: 0.2 }}
 >
 <Check size={16} className="text-blue" />
 </motion.div>
 )}
 </AnimatePresence>

 {/* Selection indicator */}
 {isSelected && (
 <motion.div
 layoutId="teamSelector"
 className="absolute inset-0 border-2 border-blue"
 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
 />
 )}
 </motion.button>
 );
 })}
 </div>
 );
}
