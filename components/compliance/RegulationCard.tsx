'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { CountryAuthorization } from '@/types/compliance';

type AuthorizationStatus = 'compliant' | 'current' | 'expiring' | 'expired' | 'due_soon' | 'overdue' | 'non-compliant';
import { ExpiryCountdown } from './ExpiryCountdown';

interface RegulationCardProps {
  authorization: CountryAuthorization;
}

function StatusLED({ status }: { status: AuthorizationStatus }) {
  const getStatusColor = () => {
    switch (status) {
      case 'compliant':
      case 'current':
        return 'bg-emerald-500';
      case 'expiring':
      case 'due_soon':
        return 'bg-amber-500';
      case 'non-compliant':
      case 'overdue':
        return 'bg-[#F04E30]';
      default:
        return 'bg-zinc-400';
    }
  };

  return (
    <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
  );
}

export function RegulationCard({ authorization }: RegulationCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link href={`/compliance/countries/${authorization.countryCode}`}>
        <div className="bg-card dark:bg-[#2A2A2A] border border-border hover:border-[#F04E30] rounded-sm p-6 transition-all h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
                {authorization.country}
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">
                {authorization.regulationType}
              </div>
              <div className="text-xs text-muted-foreground">
                {authorization.region}
              </div>
            </div>
            <StatusLED status={authorization.status} />
          </div>

          {/* Expiry Info */}
          <div className="mb-4 flex-1">
            {authorization.expiryDate ? (
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                  Expires In
                </div>
                <ExpiryCountdown expiryDate={authorization.expiryDate} />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic">
                No expiry date
              </div>
            )}
          </div>

          {/* Limitations */}
          {authorization.limitations.length > 0 && (
            <div className="mb-4 pb-4 border-t border-border pt-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">
                Limitations
              </div>
              <ul className="space-y-1">
                {authorization.limitations.slice(0, 2).map((limitation, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-[#2563EB] mt-0.5">•</span>
                    <span className="flex-1">{limitation}</span>
                  </li>
                ))}
                {authorization.limitations.length > 2 && (
                  <li className="text-xs text-muted-foreground">
                    +{authorization.limitations.length - 2} more
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* View Details Link */}
          <div className="flex items-center gap-2 text-[#2563EB] group-hover:text-[#F04E30] text-xs font-medium transition-colors">
            <span>VIEW DETAILS</span>
            <ArrowRight 
              size={14} 
              strokeWidth={1.5} 
              className="group-hover:translate-x-1 transition-transform" 
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
