'use client';

import { motion } from 'framer-motion';
import { Plane, MapPin, Calendar, Users, Edit2 } from 'lucide-react';

interface Airport {
  icao: string;
  iata?: string;
  name: string;
}

interface StepReviewProps {
  data: {
    flightCode: string;
    status: 'On Time' | 'Delayed' | 'Cancelled';
    origin: Airport | null;
    destination: Airport | null;
    scheduledAt: string;
    arrivalAt: string;
    operator: string;
    aircraft: string;
    passengerCount: number | null;
    crewCount: number | null;
    notes: string;
  };
  onEdit: (step: number) => void;
}

export default function StepReview({ data, onEdit }: StepReviewProps) {
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
      className="max-w-6xl mx-auto"
    >
      <div className="mb-4 text-center">
        <h3 className="text-lg font-semibold text-text-primary">Review Your Flight</h3>
        <p className="text-sm text-text-secondary mt-1">
          Verify all information before creating
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Flight Code & Status */}
        <div className="border border-border bg-white p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plane size={18} className="text-blue" />
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Flight Information
              </h4>
            </div>
            <button
              onClick={() => onEdit(1)}
              className="text-blue hover:underline flex items-center gap-1 text-xs"
            >
              <Edit2 size={12} />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-text-secondary mb-1">Flight Code</div>
              <div className="text-lg font-mono font-bold text-text-primary">
                {data.flightCode}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Status</div>
              <div className={`text-sm font-semibold ${statusColors[data.status]}`}>
                {data.status}
              </div>
            </div>
          </div>
        </div>

        {/* Route */}
        <div className="border border-border bg-white p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-blue" />
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Route
              </h4>
            </div>
            <button
              onClick={() => onEdit(2)}
              className="text-blue hover:underline flex items-center gap-1 text-xs"
            >
              <Edit2 size={12} />
              Edit
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-xs text-text-secondary mb-1">Origin</div>
              <div className="font-mono font-semibold text-text-primary">
                {data.origin?.icao}
                {data.origin?.iata && ` (${data.origin.iata})`}
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                {data.origin?.name}
              </div>
            </div>
            <div className="text-blue font-bold text-xl">→</div>
            <div className="flex-1">
              <div className="text-xs text-text-secondary mb-1">Destination</div>
              <div className="font-mono font-semibold text-text-primary">
                {data.destination?.icao}
                {data.destination?.iata && ` (${data.destination.iata})`}
              </div>
              <div className="text-sm text-text-secondary mt-0.5">
                {data.destination?.name}
              </div>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="border border-border bg-white p-4 col-span-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue" />
              <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                Schedule
              </h4>
            </div>
            <button
              onClick={() => onEdit(3)}
              className="text-blue hover:underline flex items-center gap-1 text-xs"
            >
              <Edit2 size={12} />
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-text-secondary mb-1">Departure</div>
              <div className="text-sm font-mono text-text-primary">
                {formatDateTime(data.scheduledAt)}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-secondary mb-1">Arrival</div>
              <div className="text-sm font-mono text-text-primary">
                {formatDateTime(data.arrivalAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Aircraft & Crew (if provided) */}
        {(data.operator || data.aircraft || data.passengerCount !== null || data.crewCount !== null || data.notes) && (
          <div className="border border-border bg-white p-4 col-span-2">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-blue" />
                <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide">
                  Aircraft & Crew
                </h4>
              </div>
              <button
                onClick={() => onEdit(4)}
                className="text-blue hover:underline flex items-center gap-1 text-xs"
              >
                <Edit2 size={12} />
                Edit
              </button>
            </div>
            <div className="space-y-3">
              {data.operator && (
                <div>
                  <div className="text-xs text-text-secondary mb-1">Operator</div>
                  <div className="text-sm text-text-primary">{data.operator}</div>
                </div>
              )}
              {data.aircraft && (
                <div>
                  <div className="text-xs text-text-secondary mb-1">Aircraft</div>
                  <div className="text-sm text-text-primary">{data.aircraft}</div>
                </div>
              )}
              {(data.passengerCount !== null || data.crewCount !== null) && (
                <div className="grid grid-cols-2 gap-4">
                  {data.passengerCount !== null && (
                    <div>
                      <div className="text-xs text-text-secondary mb-1">Passengers</div>
                      <div className="text-sm font-mono text-text-primary">
                        {data.passengerCount}
                      </div>
                    </div>
                  )}
                  {data.crewCount !== null && (
                    <div>
                      <div className="text-xs text-text-secondary mb-1">Crew</div>
                      <div className="text-sm font-mono text-text-primary">
                        {data.crewCount}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {data.notes && (
                <div>
                  <div className="text-xs text-text-secondary mb-1">Notes</div>
                  <div className="text-sm text-text-primary whitespace-pre-wrap">
                    {data.notes}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
