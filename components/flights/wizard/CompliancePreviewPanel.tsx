'use client';

import { ShieldAlert, ShieldCheck } from 'lucide-react';
import type { ComplianceScope } from '@/lib/tanstack/hooks/useComplianceRegulations';
import { useComplianceRegulations } from '@/lib/tanstack/hooks/useComplianceRegulations';

interface CompliancePreviewPanelProps {
  operator?: string;
  tailNumber?: string;
  originIcao?: string | null;
  destinationIcao?: string | null;
}

const scopeMeta: Record<ComplianceScope, { label: string; description: string }> = {
  arrival: {
    label: 'Arrival Regulations',
    description: 'Destination country entry requirements',
  },
  departure: {
    label: 'Departure Regulations',
    description: 'Origin country exit controls',
  },
  state_of_operator: {
    label: 'Operator State',
    description: 'Requirements tied to operator of record',
  },
  state_of_registry: {
    label: 'State of Registry',
    description: 'Tail number & registry-driven rules',
  },
};

export default function CompliancePreviewPanel({
  operator,
  tailNumber,
  originIcao,
  destinationIcao,
}: CompliancePreviewPanelProps) {
  const ready = Boolean(originIcao && destinationIcao);

  const { data, isLoading, isError } = useComplianceRegulations(
    {
      operator,
      tailNumber,
      originIcao: originIcao ?? undefined,
      destinationIcao: destinationIcao ?? undefined,
      scopes: ['arrival', 'departure', 'state_of_operator', 'state_of_registry'],
    },
    { enabled: ready }
  );

  return (
    <div className="border border-border rounded-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
            Compliance Preview
          </p>
          <p className="text-sm text-muted-foreground">
            Automatically scoped by route, operator, and tail number
          </p>
        </div>
        <ShieldAlert size={18} className="text-[#F04E30]" strokeWidth={1.5} />
      </div>

      {!ready && (
        <div className="text-xs text-muted-foreground">
          Select both origin and destination airports to preview arrival/departure regulations.
        </div>
      )}

      {ready && isLoading && (
        <div className="text-xs text-muted-foreground">Loading compliance data…</div>
      )}

      {ready && isError && (
        <div className="text-xs text-red-500">Unable to load compliance data.</div>
      )}

      {ready && data && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(scopeMeta) as ComplianceScope[]).map((scope) => {
            const regulations = data.regulations[scope] ?? [];

            return (
              <div key={scope} className="border border-border rounded-sm p-3 space-y-2">
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                    {scopeMeta[scope].label}
                  </div>
                  <p className="text-xs text-muted-foreground">{scopeMeta[scope].description}</p>
                </div>

                {regulations.length === 0 ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-500">
                    <ShieldCheck size={14} />
                    <span>No blocking regulations detected</span>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {regulations.map((regulation) => (
                      <li key={regulation.id} className="text-xs text-foreground">
                        <div className="font-semibold">{regulation.title}</div>
                        {regulation.summary && (
                          <p className="text-muted-foreground mt-0.5">
                            {regulation.summary}
                          </p>
                        )}
                        {regulation.compliance_action && (
                          <p className="text-[11px] text-[#F04E30] mt-1">
                            Action: {regulation.compliance_action}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
