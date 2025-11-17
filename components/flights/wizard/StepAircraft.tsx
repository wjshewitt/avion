'use client';

import { motion } from 'framer-motion';
import { Plane } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import type { FlightFormValues } from '@/lib/validation/flight';
import OperatorAutocomplete from '@/components/ui/OperatorAutocomplete';

export default function StepAircraft() {
  const { setValue, watch } = useFormContext<FlightFormValues>();
  const operator = watch('operator') || '';
  const tailNumber = watch('tailNumber') || '';
  const aircraft = watch('aircraft') || '';

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-1">
          Optional Details
        </p>
        <h2 className="text-xl font-light tracking-tight text-foreground mb-4">
          Aircraft details
        </h2>
      </div>

      <div className="mb-6 text-[11px] text-muted-foreground border-l-2 border-blue pl-3">
        All fields in this section are optional and can be edited later.
      </div>

      <div className="space-y-8">
        {/* Operator Search */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Operator
          </label>
          <OperatorAutocomplete
            value={operator}
            onChange={(value) => setValue('operator', value, { shouldDirty: true, shouldValidate: true })}
            placeholder="e.g., NetJets, VistaJet, Private"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            The operating company or charter service
          </p>
        </div>

        {/* Tail Number */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Tail Number
          </label>
          <div className="relative">
            <Plane
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <div className="groove-input rounded-sm pl-12 pr-4 py-3 flex items-center">
              <input
                type="text"
                value={tailNumber}
                onChange={(event) =>
                  setValue('tailNumber', event.target.value, { shouldDirty: true, shouldValidate: true })
                }
                placeholder="e.g., N123GZ, 9H-VJA"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Used to determine registry obligations tied to the State of Registry scope
          </p>
        </div>

        {/* Aircraft Type */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-[0.14em] text-muted-foreground mb-2">
            Aircraft Type
          </label>
          <div className="relative">
            <Plane
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.5}
            />
            <div className="groove-input rounded-sm pl-12 pr-4 py-3 flex items-center">
              <input
                type="text"
                value={aircraft}
                onChange={(event) => setValue('aircraft', event.target.value, { shouldDirty: true, shouldValidate: true })}
                placeholder="e.g., G550, Citation X, King Air 350"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Aircraft model or type designation
          </p>
        </div>

        {/* Info Panel */}
        <div className="ceramic p-6 rounded-sm border border-border">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <Plane size={18} className="text-zinc-600 dark:text-zinc-400" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Aircraft Information
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                Aircraft details help us provide tailored briefings including performance data, 
                weight & balance considerations, and specific operational limits for your aircraft type.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
