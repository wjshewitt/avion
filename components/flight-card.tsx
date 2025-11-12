'use client';

import { Flight } from '@/lib/types';

interface FlightCardProps {
 flight: Flight;
}

const riskColors = {
 LOW: 'text-green',
 MODERATE: 'text-amber',
 HIGH: 'text-amber',
 CRITICAL: 'text-red',
};

export default function FlightCard({ flight }: FlightCardProps) {
 const timeDiff = flight.estimatedArrival && flight.scheduledArrival
 ? calculateTimeDiff(flight.scheduledArrival, flight.estimatedArrival)
 : null;

 return (
 <div className="absolute bottom-8 left-8 right-8 bg-background-primary shadow-2xl p-6 max-w-md">
 {/* Header */}
 <div className="mb-4">
 <h3 className="text-lg font-semibold text-text-primary">
 {flight.flightNumber}: {flight.departure.code} → {flight.arrival.code}
 </h3>
 <p className="text-base text-text-secondary mt-1">
 {flight.status === 'DEPARTED' && flight.actualDeparture && (
 <>Departed {flight.actualDeparture} {getTimeDiffText(flight.scheduledDeparture, flight.actualDeparture)}</>
 )}
 {flight.status === 'SCHEDULED' && (
 <>Scheduled departure {flight.scheduledDeparture}</>
 )}
 {flight.status === 'EN_ROUTE' && flight.actualDeparture && (
 <>En route since {flight.actualDeparture}</>
 )}
 {flight.status === 'ARRIVED' && (
 <>Arrived {flight.estimatedArrival || flight.scheduledArrival}</>
 )}
 {flight.status === 'DELAYED' && (
 <>Delayed departure</>
 )}
 </p>
 </div>

 {/* Metrics */}
 {(flight.altitude || flight.speed) && (
 <div className="flex items-center gap-4 py-3 border-y border-border">
 {flight.altitude && (
 <div className="font-mono text-data text-text-primary">
 {flight.altitude.toLocaleString()} ft
 </div>
 )}
 {flight.altitude && flight.speed && (
 <div className="text-text-secondary">|</div>
 )}
 {flight.speed && (
 <div className="font-mono text-data text-text-primary">
 {flight.speed} kt
 </div>
 )}
 </div>
 )}

 {flight.estimatedArrival && (
 <div className="py-3 border-b border-border">
 <div className="text-base text-text-secondary">
 ETA {flight.estimatedArrival} {timeDiff && <span className={timeDiff.early ? 'text-green' : 'text-amber'}>({timeDiff.text})</span>}
 </div>
 </div>
 )}

 {/* Weather risks */}
 {flight.weather && flight.weather.risks.length > 0 && (
 <div className="py-3 space-y-2">
 {flight.weather.risks.map((risk, i) => (
 <div key={i} className="flex items-start gap-2 text-base">
 <span className="text-amber">⚠</span>
 <span className="text-text-secondary">{risk}</span>
 </div>
 ))}
 </div>
 )}

 {/* AI Insight */}
 {flight.aiInsight && (
 <div className="mt-4 p-3 bg-surface">
 <div className="text-xs uppercase tracking-wide text-text-secondary mb-1">AI Insight</div>
 <div className="text-base text-text-primary">
 {flight.aiInsight}
 </div>
 </div>
 )}

 {/* Risk level */}
 <div className="mt-4 pt-4 border-t border-border">
 <div className="flex items-center justify-between">
 <span className="text-sm text-text-secondary">Risk Level</span>
 <span className={`text-sm font-semibold ${riskColors[flight.riskLevel]}`}>
 {flight.riskLevel}
 </span>
 </div>
 </div>
 </div>
 );
}

function calculateTimeDiff(scheduled: string, estimated: string): { text: string; early: boolean } | null {
 // Simple time diff calculation (simplified for demo)
 const schedParts = scheduled.split(':');
 const estParts = estimated.split(':');
 const schedMinutes = parseInt(schedParts[0]) * 60 + parseInt(schedParts[1]);
 const estMinutes = parseInt(estParts[0]) * 60 + parseInt(estParts[1]);
 const diff = schedMinutes - estMinutes;
 
 if (diff === 0) return null;
 
 const early = diff > 0;
 const absDiff = Math.abs(diff);
 
 return {
 text: `${absDiff}m ${early ? 'early' : 'late'}`,
 early,
 };
}

function getTimeDiffText(scheduled: string, actual: string): string {
 const diff = calculateTimeDiff(scheduled, actual);
 if (!diff) return '';
 return diff.early ? `(${diff.text})` : `(${diff.text})`;
}
