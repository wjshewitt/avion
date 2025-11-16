"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, User, Users, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type CrewMember = {
  id: string;
  name: string;
  role: "PIC" | "SIC" | "FA" | "Other";
};

type Passenger = {
  id: string;
  name: string;
};

interface InteractiveManifestProps {
  initialCrew: CrewMember[];
  initialPassengers: Passenger[];
  onCrewChange: (crew: CrewMember[]) => void;
  onPassengersChange: (passengers: Passenger[]) => void;
}

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <div className="flex items-center justify-between">
    <h4 className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
      {title}
    </h4>
    <span className="text-xs font-mono text-zinc-500">{count}</span>
  </div>
);

const AddItemButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <Button
    variant="ghost"
    size="sm"
    className="w-full justify-start text-xs text-zinc-500 hover:text-[#F04E30] hover:bg-transparent"
    onClick={onClick}
  >
    <Plus size={14} className="mr-2" /> {children}
  </Button>
);

export function InteractiveManifest({
  initialCrew,
  initialPassengers,
  onCrewChange,
  onPassengersChange,
}: InteractiveManifestProps) {
  const [crew, setCrew] = useState(initialCrew);
  const [passengers, setPassengers] = useState(initialPassengers);

  const [isAddingCrew, setIsAddingCrew] = useState(false);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState<CrewMember['role']>("PIC");

  const [isAddingPassenger, setIsAddingPassenger] = useState(false);
  const [newPassengerName, setNewPassengerName] = useState("");

  useEffect(() => {
    onCrewChange(crew);
  }, [crew, onCrewChange]);

  useEffect(() => {
    onPassengersChange(passengers);
  }, [passengers, onPassengersChange]);

  const handleAddCrew = () => {
    if (newCrewName.trim()) {
      setCrew([
        ...crew,
        { id: Date.now().toString(), name: newCrewName, role: newCrewRole },
      ]);
      setNewCrewName("");
      setIsAddingCrew(false);
    }
  };

  const handleRemoveCrew = (id: string) => {
    setCrew(crew.filter((c) => c.id !== id));
  };

  const handleAddPassenger = () => {
    if (newPassengerName.trim()) {
      setPassengers([
        ...passengers,
        { id: Date.now().toString(), name: newPassengerName },
      ]);
      setNewPassengerName("");
      setIsAddingPassenger(false);
    }
  };

  const handleRemovePassenger = (id: string) => {
    setPassengers(passengers.filter((p) => p.id !== id));
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="ceramic p-6 rounded-sm h-full space-y-6">
      {/* --- CREW SECTION --- */}
      <div>
        <SectionHeader title="Crew Manifest" count={crew.length} />
        <div className="mt-4 space-y-2">
          <AnimatePresence>
            {crew.map((member) => (
              <motion.div
                key={member.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <UserCheck size={16} className="text-zinc-500" />
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-zinc-500 font-mono">{member.role}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveCrew(member.id)}
                >
                  <Trash2 size={14} className="text-zinc-500 hover:text-red-500" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAddingCrew ? (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="groove p-2 flex gap-2">
                <input
                  type="text"
                  placeholder="Crew Member Name"
                  value={newCrewName}
                  onChange={(e) => setNewCrewName(e.target.value)}
                  className="bg-transparent w-full text-sm focus:outline-none"
                  autoFocus
                />
                <select value={newCrewRole} onChange={(e) => setNewCrewRole(e.target.value as CrewMember['role'])} className="bg-transparent text-sm focus:outline-none">
                  <option>PIC</option>
                  <option>SIC</option>
                  <option>FA</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleAddCrew} className="bg-[#F04E30] hover:bg-opacity-90 text-white">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingCrew(false)}>Cancel</Button>
              </div>
            </motion.div>
          ) : (
            <AddItemButton onClick={() => setIsAddingCrew(true)}>Add Crew Member</AddItemButton>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/50"></div>

      {/* --- PASSENGER SECTION --- */}
      <div>
        <SectionHeader title="Passenger Manifest" count={passengers.length} />
        <div className="mt-4 space-y-2">
          <AnimatePresence>
            {passengers.map((pax) => (
              <motion.div
                key={pax.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <User size={16} className="text-zinc-500" />
                  <p className="text-sm">{pax.name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePassenger(pax.id)}
                >
                  <Trash2 size={14} className="text-zinc-500 hover:text-red-500" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAddingPassenger ? (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="groove p-2">
                <input
                  type="text"
                  placeholder="Passenger Name"
                  value={newPassengerName}
                  onChange={(e) => setNewPassengerName(e.target.value)}
                  className="bg-transparent w-full text-sm focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPassenger()}
                />
              </div>
               <div className="flex gap-2">
                <Button size="sm" onClick={handleAddPassenger} className="bg-[#F04E30] hover:bg-opacity-90 text-white">Add</Button>
                <Button size="sm" variant="ghost" onClick={() => setIsAddingPassenger(false)}>Cancel</Button>
              </div>
            </motion.div>
          ) : (
            <AddItemButton onClick={() => setIsAddingPassenger(true)}>Add Passenger</AddItemButton>
          )}
        </div>
      </div>
    </div>
  );
}
