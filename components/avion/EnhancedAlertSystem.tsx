"use client";

import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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
  Archive,
  Activity,
  Wifi,
  WifiOff,
  Shield,
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success' | 'system';
  category: 'weather' | 'operational' | 'crew' | 'maintenance' | 'security' | 'schedule' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  flightId?: string;
  location?: string;
  severity: number; // 1-5
  acknowledged: boolean;
  resolved: boolean;
  source?: string;
  metadata?: Record<string, any>;
  actions?: Array<{
    label: string;
    action: () => void;
    primary?: boolean;
    icon?: any;
  }>;
  timeline?: Array<{
    time: Date;
    event: string;
    type: 'update' | 'action' | 'resolution';
  }>;
}

interface EnhancedAlertSystemProps {
  alerts: Alert[];
  className?: string;
}

export default function EnhancedAlertSystem({ alerts, className }: EnhancedAlertSystemProps) {
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollY = useMotionValue(0);
  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ["rgba(26, 26, 26, 0)", "rgba(26, 26, 26, 0.95)"]
  );

  useEffect(() => {
    let filtered = alerts;

    if (selectedType) {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    if (!showArchived) {
      filtered = filtered.filter(alert => !alert.resolved);
    }

    filtered.sort((a, b) => {
      if (a.acknowledged !== b.acknowledged) return a.acknowledged ? 1 : -1;
      if (a.severity !== b.severity) return b.severity - a.severity;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    setFilteredAlerts(filtered);
  }, [alerts, selectedType, showArchived]);

  const getAlertStyle = (type: string) => {
    const styles = {
      critical: {
        bg: 'bg-red-500/5',
        border: 'border-red-500/20',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.3)]',
        icon: 'text-red-500',
        iconBg: 'bg-gradient-to-br from-red-600 to-red-500',
        pulse: 'animate-pulse',
        gradient: 'from-red-600/20 via-red-500/10 to-transparent'
      },
      warning: {
        bg: 'bg-amber-500/5',
        border: 'border-amber-500/20',
        glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
        icon: 'text-amber-500',
        iconBg: 'bg-gradient-to-br from-amber-600 to-amber-500',
        pulse: '',
        gradient: 'from-amber-600/20 via-amber-500/10 to-transparent'
      },
      info: {
        bg: 'bg-blue-500/5',
        border: 'border-blue-500/20',
        glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
        icon: 'text-blue-500',
        iconBg: 'bg-gradient-to-br from-blue-600 to-blue-500',
        pulse: '',
        gradient: 'from-blue-600/20 via-blue-500/10 to-transparent'
      },
      success: {
        bg: 'bg-emerald-500/5',
        border: 'border-emerald-500/20',
        glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
        icon: 'text-emerald-500',
        iconBg: 'bg-gradient-to-br from-emerald-600 to-emerald-500',
        pulse: '',
        gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent'
      },
      system: {
        bg: 'bg-violet-500/5',
        border: 'border-violet-500/20',
        glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
        icon: 'text-violet-500',
        iconBg: 'bg-gradient-to-br from-violet-600 to-violet-500',
        pulse: '',
        gradient: 'from-violet-600/20 via-violet-500/10 to-transparent'
      }
    };
    return styles[type as keyof typeof styles] || styles.system;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      weather: CloudSnow,
      crew: Users,
      operational: Plane,
      maintenance: Zap,
      security: Shield,
      schedule: Clock,
      system: Activity
    };
    return icons[category as keyof typeof icons] || AlertCircle;
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
      success: counts.success || 0,
      system: counts.system || 0
    };
  };

  const typeCounts = getTypeCounts();
  const stats = {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    unresolved: alerts.filter(a => !a.resolved).length,
    critical: typeCounts.critical
  };

  return (
    <div className={cn("relative", className)}>
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header with Real-time Stats */}
      <motion.div
        className="relative z-10 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <motion.div
              className="relative"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 3 }}
            >
              <div className="p-3 bg-gradient-to-br from-[#F04E30] to-[#F04E30]/80 rounded-xl">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              {stats.critical > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="absolute inset-0 rounded-full bg-red-500 animate-ping" />
                </motion.div>
              )}
            </motion.div>
            <div>
              <h2 className="text-2xl font-mono font-bold text-white tracking-tight">
                ALERT CONTROL
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                Real-time Monitoring System
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                soundEnabled ? "bg-[#F04E30]/10 text-[#F04E30]" : "bg-[#333] text-[#71717A]"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {soundEnabled ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            </motion.button>
            <motion.div className="px-4 py-2 bg-gradient-to-r from-[#F04E30]/20 to-transparent rounded-lg">
              <span className="text-xs font-mono text-[#F04E30] uppercase tracking-wider">
                System Online
              </span>
            </motion.div>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Activity, color: 'from-zinc-600 to-zinc-500' },
            { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: 'from-red-600 to-red-500' },
            { label: 'Warning', value: typeCounts.warning, icon: AlertCircle, color: 'from-amber-600 to-amber-500' },
            { label: 'Pending', value: stats.unacknowledged, icon: Clock, color: 'from-blue-600 to-blue-500' },
            { label: 'Resolved', value: alerts.filter(a => a.resolved).length, icon: Check, color: 'from-emerald-600 to-emerald-500' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="relative overflow-hidden rounded-lg border border-[#333] bg-[#1A1A1A] p-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: 'currentColor' }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                      {stat.label}
                    </span>
                    <Icon className="w-4 h-4 text-[#71717A]" />
                  </div>
                  <motion.div
                    className="text-2xl font-mono text-white tabular-nums"
                    key={stat.value}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Filter Bar with Glass Effect */}
      <motion.div
        className="sticky top-0 z-20 backdrop-blur-xl bg-[#1A1A1A]/80 border border-[#333] rounded-lg p-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="w-4 h-4 text-[#71717A]" />
            <div className="flex space-x-2">
              {Object.entries(typeCounts).map(([type, count]) => {
                const style = getAlertStyle(type);
                const isActive = selectedType === type;

                return (
                  <motion.button
                    key={type}
                    onClick={() => setSelectedType(isActive ? null : type)}
                    disabled={count === 0}
                    className={cn(
                      "relative px-4 py-2 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all duration-300",
                      isActive
                        ? `${style.bg} border-current ${style.icon} shadow-lg`
                        : count > 0
                        ? "bg-[#2A2A2A] border-[#333] hover:border-[#444] text-white"
                        : "bg-[#1A1A1A] border-[#333] opacity-50 cursor-not-allowed text-[#71717A]"
                    )}
                    whileHover={count > 0 ? { scale: 1.05, y: -2 } : {}}
                    whileTap={count > 0 ? { scale: 0.95 } : {}}
                  >
                    {isActive && (
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-r ${style.gradient} rounded-lg`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                    <span className="relative">{type}</span>
                    <span className="ml-2 relative">
                      ({count})
                    </span>
                    {count > 0 && !isActive && type === 'critical' && (
                      <motion.div
                        className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>

          <motion.button
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-lg border font-mono text-xs uppercase tracking-wider transition-all duration-300",
              showArchived
                ? "bg-[#F04E30]/10 border-[#F04E30]/50 text-[#F04E30]"
                : "bg-[#2A2A2A] border-[#333] hover:border-[#444] text-white"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Archive className="w-3 h-3" />
            <span>{showArchived ? 'Hide' : 'Show'} Resolved</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Alerts Feed with Scroll Effects */}
      <div
        ref={scrollContainerRef}
        className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-[#1A1A1A] scrollbar-thumb-[#444]"
        onScroll={(e) => scrollY.set(e.currentTarget.scrollTop)}
      >
        <AnimatePresence mode="popLayout">
          {filteredAlerts.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="relative inline-block">
                <motion.div
                  className="absolute inset-0 bg-emerald-500 rounded-full blur-2xl opacity-20"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <Check className="relative w-16 h-16 text-emerald-500 mx-auto mb-4" />
              </div>
              <h3 className="text-xl font-mono text-white mb-2">All Clear</h3>
              <p className="text-[#A1A1AA] font-mono text-sm">
                No active alerts in the system
              </p>
            </motion.div>
          ) : (
            filteredAlerts.map((alert, index) => {
              const style = getAlertStyle(alert.type);
              const CategoryIcon = getCategoryIcon(alert.category);
              const isExpanded = expandedAlert === alert.id;
              const ageMinutes = Math.floor((new Date().getTime() - alert.timestamp.getTime()) / 60000);

              return (
                <motion.div
                  key={alert.id}
                  className={cn(
                    "relative group border rounded-xl overflow-hidden backdrop-blur-sm transition-all duration-300",
                    style.bg,
                    style.border,
                    style.glow,
                    alert.acknowledged && !alert.resolved ? "opacity-60" : "",
                    alert.resolved ? "opacity-30 grayscale" : ""
                  )}
                  initial={{ opacity: 0, x: -50, scale: 0.95 }}
                  animate={{
                    opacity: alert.resolved ? 0.3 : (alert.acknowledged ? 0.6 : 1),
                    x: 0,
                    scale: 1
                  }}
                  exit={{ opacity: 0, x: 50, scale: 0.95 }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 20,
                    delay: index * 0.05
                  }}
                  whileHover={!alert.resolved ? {
                    scale: 1.01,
                    x: 5,
                    boxShadow: style.glow
                  } : {}}
                  layout
                >
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${style.gradient} opacity-30`} />

                  {/* Alert Header */}
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        {/* Icon with Animated Ring */}
                        <div className="relative">
                          <div className={cn(
                            "p-3 rounded-xl border shadow-lg relative",
                            style.iconBg,
                            style.border
                          )}>
                            <CategoryIcon className="w-6 h-6 text-white" />
                          </div>
                          {alert.type === 'critical' && !alert.acknowledged && (
                            <motion.div
                              className={`absolute inset-0 rounded-xl border-2 ${style.icon.replace('text-', 'border-')}`}
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-mono font-bold text-white">
                              {alert.title}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    i < alert.severity ? style.icon : "bg-[#333]"
                                  )}
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 + i * 0.1 }}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[#A1A1AA] font-mono text-sm leading-relaxed mb-3">
                            {alert.message}
                          </p>

                          {/* Metadata */}
                          <div className="flex items-center space-x-4 text-xs">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-[#71717A]" />
                              <span className="text-[#71717A] font-mono">
                                {ageMinutes === 0 ? 'Just now' :
                                 ageMinutes < 60 ? `${ageMinutes}m ago` :
                                 `${Math.floor(ageMinutes / 60)}h ago`}
                              </span>
                            </div>
                            {alert.flightId && (
                              <>
                                <span className="text-[#71717A]">•</span>
                                <span className="text-white font-mono">
                                  Flight {alert.flightId}
                                </span>
                              </>
                            )}
                            {alert.source && (
                              <>
                                <span className="text-[#71717A]">•</span>
                                <span className="text-[#A1A1AA] font-mono">
                                  {alert.source}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        {!alert.resolved && (
                          <>
                            <motion.button
                              onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                              className="p-2 text-[#71717A] hover:text-white transition-colors"
                              whileHover={{ scale: 1.1, rotate: 90 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ChevronRight className={cn(
                                "w-5 h-5 transition-transform duration-200",
                                isExpanded && "rotate-90"
                              )} />
                            </motion.button>
                            <motion.div
                              className={cn(
                                "p-2 rounded-lg border",
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
                            </motion.div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {alert.actions && alert.actions.length > 0 && !alert.resolved && (
                      <motion.div
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {alert.actions.map((action, actionIndex) => {
                          const ActionIcon = action.icon;
                          return (
                            <motion.button
                              key={actionIndex}
                              onClick={action.action}
                              className={cn(
                                "flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider border transition-all duration-200",
                                action.primary
                                  ? "bg-[#F04E30]/10 border-[#F04E30]/50 text-[#F04E30] hover:bg-[#F04E30] hover:text-black shadow-lg"
                                  : "bg-[#2A2A2A] border-[#333] text-[#A1A1AA] hover:border-[#444] hover:text-white"
                              )}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              {ActionIcon && <ActionIcon className="w-3 h-3" />}
                              <span>{action.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    )}
                  </div>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && alert.timeline && (
                      <motion.div
                        className="border-t border-[#333] bg-[#1A1A1A]/50 backdrop-blur-sm p-6"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h5 className="text-xs font-mono uppercase tracking-widest text-[#71717A] mb-4">
                          Event Timeline
                        </h5>
                        <div className="space-y-3">
                          {alert.timeline.map((event, idx) => (
                            <motion.div
                              key={idx}
                              className="flex items-start space-x-3"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              <div className={cn(
                                "w-2 h-2 rounded-full mt-1.5",
                                event.type === 'resolution' ? 'bg-emerald-500' :
                                event.type === 'action' ? 'bg-blue-500' :
                                'bg-[#71717A]'
                              )} />
                              <div>
                                <p className="text-white font-mono text-sm">
                                  {event.event}
                                </p>
                                <p className="text-[10px] font-mono text-[#71717A] uppercase tracking-wider">
                                  {event.time.toLocaleTimeString()}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Scanning Effect for Critical */}
                  {alert.type === 'critical' && !alert.acknowledged && (
                    <motion.div
                      className="absolute inset-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"
                      initial={{ scaleX: 0, x: '-100%' }}
                      animate={{ scaleX: 1, x: '100%' }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      style={{ originX: 0 }}
                    />
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-30"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="relative p-4 bg-[#F04E30] rounded-full shadow-2xl group"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bell className="w-6 h-6 text-white" />
          {stats.critical > 0 && (
            <motion.div
              className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <span className="text-xs font-mono text-black">
                {stats.critical}
              </span>
            </motion.div>
          )}
          <div className="absolute inset-0 rounded-full bg-[#F04E30] blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
        </motion.button>
      </motion.div>
    </div>
  );
}