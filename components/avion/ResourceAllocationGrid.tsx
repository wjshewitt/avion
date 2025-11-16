"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  Users,
  Plane,
  MapPin,
  Clock,
  DollarSign,
  BarChart3,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResourceItem {
  id: string;
  name: string;
  type: 'crew' | 'aircraft' | 'gate' | 'equipment';
  status: 'available' | 'assigned' | 'maintenance' | 'unavailable';
  location?: string;
  cost?: number;
  utilization?: number;
  efficiency?: number;
  nextAvailable?: string;
  currentAssignment?: string;
}

interface ResourceAllocationGridProps {
  resources: ResourceItem[];
  className?: string;
}

export default function ResourceAllocationGrid({ resources, className }: ResourceAllocationGridProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const typeIcons = {
    crew: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    aircraft: { icon: Plane, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    gate: { icon: MapPin, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    equipment: { icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available': return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', label: 'Available' };
      case 'assigned': return { bg: 'bg-blue-500/10', text: 'text-blue-500', label: 'Assigned' };
      case 'maintenance': return { bg: 'bg-amber-500/10', text: 'text-amber-500', label: 'Maintenance' };
      case 'unavailable': return { bg: 'bg-red-500/10', text: 'text-red-500', label: 'Unavailable' };
      default: return { bg: 'bg-gray-500/10', text: 'text-gray-500', label: 'Unknown' };
    }
  };

  const filteredResources = selectedType
    ? resources.filter(r => r.type === selectedType)
    : resources;

  const types = ['crew', 'aircraft', 'gate', 'equipment'];
  const typeCounts = types.reduce((acc, type) => {
    acc[type] = resources.filter(r => r.type === type).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Type Filter */}
      <div className="flex items-center space-x-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
          Filter:
        </span>
        {types.map((type) => {
          const typeInfo = typeIcons[type as keyof typeof typeIcons];
          const Icon = typeInfo.icon;
          const isActive = selectedType === type;

          return (
            <motion.button
              key={type}
              onClick={() => setSelectedType(isActive ? null : type)}
              className={cn(
                "flex items-center space-x-2 px-3 py-1.5 rounded-sm border transition-all duration-200",
                isActive
                  ? `${typeInfo.bg} border-current ${typeInfo.color}`
                  : "bg-[#1A1A1A] border-[#333] hover:border-[#444]"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-mono capitalize">
                {type}
              </span>
              <span className={cn(
                "text-xs font-mono px-1 rounded",
                isActive ? "bg-current/10" : "text-[#71717A]"
              )}>
                {typeCounts[type]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Resource Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource, index) => {
          const typeInfo = typeIcons[resource.type];
          const Icon = typeInfo.icon;
          const statusStyle = getStatusStyle(resource.status);
          const isExpanded = expanded === resource.id;

          return (
            <motion.div
              key={resource.id}
              className={cn(
                "bg-[#1A1A1A] rounded-sm border border-[#333] overflow-hidden",
                "transition-all duration-300"
              )}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              whileHover={{
                scale: 1.02,
                borderColor: typeInfo.color.replace('text-', '#').replace('500', '500'),
                boxShadow: `0 0 20px ${typeInfo.color.replace('text-', 'rgba(').replace('500', '80, 48, 0.2')}`
              }}
              layout
            >
              {/* Header */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "p-2 rounded-xs border",
                      statusStyle.bg,
                      "border-zinc-700/20"
                    )}>
                      <Icon className={cn("w-5 h-5", typeInfo.color)} />
                    </div>
                    <div>
                      <h4 className="text-white font-mono text-base">
                        {resource.name}
                      </h4>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-[#71717A]">
                        {resource.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={cn(
                      "text-xs font-mono px-2 py-1 rounded-xs",
                      statusStyle.text,
                      statusStyle.bg
                    )}>
                      {statusStyle.label}
                    </span>
                    <motion.button
                      onClick={() => setExpanded(isExpanded ? null : resource.id)}
                      className="text-[#71717A] hover:text-white transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>

                {/* Quick Stats */}
                {resource.utilization !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                        Utilization
                      </span>
                      <span className="text-xs font-mono text-white">
                        {resource.utilization}%
                      </span>
                    </div>
                    <div className="w-full h-1 bg-[#333] rounded-full overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full",
                          resource.utilization > 80 ? "bg-[#F04E30]" :
                          resource.utilization > 60 ? "bg-amber-500" :
                          "bg-emerald-500"
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${resource.utilization}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}

                {/* Location / Assignment */}
                {(resource.location || resource.currentAssignment) && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3 h-3 text-[#71717A]" />
                    <span className="text-xs font-mono text-[#A1A1AA]">
                      {resource.currentAssignment || resource.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    className="border-t border-[#333] p-4 space-y-3"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Cost */}
                    {resource.cost !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-3 h-3 text-[#71717A]" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                            Cost/Hour
                          </span>
                        </div>
                        <span className="text-sm font-mono text-white">
                          ${resource.cost.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Efficiency */}
                    {resource.efficiency !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-3 h-3 text-[#71717A]" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                            Efficiency
                          </span>
                        </div>
                        <span className={cn(
                          "text-sm font-mono",
                          resource.efficiency > 90 ? "text-emerald-500" :
                          resource.efficiency > 75 ? "text-amber-500" :
                          "text-red-500"
                        )}>
                          {resource.efficiency}%
                        </span>
                      </div>
                    )}

                    {/* Next Available */}
                    {resource.nextAvailable && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 text-[#71717A]" />
                          <span className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                            Next Available
                          </span>
                        </div>
                        <span className="text-sm font-mono text-white">
                          {resource.nextAvailable}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2 pt-2">
                      <motion.button
                        className={cn(
                          "flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-sm",
                          "border text-xs font-mono uppercase tracking-wider",
                          "transition-all duration-200",
                          resource.status === 'available'
                            ? "border-[#F04E30] text-[#F04E30] hover:bg-[#F04E30] hover:text-black"
                            : "border-[#333] text-[#71717A] cursor-not-allowed"
                        )}
                        whileHover={resource.status === 'available' ? { scale: 1.02 } : {}}
                        whileTap={resource.status === 'available' ? { scale: 0.98 } : {}}
                        disabled={resource.status !== 'available'}
                      >
                        <Plus className="w-3 h-3" />
                        <span>Assign</span>
                      </motion.button>
                      <motion.button
                        className={cn(
                          "flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-sm",
                          "border text-xs font-mono uppercase tracking-wider",
                          "transition-all duration-200"
                        )}
                        style={{
                          borderColor: resource.status === 'assigned' ? '#71717A' : '#333',
                          color: resource.status === 'assigned' ? '#A1A1AA' : '#71717A',
                          cursor: resource.status === 'assigned' ? 'pointer' : 'not-allowed'
                        }}
                        whileHover={resource.status === 'assigned' ? { scale: 1.02 } : {}}
                        whileTap={resource.status === 'assigned' ? { scale: 0.98 } : {}}
                        disabled={resource.status !== 'assigned'}
                      >
                        <Minus className="w-3 h-3" />
                        <span>Release</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredResources.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle className="w-12 h-12 text-[#71717A] mx-auto mb-4" />
          <p className="text-[#71717A] font-mono text-sm">
            No resources found for the selected filter
          </p>
        </motion.div>
      )}
    </div>
  );
}