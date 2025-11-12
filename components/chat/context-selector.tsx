'use client';

import { useState } from 'react';
import { Plane, MapPin, Globe } from 'lucide-react';
import { useChatStore } from '@/lib/chat-store';
import { useFlights } from '@/lib/tanstack/hooks/useFlights';

export default function ContextSelector() {
 const { selectedContext, setContext } = useChatStore();
 const [isOpen, setIsOpen] = useState(false);
 const { data: flights = [] } = useFlights();

 const handleSelectFlight = (flightId: string) => {
 setContext({ type: 'flight', flightIds: [flightId] });
 setIsOpen(false);
 };

 const handleSelectGeneral = () => {
 setContext({ type: 'general' });
 setIsOpen(false);
 };

 const getContextLabel = () => {
 if (selectedContext.type === 'flight' && selectedContext.flightIds?.length) {
 const flight = flights.find((f) => f.id === selectedContext.flightIds![0]);
 return flight ? `Flight: ${flight.code}` : 'Flight Context';
 }
 if (selectedContext.type === 'airport') {
 return 'Airport Context';
 }
 return 'General';
 };

 return (
 <div className="relative">
 <button
 onClick={() => setIsOpen(!isOpen)}
 className="flex items-center gap-2 px-3 py-2 h-8 bg-background-primary border border-border text-sm hover:border-blue transition-all duration-200"
 >
 {selectedContext.type === 'flight' && <Plane size={14} className="text-blue" />}
 {selectedContext.type === 'airport' && <MapPin size={14} className="text-blue" />}
 {selectedContext.type === 'general' && <Globe size={14} className="text-text-secondary" />}
 <span className="text-xs font-medium">{getContextLabel()}</span>
 <svg className="w-3 h-3 text-text-secondary ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>

 {isOpen && (
 <>
 <div
 className="fixed inset-0 z-10"
 onClick={() => setIsOpen(false)}
 />
 <div className="absolute right-0 top-full mt-2 w-72 bg-background-primary border border-border shadow-xl z-20 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-200">
 <div className="p-2">
 <button
 onClick={handleSelectGeneral}
 className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface transition-colors text-left ${
 selectedContext.type === 'general' ? 'bg-blue/5 border-l-2 border-blue' : ''
 }`}
 >
 <Globe size={16} className={selectedContext.type === 'general' ? 'text-blue' : 'text-text-secondary'} />
 <span className="text-sm font-medium">General Operations</span>
 </button>
 </div>

 <div className="border-t border-border p-2">
 <div className="px-3 py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider">
 Flight Context
 </div>
 {flights.length === 0 ? (
 <div className="px-3 py-3 text-xs text-muted-foreground text-center">
 No flights available
 </div>
 ) : (
 <div className="space-y-1">
 {flights.slice(0, 5).map((flight) => (
 <button
 key={flight.id}
 onClick={() => handleSelectFlight(flight.id)}
 className={`w-full flex items-center justify-between px-3 py-2.5 hover:bg-surface transition-colors text-left group ${
 selectedContext.flightIds?.includes(flight.id) ? 'bg-blue/5 border-l-2 border-blue' : ''
 }`}
 >
 <div className="flex items-center gap-3 flex-1 min-w-0">
 <Plane size={14} className={selectedContext.flightIds?.includes(flight.id) ? 'text-blue' : 'text-text-secondary group-hover:text-blue'} />
 <span className="text-sm font-mono font-semibold truncate">{flight.code}</span>
 </div>
 <span className="text-xs text-text-secondary flex-shrink-0 ml-2">
 {flight.origin} → {flight.destination}
 </span>
 </button>
 ))}
 {flights.length > 5 && (
 <div className="px-3 py-2 text-xs text-muted-foreground text-center">
 +{flights.length - 5} more flights
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 </>
 )}
 </div>
 );
}
