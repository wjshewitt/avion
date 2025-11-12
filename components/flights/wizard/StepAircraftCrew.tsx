'use client';

import { motion } from 'framer-motion';
import { Plane, Users } from 'lucide-react';

interface StepAircraftCrewProps {
  operator: string;
  aircraft: string;
  passengerCount: number | null;
  crewCount: number | null;
  notes: string;
  onOperatorChange: (value: string) => void;
  onAircraftChange: (value: string) => void;
  onPassengerCountChange: (value: number | null) => void;
  onCrewCountChange: (value: number | null) => void;
  onNotesChange: (value: string) => void;
}

export default function StepAircraftCrew({
  operator,
  aircraft,
  passengerCount,
  crewCount,
  notes,
  onOperatorChange,
  onAircraftChange,
  onPassengerCountChange,
  onCrewCountChange,
  onNotesChange,
}: StepAircraftCrewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-4 p-3 bg-surface border-l-4 border-blue">
        <p className="text-sm text-text-secondary">
          All fields optional. Skip to review if you don&apos;t have this information yet.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Operator */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Operator
          </label>
          <input
            type="text"
            value={operator}
            onChange={(e) => onOperatorChange(e.target.value)}
            placeholder="e.g., NetJets, Vista Jet, Private"
            className="w-full h-10 px-4 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue"
          />
          <p className="mt-2 text-xs text-text-secondary">
            The operating company or charter service
          </p>
        </div>

        {/* Aircraft */}
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Aircraft Type
          </label>
          <div className="relative">
            <Plane
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              value={aircraft}
              onChange={(e) => onAircraftChange(e.target.value)}
              placeholder="e.g., G550, Citation X, King Air 350"
              className="w-full h-10 pl-10 pr-4 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue"
            />
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            Aircraft model or type designation
          </p>
        </div>

        {/* Passenger Count */}
        <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Passengers
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="number"
                min="0"
                max="999"
                value={passengerCount ?? ''}
                onChange={(e) =>
                  onPassengerCountChange(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                placeholder="0"
                className="w-full h-10 pl-10 pr-4 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
        </div>

        {/* Crew Count */}
        <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
              Crew
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <input
                type="number"
                min="0"
                max="99"
                value={crewCount ?? ''}
                onChange={(e) =>
                  onCrewCountChange(
                    e.target.value ? parseInt(e.target.value, 10) : null
                  )
                }
                placeholder="0"
                className="w-full h-10 pl-10 pr-4 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue"
              />
            </div>
        </div>

        {/* Notes - full width */}
        <div className="col-span-2">
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Additional flight notes, special requirements, or remarks..."
            rows={4}
            className="w-full px-4 py-3 border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blue resize-none"
          />
          <p className="mt-2 text-xs text-text-secondary">
            Any additional information about this flight
          </p>
        </div>
      </div>
    </motion.div>
  );
}
