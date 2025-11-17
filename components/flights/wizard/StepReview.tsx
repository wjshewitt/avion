'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, Calendar, Users, Edit2 } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import type { FlightFormValues } from '@/lib/validation/flight';
import CompliancePreviewPanel from './CompliancePreviewPanel';

interface StepReviewProps {
  onEdit: (step: number) => void;
}

export default function StepReview({ onEdit }: StepReviewProps) {
  const { control } = useFormContext<FlightFormValues>();
  const data = useWatch({ control }) as FlightFormValues;

  const formatDateTime = (isoString: string): string => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    'On Time': 'text-green',
    Delayed: 'text-amber',
    Cancelled: 'text-red',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="text-center">
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-1">
          Final Check
        </p>
        <h3 className="text-xl font-light tracking-tight text-foreground">Review your flight</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Verify all information before creating.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Flight Code & Status */}
        <div className="ceramic p-4 rounded-sm border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plane size={18} className="text-blue" />
              <h4 className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Flight Information
              </h4>
            </div>
            <button
              onClick={() => onEdit(1)}
              className="text-[10px] font-mono uppercase tracking-[0.18em] text-blue hover:underline flex items-center gap-1"
            >
              <Edit2 size={12} />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Flight Code</div>
              <div className="text-lg font-mono tabular-nums font-bold text-foreground">
                {data.flightCode}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Status</div>
              <div className={`text-sm font-semibold ${statusColors[data.status]}`}>
                {data.status}
              </div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="ceramic p-4 rounded-sm border border-border">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-blue" />
              <h4 className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Route
              </h4>
            </div>
            <button
              onClick={() => onEdit(2)}
              className="text-[10px] font-mono uppercase tracking-[0.18em] text-blue hover:underline flex items-center gap-1"
            >
              <Edit2 size={12} />
              Edit
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Origin</div>
              <div className="font-mono font-semibold text-foreground">
                {data.origin?.icao}
                {data.origin?.iata && ` (${data.origin.iata})`}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {data.origin?.name}
              </div>
            </div>
            <div className="text-blue font-bold text-xl">→</div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground mb-1">Destination</div>
              <div className="font-mono font-semibold text-foreground">
                {data.destination?.icao}
                {data.destination?.iata && ` (${data.destination.iata})`}
              </div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {data.destination?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="ceramic p-4 rounded-sm border border-border md:col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue" />
              <h4 className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                Schedule
              </h4>
            </div>
            <button
              onClick={() => onEdit(3)}
              className="text-[10px] font-mono uppercase tracking-[0.18em] text-blue hover:underline flex items-center gap-1"
            >
              <Edit2 size={12} />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Departure</div>
              <div className="text-sm font-mono text-foreground">
                {formatDateTime(data.scheduledAt)}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Arrival</div>
              <div className="text-sm font-mono text-foreground">
                {formatDateTime(data.arrivalAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft (if provided) */}
        {(data.operator || data.tailNumber || data.aircraft) && (
          <div className="ceramic p-4 rounded-sm border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Plane size={18} className="text-blue" />
                <h4 className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                  Aircraft
                </h4>
              </div>
              <button
                onClick={() => onEdit(4)}
                className="text-[10px] font-mono uppercase tracking-[0.18em] text-blue hover:underline flex items-center gap-1"
              >
                <Edit2 size={12} />
                Edit
              </button>
            </div>
            <div className="space-y-3">
              {data.operator && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Operator</div>
                  <div className="text-sm text-foreground">{data.operator}</div>
                </div>
              )}
              {data.tailNumber && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Tail Number</div>
                  <div className="text-sm text-foreground">{data.tailNumber}</div>
                </div>
              )}
              {data.aircraft && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Aircraft Type</div>
                  <div className="text-sm text-foreground">{data.aircraft}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Crew & Passengers (if provided) */}
        {(data.passengerCount !== null || data.crewCount !== null || data.notes) && (
          <div className="ceramic p-4 rounded-sm border border-border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue" />
                <h4 className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground">
                  Crew &amp; Passengers
                </h4>
              </div>
              <button
                onClick={() => onEdit(5)}
                className="text-[10px] font-mono uppercase tracking-[0.18em] text-blue hover:underline flex items-center gap-1"
              >
                <Edit2 size={12} />
                Edit
              </button>
            </div>
            <div className="space-y-3">
              {(data.crewCount !== null || data.passengerCount !== null) && (
                <div className="grid grid-cols-2 gap-4">
                  {data.crewCount !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Crew</div>
                      <div className="text-sm font-mono text-foreground tabular-nums">
                        {data.crewCount}
                      </div>
                    </div>
                  )}
                  {data.passengerCount !== null && (
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Passengers</div>
                      <div className="text-sm font-mono text-foreground tabular-nums">
                        {data.passengerCount}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {data.notes && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Flight Notes</div>
                  <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {data.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <CompliancePreviewPanel
        operator={data.operator || undefined}
        tailNumber={data.tailNumber || undefined}
        originIcao={data.origin?.icao ?? null}
        destinationIcao={data.destination?.icao ?? null}
      />
    </motion.div>
  );
}
