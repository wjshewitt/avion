'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { AvionCard } from '@/components/ui/avion-card';
import { Check, AlertTriangle, XCircle, Info } from 'lucide-react';

export interface ComplianceCheckItem {
  id: string;
  category: 'CABOTAGE' | 'PERMITS' | 'CREW DUTY' | 'DOCS' | 'RESTRICTIONS';
  label: string;
  status: 'OK' | 'REVIEW' | 'WARNING' | 'FAIL' | 'INFO';
  detail: string;
  reference?: string;
}

interface ComplianceStatusMatrixProps {
  checks: ComplianceCheckItem[];
  className?: string;
}

export function ComplianceStatusMatrix({ checks, className }: ComplianceStatusMatrixProps) {
  const getStatusColor = (status: ComplianceCheckItem['status']) => {
    switch (status) {
      case 'OK': return 'text-emerald-600 dark:text-emerald-500';
      case 'REVIEW': return 'text-amber-600 dark:text-amber-500';
      case 'WARNING': return 'text-[#F04E30]'; // Safety Orange
      case 'FAIL': return 'text-[#F04E30]';
      case 'INFO': return 'text-[#2563EB]'; // Info Blue
      default: return 'text-zinc-500';
    }
  };

  const getStatusIcon = (status: ComplianceCheckItem['status']) => {
    switch (status) {
      case 'OK': return <Check size={14} strokeWidth={2} />;
      case 'REVIEW': return <AlertTriangle size={14} strokeWidth={2} />;
      case 'WARNING': return <AlertTriangle size={14} strokeWidth={2} />;
      case 'FAIL': return <XCircle size={14} strokeWidth={2} />;
      case 'INFO': return <Info size={14} strokeWidth={2} />;
      default: return null;
    }
  };

  return (
    <AvionCard variant="ceramic" className={cn("p-0 overflow-hidden", className)}>
      <div className="border-b border-zinc-200 dark:border-[#333] bg-zinc-50/50 dark:bg-[#222] px-6 py-3 flex justify-between items-center">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400">
          COMPLIANCE MATRIX
        </div>
        <div className="text-[10px] font-mono text-zinc-400">
          REF: {new Date().toLocaleDateString('en-GB').toUpperCase().replace(/\//g, '.')}
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-[#333]">
        {checks.map((check) => (
          <div key={check.id} className="flex items-start gap-4 px-6 py-4 hover:bg-zinc-50/50 dark:hover:bg-[#252525] transition-colors">
            {/* Status Indicator */}
            <div className={cn(
              "flex items-center gap-2 min-w-[100px] pt-0.5",
              getStatusColor(check.status)
            )}>
              {getStatusIcon(check.status)}
              <span className="text-xs font-mono font-bold tracking-wider">
                [{check.status}]
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
               {/* Category */}
              <div className="md:col-span-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                  {check.category}
                </span>
              </div>

              {/* Label & Detail */}
              <div className="md:col-span-7">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-200 mb-0.5">
                  {check.label}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {check.detail}
                </div>
              </div>

              {/* Reference */}
              <div className="md:col-span-3 text-right">
                {check.reference && (
                  <span className="inline-block px-2 py-1 border border-zinc-200 dark:border-[#444] rounded-[2px] text-[10px] font-mono text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer">
                    {check.reference}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {checks.length === 0 && (
        <div className="p-8 text-center text-zinc-400 text-sm font-mono">
          NO ACTIVE CHECKS
        </div>
      )}
    </AvionCard>
  );
}
