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
 VFR: 'bg-green/10 text-green border-green/20',
 MVFR: 'bg-blue/10 text-blue border-blue/20',
 IFR: 'bg-amber/10 text-amber border-amber/20',
 LIFR: 'bg-red/10 text-red border-red/20',
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
     <CornerBracket size="md" variant="hover">
       <div className="bg-white border border-border p-4">
         <div className="text-center text-muted-foreground">
           <div className="font-mono text-md font-semibold">{location}</div>
           <div className="text-sm mt-2">Weather data unavailable</div>
         </div>
       </div>
     </CornerBracket>
   );
 }

 const conditionStyle = conditionColors[weather.condition] || conditionColors.IFR;
 const conditionLabel = conditionLabels[weather.condition] || 'Unknown';

 return (
 <CornerBracket size="md" variant="hover">
 <div
 onClick={handleClick}
 className={`bg-white border border-border p-4 ${
 (onClick || icao) ? 'cursor-pointer hover:shadow-md transition-all duration-150' : ''
 }`}
 >
 <div className="flex items-start justify-between mb-4">
 <div>
 <div className="font-mono text-md font-semibold text-text-primary">{location}</div>
 <span
 className={`inline-block text-xs px-2 py-1 border font-semibold mt-1 ${
 conditionStyle
 }`}
 >
 {conditionLabel}
 </span>
 </div>
 <div className="text-right">
 <div className="text-2xl font-semibold text-text-primary">{weather.temperature}°</div>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center gap-2 text-sm text-text-secondary">
 <Wind size={14} />
 <span>
 {weather.wind.speed}kt {getWindDirection(weather.wind.direction)}
 </span>
 </div>
 <div className="flex items-center gap-2 text-sm text-text-secondary">
 <Eye size={14} />
 <span>{weather.visibility} SM</span>
 </div>
 {weather.ceiling && (
 <div className="flex items-center gap-2 text-sm text-text-secondary">
 <span>↕</span>
 <span>{weather.ceiling.toLocaleString()} ft</span>
 </div>
 )}
 </div>

 {weather.risks.length > 0 && (
 <div className="mt-3 pt-3 border-t border-border">
 <div className="flex items-center gap-1 text-xs text-amber">
 <span>⚠</span>
 <span>{weather.risks[0]}</span>
 </div>
 </div>
 )}
 </div>
 </CornerBracket>
 );
}

function getWindDirection(degrees: number): string {
 const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
 const index = Math.round(degrees / 45) % 8;
 return directions[index];
}
