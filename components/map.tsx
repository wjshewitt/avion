'use client';

import { Flight } from '@/lib/types';

interface MapProps {
 selectedFlight?: Flight;
}

export default function Map({ selectedFlight }: MapProps) {
 return (
 <div className="relative h-full bg-surface overflow-hidden">
 {/* Placeholder map background */}
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="text-center space-y-4">
 <div className="text-xl font-semibold text-text-secondary">
 Map View
 </div>
 {selectedFlight && (
 <div className="text-sm text-text-secondary">
 Route: {selectedFlight.departure.city} → {selectedFlight.arrival.city}
 </div>
 )}
 <div className="text-xs text-text-secondary opacity-50">
 Interactive map would render here
 </div>
 </div>
 </div>

 {/* Grid overlay for visual interest */}
 <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
 <defs>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#grid)" />
 </svg>

 {/* Route line simulation */}
 {selectedFlight && (
 <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
 <line 
 x1="20%" 
 y1="50%" 
 x2="80%" 
 y2="50%" 
 stroke="#2563eb" 
 strokeWidth="2" 
 strokeDasharray="5,5"
 className="animate-pulse"
 />
 <circle cx="20%" cy="50%" r="6" fill="#10b981" />
 <circle cx="80%" cy="50%" r="6" fill="#2563eb" />
 </svg>
 )}
 </div>
 );
}
