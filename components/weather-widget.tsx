'use client';

import { useRouter } from 'next/navigation';
import { Weather, WeatherCondition } from '@/lib/types';
import { Wind, Eye, Thermometer } from 'lucide-react';
import CornerBracket from './corner-bracket';

interface WeatherWidgetProps {
 location: string;
 weather: Weather;
 onClick?: () => void;
 icao?: string;
}

const conditionColors: Record<WeatherCondition, string> = {
  VFR: 'text-emerald-400 border-emerald-400/30',
  MVFR: 'text-blue-400 border-blue-400/30',
  IFR: 'text-amber-400 border-amber-400/30',
  LIFR: 'text-[#F04E30] border-[#F04E30]/30',
};

const conditionLabels: Record<WeatherCondition, string> = {
 VFR: 'Visual',
 MVFR: 'Marginal',
 IFR: 'Instrument',
 LIFR: 'Low IFR',
};

export default function WeatherWidget({ location, weather, onClick, icao }: WeatherWidgetProps) {
 const router = useRouter();
 
 const handleClick = () => {
   if (onClick) {
     onClick();
   } else if (icao) {
     router.push(`/weather/${icao}`);
   }
 };

 // Safety check for weather data
 if (!weather || !weather.condition) {
   return (
       <div 
        className="bg-[#2A2A2A] border border-zinc-700 rounded-sm p-6 text-zinc-300"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)'
        }}
       >
         <div className="text-center text-zinc-500">
           <div className="font-mono text-lg font-medium text-zinc-100">{location}</div>
           <div className="text-sm mt-2">Weather data unavailable</div>
         </div>
       </div>
   );
 }

 const conditionStyle = conditionColors[weather.condition] || conditionColors.IFR;
 const conditionLabel = conditionLabels[weather.condition] || 'Unknown';

 return (
    <div
      onClick={handleClick}
      className={`bg-[#2A2A2A] border border-zinc-700 rounded-sm p-6 text-zinc-300 ${(
        onClick || icao
      ) ? 'cursor-pointer hover:border-[#F04E30]/50 transition-all duration-150' : ''}`}
      style={{
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.2)',
      }}
    >
     <div className="grid grid-cols-2 gap-4 mb-6">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">AIRPORT</div>
        <div className="font-mono text-lg font-medium text-zinc-100">{location}</div>
        <span
          className={`inline-block text-[10px] px-2 py-0.5 border rounded-full font-mono uppercase mt-2 ${
            conditionStyle
          }`}
        >
          {conditionLabel}
        </span>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">TEMP</div>
        <div className="font-mono text-3xl font-light text-zinc-100">{weather.temperature}°</div>
      </div>
    </div>

     <div className="grid grid-cols-3 gap-4 text-center">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">WIND</div>
        <div className="font-mono text-lg text-zinc-100">
          {weather.wind.speed}<span className="text-sm">kt</span> {getWindDirection(weather.wind.direction)}
        </div>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">VISIBILITY</div>
        <div className="font-mono text-lg text-zinc-100">{weather.visibility}<span className="text-sm">SM</span></div>
      </div>
      {weather.ceiling && (
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-1">CEILING</div>
          <div className="font-mono text-lg text-zinc-100">{weather.ceiling.toLocaleString()}<span className="text-sm">ft</span></div>
        </div>
      )}
    </div>

     {weather.risks.length > 0 && (
      <div className="mt-4 pt-4 border-t border-zinc-700/50">
        <div className="flex items-center gap-2 text-xs text-amber-400">
          <span>⚠</span>
          <span className="font-mono">{weather.risks[0]}</span>
        </div>
      </div>
    )}
 </div>
 );
}

function getWindDirection(degrees: number): string {
 const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
 const index = Math.round(degrees / 45) % 8;
 return directions[index];
}
