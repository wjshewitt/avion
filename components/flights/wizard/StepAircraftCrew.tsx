"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plane } from "lucide-react";
import { InteractiveManifest } from "./InteractiveManifest";
import { ScratchpadInput } from "./ScratchpadInput";

// Define types for crew and passengers within the component
type CrewMember = {
  id: string;
  name: string;
  role: "PIC" | "SIC" | "FA" | "Other";
};

type Passenger = {
  id: string;
  name: string;
};

interface StepAircraftCrewProps {
  operator: string;
  aircraft: string;
  notes: string;
  onOperatorChange: (value: string) => void;
  onAircraftChange: (value: string) => void;
  onCrewCountChange: (value: number | null) => void;
  onPassengerCountChange: (value: number | null) => void;
  onNotesChange: (value: string) => void;
}

export default function StepAircraftCrew({
  operator,
  aircraft,
  notes,
  onOperatorChange,
  onAircraftChange,
  onCrewCountChange,
  onPassengerCountChange,
  onNotesChange,
}: StepAircraftCrewProps) {
  // Local state to manage the detailed lists for the interactive component
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);

  const handleCrewChange = (newCrew: CrewMember[]) => {
    setCrewMembers(newCrew);
    onCrewCountChange(newCrew.length);
  };

  const handlePassengersChange = (newPassengers: Passenger[]) => {
    setPassengers(newPassengers);
    onPassengerCountChange(newPassengers.length);
  };

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
          Step 4
        </p>
        <h2 className="text-xl font-light tracking-tight text-foreground mb-4">
          Aircraft, Crew & Notes
        </h2>
        <div className="text-sm text-muted-foreground border-l-2 border-blue-500 pl-4">
          All fields in this section are optional and can be added or edited later.
        </div>
      </div>

      <div className="space-y-8">
        {/* AIRCRAFT & OPERATOR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Operator
            </label>
            <div className="groove p-2 flex items-center gap-2">
              <input
                type="text"
                value={operator}
                onChange={(e) => onOperatorChange(e.target.value)}
                placeholder="e.g., NetJets, Vista Jet"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Aircraft Type
            </label>
            <div className="groove p-2 flex items-center gap-2">
              <Plane size={14} className="text-muted-foreground" />
              <input
                type="text"
                value={aircraft}
                onChange={(e) => onAircraftChange(e.target.value)}
                placeholder="e.g., G550, Citation X"
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* INTERACTIVE MANIFEST */}
        <InteractiveManifest
          initialCrew={crewMembers}
          initialPassengers={passengers}
          onCrewChange={handleCrewChange}
          onPassengersChange={handlePassengersChange}
        />

        {/* NOTES */}
        <ScratchpadInput
          label="Flight Notes"
          value={notes}
          onChange={onNotesChange}
          placeholder="Additional flight notes, special requirements, or remarks..."
        />
      </div>
    </motion.div>
  );
}
