'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import CompliancePreviewPanel from '@/components/flights/wizard/CompliancePreviewPanel';

export default function CompliancePlannerPage() {
  const [form, setForm] = useState({
    operator: '',
    tailNumber: '',
    originIcao: '',
    destinationIcao: '',
  });

  const [preview, setPreview] = useState(form);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPreview(form);
  };

  return (
    <div className="flex-1 overflow-auto p-8 space-y-8">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-[0.24em] text-muted-foreground mb-1">
          Compliance Planner
        </p>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight mb-2">
          Scope regulations before creating a flight
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Enter operator, tail number, and proposed route to preview arrival, departure, operator-state, and registry-state obligations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-sm p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
              Operator
            </label>
            <input
              type="text"
              name="operator"
              value={form.operator}
              onChange={handleChange}
              placeholder="NetJets, VistaJet, charter operator"
              className="w-full groove-input rounded-sm px-4 py-3 bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
              Tail Number
            </label>
            <input
              type="text"
              name="tailNumber"
              value={form.tailNumber}
              onChange={handleChange}
              placeholder="N123GZ, 9H-VJA"
              className="w-full groove-input rounded-sm px-4 py-3 bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
              Origin ICAO
            </label>
            <input
              type="text"
              name="originIcao"
              value={form.originIcao}
              onChange={handleChange}
              placeholder="e.g., KTEB"
              className="w-full groove-input rounded-sm px-4 py-3 bg-transparent text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-2 block">
              Destination ICAO
            </label>
            <input
              type="text"
              name="destinationIcao"
              value={form.destinationIcao}
              onChange={handleChange}
              placeholder="e.g., EGLL"
              className="w-full groove-input rounded-sm px-4 py-3 bg-transparent text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-mono uppercase tracking-[0.18em] bg-[#2563EB] text-white rounded-sm hover:bg-[#2563EB]/90"
          >
            Preview Regulations
          </button>
        </div>
      </form>

      <CompliancePreviewPanel
        operator={preview.operator || undefined}
        tailNumber={preview.tailNumber || undefined}
        originIcao={preview.originIcao || null}
        destinationIcao={preview.destinationIcao || null}
      />
    </div>
  );
}
