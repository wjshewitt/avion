import React from 'react';
import { X, Plane, Wind, Navigation, Database } from 'lucide-react';
import { TrackedAircraft, AdsbDbAircraft } from '@/lib/adsb/types';

interface SelectedAircraftCardProps {
  aircraft: TrackedAircraft;
  details: AdsbDbAircraft | null;
  loadingDetails: boolean;
  onClose: () => void;
}

export function SelectedAircraftCard({ aircraft, details, loadingDetails, onClose }: SelectedAircraftCardProps) {
  return (
    <div className="absolute bottom-4 right-4 w-80 bg-gray-900/95 border border-gray-800 backdrop-blur-md rounded-lg shadow-xl overflow-hidden z-20 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-950/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-orange-500/10 text-orange-500">
            <Plane className="w-5 h-5 transform -rotate-45" />
          </div>
          <div>
            <div className="font-mono font-bold text-lg leading-none">
              {aircraft.callsign || 'N/A'}
            </div>
            <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider mt-0.5">
              {aircraft.icao24.toUpperCase()}
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Image Section */}
      {details?.url_photo_thumbnail && (
        <div className="relative h-32 w-full border-b border-gray-800 bg-black">
          <img 
            src={details.url_photo_thumbnail} 
            alt={details.type}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-transparent h-12" />
          <div className="absolute bottom-2 left-3 text-xs font-mono text-white/80 drop-shadow-md">
            {details.manufacturer} {details.type}
          </div>
        </div>
      )}

      {/* Live Telemetry Grid */}
      <div className="grid grid-cols-2 gap-px bg-gray-800 border-b border-gray-800">
        <div className="bg-gray-900/80 p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            <Navigation size={10} /> Altitude
          </div>
          <div className="font-mono font-semibold text-emerald-500">
            {aircraft.altitude > 0 ? aircraft.altitude.toLocaleString() : 'GND'} <span className="text-xs text-gray-600">ft</span>
          </div>
        </div>
        <div className="bg-gray-900/80 p-3">
          <div className="flex items-center gap-1.5 text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            <Wind size={10} /> Ground Speed
          </div>
          <div className="font-mono font-semibold text-blue-500">
            {Math.round(aircraft.speed)} <span className="text-xs text-gray-600">kts</span>
          </div>
        </div>
        <div className="bg-gray-900/80 p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Heading
          </div>
          <div className="font-mono font-semibold text-white">
            {Math.round(aircraft.heading)}°
          </div>
        </div>
        <div className="bg-gray-900/80 p-3">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
            Vertical Rate
          </div>
          <div className={`font-mono font-semibold ${aircraft.verticalRate > 0 ? 'text-orange-500' : aircraft.verticalRate < 0 ? 'text-purple-500' : 'text-gray-400'}`}>
            {aircraft.verticalRate > 0 ? '+' : ''}{aircraft.verticalRate} <span className="text-xs text-gray-600">fpm</span>
          </div>
        </div>
      </div>

      {/* Metadata Section */}
      <div className="p-3 space-y-2 bg-gray-900/50">
        {loadingDetails ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 animate-pulse">
            <Database size={12} /> Resolving metadata...
          </div>
        ) : details ? (
          <>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Registration</span>
              <span className="font-mono text-gray-300">{details.registration || aircraft.registration || 'Unknown'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Operator</span>
              <span className="font-medium text-gray-300 truncate ml-4" title={details.registered_owner}>{details.registered_owner || 'Private'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Type Code</span>
              <span className="font-mono text-gray-300">{details.icao_type || aircraft.type || 'Unknown'}</span>
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-500 italic text-center py-1">
            No additional metadata available
          </div>
        )}
      </div>
    </div>
  );
}
