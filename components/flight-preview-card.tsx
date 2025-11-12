'use client';

import { Flight } from '@/lib/types';
import { ArrowRight, Clock } from 'lucide-react';
import CornerBracket from './corner-bracket';

interface FlightPreviewCardProps {
 flight: Flight;
 onClick: () => void;
}

const riskColors = {
 LOW: 'bg-green/10 text-green border-green/20',
 MODERATE: 'bg-amber/10 text-amber border-amber/20',
 HIGH: 'bg-amber/10 text-amber border-amber/20',
 CRITICAL: 'bg-red/10 text-red border-red/20',
};

const statusDots = {
 SCHEDULED: '○',
 DEPARTED: '●',
 EN_ROUTE: '◐',
 ARRIVED: '●',
 DELAYED: '◐',
 CANCELLED: '○',
};

export default function FlightPreviewCard({ flight, onClick }: FlightPreviewCardProps) {
 return (
 <CornerBracket size="sm" variant="hover">
 <button
 onClick={onClick}
 className="w-full bg-card border border-border p-4 hover:shadow-md transition-all duration-150 text-left"
 >
 <div className="flex items-start justify-between mb-3">
 <div>
 <div className="font-mono text-data font-semibold text-foreground mb-1">
 {flight.flightNumber}
 </div>
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <span>{flight.departure.code}</span>
 <ArrowRight size={14} />
 <span>{flight.arrival.code}</span>
 </div>
 </div>
 <span
 className={`text-xs px-2 py-1 border font-semibold ${riskColors[flight.riskLevel]}`}
 >
 {flight.riskLevel}
 </span>
 </div>

 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-slate-400">
 <Clock size={14} />
 <span className="font-mono">{flight.actualDeparture || flight.scheduledDeparture}</span>
 </div>
 <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
 <span className="text-base leading-none">{statusDots[flight.status]}</span>
 <span>{flight.status.replace('_', ' ')}</span>
 </div>
 </div>
 </button>
 </CornerBracket>
 );
}
