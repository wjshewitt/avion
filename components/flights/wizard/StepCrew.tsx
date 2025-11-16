'use client';

import { motion } from 'framer-motion';
import { Users, Plus, X } from 'lucide-react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import type { FlightFormValues } from '@/lib/validation/flight';
import CrewManifestCard from '../CrewManifestCard';

export default function StepCrew() {
  const {
    control,
    setValue,
    register,
  } = useFormContext<FlightFormValues>();

  const passengerCount = useWatch({ control, name: 'passengerCount' });
  const crewCount = useWatch({ control, name: 'crewCount' });
  const passengers = useWatch({ control, name: 'passengers' }) || [];

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'passengers',
  });

  const handleCountChange = (value: string, field: 'passengerCount' | 'crewCount') => {
    if (value === '') {
      setValue(field, null, { shouldDirty: true, shouldValidate: true });
      return;
    }

    const parsed = Math.max(0, Number.parseInt(value, 10) || 0);
    setValue(field, parsed, { shouldDirty: true, shouldValidate: true });
  };

  const handleRemovePassenger = (index: number) => {
    remove(index);
    const nextCount = (passengerCount || 0) - 1;
    setValue('passengerCount', nextCount > 0 ? nextCount : null, { shouldDirty: true, shouldValidate: true });
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-1">
          Optional Details
        </p>
        <h2 className="text-xl font-light tracking-tight text-foreground mb-4">
          Crew, passengers &amp; notes
        </h2>
      </div>

      <div className="mb-6 text-[11px] text-muted-foreground border-l-2 border-blue pl-3">
        All fields in this section are optional and can be edited later.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left column: inputs */}
        <div className="space-y-6">
          {/* Crew Count */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Crew
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <div className="groove-input rounded-sm pl-12 pr-4 py-3 flex items-center">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={crewCount ?? ''}
                  onChange={(event) => handleCountChange(event.target.value, 'crewCount')}
                  placeholder="0"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tabular-nums"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Number of crew members on this flight
            </p>
          </div>

          {/* Passenger Count */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Passengers
            </label>
            <div className="relative">
              <Users
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                strokeWidth={1.5}
              />
              <div className="groove-input rounded-sm pl-12 pr-4 py-3 flex items-center">
                <input
                  type="number"
                  min="0"
                  max="999"
                  value={passengerCount ?? ''}
                  onChange={(event) => handleCountChange(event.target.value, 'passengerCount')}
                  placeholder="0"
                  className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none tabular-nums"
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Number of passengers on this flight
            </p>
          </div>

          {/* Passenger Names */}
          {passengerCount && passengerCount > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground">
                  Passenger Names
                </label>
                <button
                  type="button"
                  onClick={() => append({ name: '' })}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-blue hover:bg-blue/10 rounded-sm transition-colors"
                  disabled={!passengerCount || fields.length >= passengerCount}
                >
                  <Plus size={12} />
                  Add Name
                </button>
              </div>
              
              {fields.length === 0 ? (
                <p className="text-xs text-muted-foreground italic mb-3">
                  Optional: Add passenger names for personalized service
                </p>
              ) : (
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          {...register(`passengers.${index}.name` as const)}
                          defaultValue={field.name}
                          placeholder={`Passenger ${index + 1}`}
                          className="w-full groove-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none rounded-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePassenger(index)}
                        className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Notes - Scratchpad Style */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
              Flight Notes
            </label>
            <div className="ceramic rounded-sm overflow-hidden border border-border">
              <div className="bg-zinc-200/50 dark:bg-zinc-800/50 px-4 py-2 border-b border-border flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Scratchpad
                </span>
              </div>
              <textarea
                {...register('notes')}
                placeholder="Additional flight notes, special requirements, or remarks..."
                rows={6}
                className="w-full px-4 py-3 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none resize-none leading-6"
                style={{
                  backgroundImage: 'linear-gradient(transparent 23px, var(--border) 23px)',
                  backgroundSize: '100% 24px',
                  lineHeight: '24px',
                }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Any additional information about this flight
            </p>
          </div>

          {/* Manifest Info Panel */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-border">
            <div>
              <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Crew Manifest
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Individual crew member names and roles can be added after flight creation. 
                For now, a simple count is sufficient.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: live manifest preview */}
        <div className="lg:pl-2">
          <CrewManifestCard
            crewCount={crewCount}
            passengerCount={passengerCount}
            crewMembers={[]}
            passengers={passengers}
          />
        </div>
      </div>
    </motion.div>
  );
}
