'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ComplianceAlert } from '@/types/compliance';

interface AlertBannerProps {
  alert: ComplianceAlert;
  onDismiss?: (alertId: string) => void;
  persistDismissal?: boolean;
}

export function AlertBanner({ alert, onDismiss, persistDismissal = true }: AlertBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (persistDismissal && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(`alert-dismissed-${alert.id}`);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [alert.id, persistDismissal]);

  const handleDismiss = () => {
    if (persistDismissal && typeof window !== 'undefined') {
      localStorage.setItem(`alert-dismissed-${alert.id}`, 'true');
    }
    setIsDismissed(true);
    onDismiss?.(alert.id);
  };

  const getSeverityStyles = () => {
    switch (alert.severity) {
      case 'critical':
        return {
          bg: 'bg-[#F04E30]/10 border-[#F04E30]/20',
          text: 'text-[#F04E30]',
          icon: AlertTriangle,
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-600 dark:text-amber-500',
          icon: AlertCircle,
        };
      case 'info':
        return {
          bg: 'bg-[#2563EB]/10 border-[#2563EB]/20',
          text: 'text-[#2563EB]',
          icon: Info,
        };
    }
  };

  const styles = getSeverityStyles();
  const Icon = styles.icon;

  if (isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`flex items-start gap-3 p-4 border rounded-sm ${styles.bg}`}
      >
        {/* Icon */}
        <Icon size={20} strokeWidth={1.5} className={`flex-shrink-0 mt-0.5 ${styles.text}`} />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className={`text-sm font-semibold ${styles.text}`}>
              {alert.title}
            </h4>
            <button
              onClick={handleDismiss}
              className={`flex-shrink-0 p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${styles.text}`}
              aria-label="Dismiss alert"
            >
              <X size={14} strokeWidth={2} />
            </button>
          </div>
          
          <p className="text-sm text-foreground/80 mb-2">
            {alert.message}
          </p>
          
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-muted-foreground">
              <span className="uppercase tracking-wider">Action: </span>
              <span className="font-semibold text-foreground">{alert.actionRequired}</span>
            </div>
            
            {alert.expiresAt && (
              <div className="text-xs font-mono text-muted-foreground">
                <span className="uppercase tracking-wider">Expires: </span>
                <span className="font-semibold tabular-nums text-foreground">
                  {new Date(alert.expiresAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
