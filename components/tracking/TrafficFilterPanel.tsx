import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { X, Plane, Building2, Globe, ArrowUpToLine, Gauge, PlaneLanding, PlaneTakeoff, Search } from 'lucide-react';
import { useTrafficFilterStore } from '@/lib/adsb/filter-store';

interface TrafficFilterPanelProps {
  onClose: () => void;
}

export function TrafficFilterPanel({ onClose }: TrafficFilterPanelProps) {
  const { filters, setFilter, resetFilters } = useTrafficFilterStore();

  return (
    <div className="absolute top-4 right-4 w-80 bg-gray-900/95 border border-gray-800 backdrop-blur-md rounded-lg shadow-xl overflow-hidden z-20 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-950/50">
        <div className="font-mono font-bold text-sm tracking-wider">TRAFFIC FILTERS</div>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Search */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
            <Search size={10} /> Search
          </label>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilter('searchQuery', e.target.value)}
            placeholder="Callsign, Reg, or Hex..."
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
          />
        </div>

        {/* Source Filter */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
            <Globe size={10} /> Traffic Source
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-800 rounded">
            <button
              onClick={() => setFilter('source', 'all')}
              className={`text-xs py-1.5 rounded transition-colors ${
                filters.source === 'all' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('source', 'corporate')}
              className={`text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 ${
                filters.source === 'corporate' ? 'bg-orange-500/20 text-orange-500 shadow-sm border border-orange-500/30' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Building2 size={12} /> Corp
            </button>
            <button
              onClick={() => setFilter('source', 'airline')}
              className={`text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 ${
                filters.source === 'airline' ? 'bg-blue-500/20 text-blue-500 shadow-sm border border-blue-500/30' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Plane size={12} /> Air
            </button>
          </div>
        </div>

        {/* Altitude Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <ArrowUpToLine size={10} /> Altitude
            </label>
            <span className="text-xs font-mono text-gray-300">
              {(filters.altitudeMin / 1000).toFixed(0)}k - {(filters.altitudeMax / 1000).toFixed(0)}k ft
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[filters.altitudeMin, filters.altitudeMax]}
            max={60000}
            step={1000}
            minStepsBetweenThumbs={1}
            onValueChange={(value) => {
              setFilter('altitudeMin', value[0]);
              setFilter('altitudeMax', value[1]);
            }}
          >
            <Slider.Track className="bg-gray-800 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-orange-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-4 h-4 bg-white border border-gray-300 shadow-sm rounded-[2px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-transform hover:scale-110"
              aria-label="Min altitude"
            />
            <Slider.Thumb
              className="block w-4 h-4 bg-white border border-gray-300 shadow-sm rounded-[2px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-transform hover:scale-110"
              aria-label="Max altitude"
            />
          </Slider.Root>
        </div>

        {/* Speed Slider */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <Gauge size={10} /> Speed
            </label>
            <span className="text-xs font-mono text-gray-300">
              {filters.speedMin} - {filters.speedMax} kts
            </span>
          </div>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            value={[filters.speedMin, filters.speedMax]}
            max={1000}
            step={50}
            minStepsBetweenThumbs={1}
            onValueChange={(value) => {
              setFilter('speedMin', value[0]);
              setFilter('speedMax', value[1]);
            }}
          >
            <Slider.Track className="bg-gray-800 relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb
              className="block w-4 h-4 bg-white border border-gray-300 shadow-sm rounded-[2px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform hover:scale-110"
              aria-label="Min speed"
            />
            <Slider.Thumb
              className="block w-4 h-4 bg-white border border-gray-300 shadow-sm rounded-[2px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-transform hover:scale-110"
              aria-label="Max speed"
            />
          </Slider.Root>
        </div>

        {/* Flight Status */}
        <div className="space-y-2">
          <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
            <PlaneTakeoff size={10} /> Status
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-gray-800 rounded">
            <button
              onClick={() => setFilter('onGround', 'both')}
              className={`text-xs py-1.5 rounded transition-colors ${
                filters.onGround === 'both' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('onGround', false)}
              className={`text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 ${
                filters.onGround === false ? 'bg-emerald-500/20 text-emerald-500 shadow-sm border border-emerald-500/30' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Plane size={12} className="transform -rotate-45" /> Air
            </button>
            <button
              onClick={() => setFilter('onGround', true)}
              className={`text-xs py-1.5 rounded transition-colors flex items-center justify-center gap-1 ${
                filters.onGround === true ? 'bg-yellow-500/20 text-yellow-500 shadow-sm border border-yellow-500/30' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <PlaneLanding size={12} /> Ground
            </button>
          </div>
        </div>

        <button
          onClick={resetFilters}
          className="w-full py-2 text-xs font-mono uppercase tracking-wider text-gray-500 hover:text-white hover:bg-gray-800 rounded border border-dashed border-gray-700 hover:border-gray-500 transition-all"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
