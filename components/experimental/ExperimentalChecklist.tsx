"use client";

import { useState } from "react";
import MechanicalSwitch from "@/components/avion/MechanicalSwitch";

type ChecklistItem = {
  id: string;
  label: string;
};

const defaultItems: ChecklistItem[] = [
  { id: "power", label: "Power · Battery / Avionics" },
  { id: "fuel", label: "Fuel · Quantity / Pumps" },
  { id: "lights", label: "Exterior Lighting" },
  { id: "briefing", label: "Departure Briefing" },
];

export function ExperimentalChecklist() {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const completeCount = defaultItems.filter((item) => completed[item.id]).length;

  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="space-y-2">
        {defaultItems.map((item) => (
          <MechanicalSwitch
            key={item.id}
            label={item.label}
            isOn={Boolean(completed[item.id])}
            onToggle={(isOn) => {
              setCompleted((prev) => ({ ...prev, [item.id]: isOn }));
            }}
          />
        ))}
      </div>

      <div className="border-t border-[#333] pt-3 text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA] flex items-center justify-between">
        <span>CHECKLIST STATUS</span>
        <span className="tabular-nums text-white">
          {completeCount} / {defaultItems.length} COMPLETE
        </span>
      </div>
    </div>
  );
}
