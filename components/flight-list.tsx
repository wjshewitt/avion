'use client';

import { Flight } from '@/lib/types';

interface FlightListProps {
 flights: Flight[];
 selectedFlightId?: string;
 onSelectFlight: (flightId: string) => void;
}

const statusColors = {
 SCHEDULED: 'text-gray',
 DEPARTED: 'text-blue',
 EN_ROUTE: 'text-blue',
 ARRIVED: 'text-green',
 DELAYED: 'text-amber',
 CANCELLED: 'text-red',
};

const statusDots = {
 SCHEDULED: '○',
 DEPARTED: '●',
 EN_ROUTE: '◐',
 ARRIVED: '●',
 DELAYED: '◐',
 CANCELLED: '○',
};

export default function FlightList({ flights, selectedFlightId, onSelectFlight }: FlightListProps) {
 return (
 <div className="h-full overflow-y-auto">
 <div className="p-6">
 <h2 className="text-lg font-semibold mb-6">Flights</h2>
 <div className="space-y-2">
 {flights.map((flight) => (
 <button
 key={flight.id}
 onClick={() => onSelectFlight(flight.id)}
 className={`
 w-full text-left p-4 transition-all duration-150
 ${selectedFlightId === flight.id 
 ? 'bg-muted shadow-md' 
 : 'hover:bg-muted hover:shadow-sm'
 }
 `}
 >
 <div className="space-y-1">
 {/* Flight number - mono, bold */}
 <div className="font-mono text-data font-semibold text-foreground">
 {flight.flightNumber}
 </div>
 
 {/* Route */}
 <div className="text-base text-muted-foreground">
 {flight.departure.code} → {flight.arrival.code}
 </div>
 
 {/* Time */}
 <div className="font-mono text-sm text-muted-foreground">
 {flight.actualDeparture || flight.scheduledDeparture}
 </div>
 
 {/* Status with dot */}
 <div className={`text-sm font-semibold flex items-center gap-1.5 ${statusColors[flight.status]}`}>
 <span className="text-base leading-none">{statusDots[flight.status]}</span>
 <span>{flight.status.replace('_', ' ')}</span>
 </div>
 </div>
 </button>
 ))}
 </div>
 </div>
 </div>
 );
}
