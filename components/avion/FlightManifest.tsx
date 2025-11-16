"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CrewMember {
  role: string;
  name: string;
  status: 'on-duty' | 'break' | 'off-duty';
}

interface FlightManifestProps {
  crew: CrewMember[];
  className?: string;
}

export default function FlightManifest({ crew, className }: FlightManifestProps) {
  const getStatusIndicator = (status: string) => {
    switch (status) {
      case 'on-duty':
        return { color: 'bg-emerald-500', text: 'ON DUTY' };
      case 'break':
        return { color: 'bg-amber-500', text: 'REST' };
      case 'off-duty':
        return { color: 'bg-gray-500', text: 'OFF' };
      default:
        return { color: 'bg-gray-500', text: 'UNKNOWN' };
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-widest text-[#71717A] pb-2 border-b border-[#333]">
        <div>ROLE</div>
        <div>NAME</div>
        <div className="text-center">STATUS</div>
      </div>

      <div className="space-y-1">
        {crew.map((member, index) => {
          const status = getStatusIndicator(member.status);

          return (
            <motion.div
              key={member.role}
              className={cn(
                "grid grid-cols-3 gap-2 py-3 px-3 rounded-sm transition-all duration-200",
                "border border-[#333] bg-[#1A1A1A]"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, backgroundColor: '#222' }}
            >
              {/* Role */}
              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-xs text-xs font-mono bg-[#2A2A2A] text-white border border-[#444]">
                  {member.role}
                </span>
              </div>

              {/* Name */}
              <div className="flex items-center">
                <span className="text-white font-mono text-sm">
                  {member.name}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <div className={cn("w-2 h-2 rounded-full", status.color)} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#A1A1AA]">
                    {status.text}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Total crew count */}
      <motion.div
        className="pt-3 mt-3 border-t border-[#333]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: crew.length * 0.1 + 0.2 }}
      >
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
          <span>Total Crew</span>
          <span className="text-white font-bold text-sm">
            {crew.filter(c => c.status === 'on-duty').length} Active
          </span>
        </div>
      </motion.div>
    </div>
  );
}