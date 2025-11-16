"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Info,
  X,
  Check,
  AlertCircle,
  Bell,
  Zap,
  CloudSnow,
  Users,
  Plane,
  MapPin,
  Clock,
  TrendingUp,
  ChevronRight,
  Filter,
  Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'weather' | 'operational' | 'crew' | 'maintenance' | 'security' | 'schedule';
  title: string;
  message: string;
  timestamp: Date;
  flightId?: string;
  location?: string;
  severity: number; // 1-5
  acknowledged: boolean;
  resolved: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
  }>;
}

interface AlertSystemProps {
  alerts: Alert[];
  className?: string;
}

export default function AlertSystem({ alerts, className }: AlertSystemProps) {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    let filtered = alerts;

    // Filter by type
    if (selectedType) {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    // Filter archived
    if (!showArchived) {
      filtered = filtered.filter(alert => !alert.resolved);
    }

    // Sort by severity and timestamp
    filtered.sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
      if (a.severity !== b.severity) return b.severity - a.severity;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredAlerts(filtered);
  }, [alerts, selectedType, showArchived]);

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical': return {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: 'text-red-500',
        iconBg: 'bg-red-500/20',
        pulse: true
      };
      case 'warning': return {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: 'text-amber-500',
        iconBg: 'bg-amber-500/20',
        pulse: false
      };
      case 'info': return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        icon: 'text-blue-500',
        iconBg: 'bg-blue-500/20',
        pulse: false
      };
      case 'success': return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: 'text-emerald-500',
        iconBg: 'bg-emerald-500/20',
        pulse: false
      };
      default: return {
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        icon: 'text-gray-500',
        iconBg: 'bg-gray-500/20',
        pulse: false
      };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'weather': return CloudSnow;
      case 'crew': return Users;
      case 'operational': return Plane;
      case 'maintenance': return Zap;
      case 'security': return AlertCircle;
      case 'schedule': return Clock;
      default: return Info;
    }
  };

  const getTypeCounts = () => {
    const counts = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      critical: counts.critical || 0,
      warning: counts.warning || 0,
      info: counts.info || 0,
      success: counts.success || 0
    };
  };

  const typeCounts = getTypeCounts();
  const stats = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    unresolved: alerts.filter(a => !a.resolved).length
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <motion.div
          className="bg-[#1A1A1A] rounded-sm p-4 border border-[#333] relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                Active Alerts
              </span>
              <Bell className="w-4 h-4 text-[#71717A]" />
            </div>
            <motion.div
              className="text-2xl font-mono text-white tabular-nums"
              key={stats.total}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              {stats.total}
            </motion.div>
          </div>
          {stats.total > 0 && (
            <motion.div
              className="absolute top-0 right-0 w-2 h-full bg-red-500/30"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ originY: 'top' }}
            />
          )}
        </motion.div>

        <motion.div
          className="bg-red-500/10 rounded-sm p-4 border border-red-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-red-500">
              Critical
            </span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <motion.div
            className="text-2xl font-mono text-red-500 tabular-nums"
            key={typeCounts.critical}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {typeCounts.critical}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-amber-500/10 rounded-sm p-4 border border-amber-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
              Warnings
            </span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <motion.div
            className="text-2xl font-mono text-amber-500 tabular-nums"
            key={typeCounts.warning}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {typeCounts.warning}
          </motion.div>
        </motion.div>

        <motion.div
          className="bg-blue-500/10 rounded-sm p-4 border border-blue-500/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-blue-500">
              Pending
            </span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <motion.div
            className="text-2xl font-mono text-blue-500 tabular-nums"
            key={stats.unacknowledged}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            {stats.unacknowledged}
          </motion.div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-[#71717A]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
            Filter:
          </span>
          {['critical', 'warning', 'info', 'success'].map((type) => {
            const count = typeCounts[type as keyof typeof typeCounts];
            const style = getAlertStyle(type);
            const isActive = selectedType === type;

            return (
              <motion.button
                key={type}
                onClick={() => setSelectedType(isActive ? null : type)}
                disabled={count === 0}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1.5 rounded-sm border transition-all duration-200",
                  isActive
                    ? `${style.bg} border-current ${style.icon}`
                    : count > 0
                    ? "bg-[#1A1A1A] border-[#333] hover:border-[#444]"
                    : "bg-[#1A1A1A] border-[#333] opacity-50 cursor-not-allowed"
                )}
                whileHover={count > 0 ? { scale: 1.05 } : {}}
                whileTap={count > 0 ? { scale: 0.95 } : {}}
              >
                <AlertTriangle className={cn("w-3 h-3", isActive ? style.icon : "text-[#71717A]")} />
                <span className={cn(
                  "text-xs font-mono capitalize",
                  isActive ? style.icon : count > 0 ? "text-white" : "text-[#71717A]"
                )}>
                  {type}
                </span>
                <span className="text-xs font-mono text-[#71717A]">
                  ({count})
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          onClick={() => setShowArchived(!showArchived)}
          className={cn(
            "flex items-center space-x-2 px-3 py-1.5 rounded-sm border transition-all duration-200",
            showArchived
              ? "bg-[#F04E30]/10 border-[#F04E30] text-[#F04E30]"
              : "bg-[#1A1A1A] border-[#333] hover:border-[#444] text-[#71717A]"
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Archive className="w-3 h-3" />
          <span className="text-xs font-mono uppercase">
            {showArchived ? 'Hide' : 'Show'} Resolved
          </span>
        </motion.button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredAlerts.map((alert, index) => {
            const style = getAlertStyle(alert.type);
            const CategoryIcon = getCategoryIcon(alert.category);
            const ageMinutes = Math.floor((new Date().getTime() - alert.timestamp.getTime()) / 60000);

            return (
              <motion.div
                key={alert.id}
                className={cn(
                  "rounded-sm border transition-all duration-300 overflow-hidden",
                  style.bg,
                  style.border,
                  alert.acknowledged && !alert.resolved ? "opacity-60" : "",
                  alert.resolved ? "opacity-40" : ""
                )}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: alert.resolved ? 0.4 : (alert.acknowledged ? 0.6 : 1),
                  x: 0
                }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{
                  scale: alert.resolved ? 1 : 1.01,
                  x: alert.resolved ? 0 : 5
                }}
                layout
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={cn(
                      "relative p-2 rounded-xs border",
                      style.iconBg,
                      style.border
                    )}>
                      <CategoryIcon className={cn("w-5 h-5", style.icon)} />
                      {style.pulse && !alert.acknowledged && (
                        <motion.div
                          className="absolute inset-0 rounded-xs border-2 border-red-500"
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-white font-mono text-sm mb-1">
                            {alert.title}
                          </h4>
                          <p className="text-[#A1A1AA] text-xs font-mono leading-relaxed">
                            {alert.message}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {/* Severity indicator */}
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 h-3 rounded-full",
                                  i < alert.severity ? style.icon : "bg-[#333]"
                                )}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center space-x-4 text-xs text-[#71717A] font-mono">
                        <span className="uppercase tracking-wider">
                          {alert.category}
                        </span>
                        {alert.flightId && (
                          <>
                            <span>•</span>
                            <span>Flight {alert.flightId}</span>
                          </>
                        )}
                        {alert.location && (
                          <>
                            <span>•</span>
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{alert.location}</span>
                            </div>
                          </>
                        )}
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {ageMinutes === 0 ? 'Just now' :
                             ageMinutes < 60 ? `${ageMinutes}m ago` :
                             `${Math.floor(ageMinutes / 60)}h ago`}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      {alert.actions && alert.actions.length > 0 && !alert.resolved && (
                        <motion.div
                          className="flex items-center space-x-2 mt-3"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          {alert.actions.map((action, actionIndex) => (
                            <motion.button
                              key={actionIndex}
                              onClick={action.action}
                              className={cn(
                                "flex items-center space-x-1 px-3 py-1.5 rounded-xs text-xs font-mono",
                                "uppercase tracking-wider border transition-all duration-200",
                                action.primary
                                  ? "border-[#F04E30] text-[#F04E30] hover:bg-[#F04E30] hover:text-black"
                                  : "border-[#333] text-[#A1A1AA] hover:border-[#444] hover:text-white"
                              )}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span>{action.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </motion.button>
                          ))}
                        </motion.div>
                      )}
                    </div>

                    {/* Status */}
                    {!alert.resolved && (
                      <motion.button
                        className={cn(
                          "p-1 rounded-xs border transition-all duration-200",
                          alert.acknowledged
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-[#333] hover:border-[#444]"
                        )}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {alert.acknowledged ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <div className="w-4 h-4 rounded border-2 border-current" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Progress bar for critical alerts */}
                {alert.type === 'critical' && !alert.acknowledged && (
                  <motion.div
                    className="h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{ originX: 0 }}
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <p className="text-emerald-500 font-mono text-sm">
            All systems operational
          </p>
        </motion.div>
      )}
    </div>
  );
}