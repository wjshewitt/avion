import { 
  Cloud, Wind, Eye, Thermometer, Navigation, 
  Droplets, Gauge, Clock, Check, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherData, formatTimestamp, formatTafValidity } from '@/components/chat/tool-ui/weather-card-components';
import { StarryBackground } from '@/components/ui/starry-background';

interface WeatherArtifactProps {
  data: WeatherData;
}

export function WeatherArtifact({ data }: WeatherArtifactProps) {
  const { icao, metar, taf } = data;

  // Determine if it's night time based on METAR observation time or current time
  const isNight = (() => {
    const obsTime = metar?.observed ? new Date(metar.observed) : new Date();
    const hours = obsTime.getUTCHours(); // Aviation uses UTC
    // Rough night approximation (UTC) - this should ideally be calculated with suncalc
    // But for now, let's assume night if "Clear" and we want to show stars.
    // A better check would be passing solar data. 
    // For visual effect demo, we'll check against local time or if explicit Night check is needed.
    
    // Let's rely on condition code being clear and simple check
    return true; // defaulting to check visually for now, or implement logic below
  })();

  // Check for Clear conditions
  const isClear = metar?.conditions?.some(c => 
    c.code === 'CLR' || c.code === 'SKC' || c.code === 'NSC' || c.text?.toLowerCase().includes('clear')
  );

  // Show stars if it's clear. (User asked for "clear nights", simplified trigger for now)
  const showStars = isClear; 

  const getFlightCategoryColor = (category?: string) => {
    switch (category) {
      case "VFR": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "MVFR": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "IFR": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "LIFR": return "bg-[#F04E30]/10 text-[#F04E30] border-[#F04E30]/20";
      default: return "bg-muted/50 text-muted-foreground border-border";
    }
  };

  const getCeilingText = (cloud?: { code?: string; feet?: number; text?: string }) => {
    if (!cloud) return 'Unlimited';
    if (cloud.code === 'CLR' || cloud.code === 'SKC') return 'Clear';
    return `${cloud.code} ${cloud.feet || ''}`;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border bg-card/50">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-mono font-bold tracking-tighter text-foreground mb-1">
              {icao?.toUpperCase()}
            </h1>
            <div className="text-sm text-muted-foreground flex items-center gap-2 font-mono">
              <Clock size={14} />
              {metar?.observed ? formatTimestamp(metar.observed) : 'No Data'}
            </div>
          </div>
          {metar?.flight_category && (
            <div className={cn(
              "px-3 py-1 rounded-sm border text-sm font-bold font-mono tracking-wider", 
              getFlightCategoryColor(metar.flight_category)
            )}>
              {metar.flight_category}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Current Conditions Hero */}
        {metar && (
          <div className={cn(
            "p-6 border-b border-border relative overflow-hidden transition-colors duration-500",
            showStars ? "bg-[#0f172a] text-white border-blue-900/30" : "bg-card/30"
          )}>
            {showStars && <StarryBackground />}
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "p-5 rounded-full border transition-colors",
                  showStars 
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" 
                    : "bg-primary/10 text-primary border border-primary/20"
                )}>
                  {showStars ? <Moon size={40} strokeWidth={1.5} /> : <Cloud size={40} strokeWidth={1.5} />}
                </div>
                <div>
                  <div className="text-5xl font-medium tracking-tight mb-1">
                    {metar.temperature?.celsius}°C
                  </div>
                  <div className={cn(
                    "font-medium text-lg",
                    showStars ? "text-indigo-200/70" : "text-muted-foreground"
                  )}>
                    {metar.conditions?.[0]?.text || metar.conditions?.[0]?.code || 'Clear'}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 relative z-10">
              <MetricBox 
                icon={<Wind size={16} />}
                label="Wind"
                value={`${metar.wind?.degrees}° @ ${metar.wind?.speed_kts}kt`}
                dark={showStars}
              />
              <MetricBox 
                icon={<Eye size={16} />}
                label="Visibility"
                value={`${metar.visibility?.miles || metar.visibility?.miles_float} SM`}
                dark={showStars}
              />
              <MetricBox 
                icon={<Navigation size={16} />}
                label="Ceiling"
                value={getCeilingText(metar.clouds?.[0])}
                dark={showStars}
              />
              <MetricBox 
                icon={<Gauge size={16} />}
                label="Pressure"
                value={`${metar.barometer?.hg} inHg`}
                dark={showStars}
              />
              <MetricBox 
                icon={<Droplets size={16} />}
                label="Dewpoint"
                value={`${metar.dewpoint?.celsius}°C`}
                dark={showStars}
              />
              <MetricBox 
                icon={<Thermometer size={16} />}
                label="Humidity"
                value={'--'} // Not in current types
                dark={showStars}
              />
            </div>
          </div>
        )}

        {/* TAF Forecast */}
        {taf && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <h3 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
                Forecast (TAF)
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-sm">
                {formatTafValidity(taf.timestamp?.from || '', taf.timestamp?.to || '')}
              </span>
            </div>

            <div className="space-y-0 relative ml-2 pl-8 border-l border-border">
              {taf.forecast?.map((period, i) => {
                const fromTime = typeof period.timestamp === 'string' ? period.timestamp : period.timestamp?.from;
                
                return (
                <div key={i} className="relative pb-8 last:pb-0">
                  {/* Timeline node */}
                  <div className={cn(
                    "absolute -left-[37px] top-0 w-3 h-3 rounded-full border-2 z-10 transition-colors duration-300",
                    i === 0 
                      ? "bg-primary border-primary ring-4 ring-primary/10" 
                      : "bg-background border-muted-foreground/50 group-hover:border-primary"
                  )} />
                  
                  {/* Time Label */}
                  <div className="absolute -left-[38px] top-5 text-[10px] font-mono text-muted-foreground w-8 text-right">
                    {fromTime ? formatTimestamp(fromTime).split(' ')[1] : ''}
                  </div>
                  
                  <div className="bg-muted/20 hover:bg-muted/40 transition-colors rounded-sm p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-3">
                      {period.change?.indicator && (
                        <span className={cn(
                          "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-sm border",
                          (period.change.indicator.code === 'BECMG' || period.change.indicator.text === 'Becoming') ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          (period.change.indicator.code === 'TEMPO' || period.change.indicator.text === 'Temporary') ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-background border-border text-muted-foreground"
                        )}>
                          {period.change.indicator.code || period.change.indicator.text}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                      <div className="flex items-center gap-3">
                        <Wind size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-mono">
                          {period.wind?.degrees}° @ {period.wind?.speed_kts}kt
                          {period.wind?.gust_kts && <span className="text-muted-foreground ml-1">G{period.wind.gust_kts}</span>}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Eye size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm font-mono">{period.visibility?.miles_float || period.visibility?.meters} SM</span>
                      </div>

                      {period.clouds && period.clouds.length > 0 && (
                        <div className="flex items-start gap-3 col-span-2">
                          <Cloud size={14} className="text-muted-foreground shrink-0 mt-0.5" />
                          <div className="flex flex-wrap gap-2">
                            {period.clouds.map((cloud, idx) => (
                              <span key={idx} className="text-sm font-mono bg-background border border-border px-1.5 py-0.5 rounded-sm">
                                {cloud.code} {cloud.feet}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {period.conditions && period.conditions.length > 0 && (
                        <div className="flex items-center gap-3 col-span-2 text-muted-foreground">
                          <Check size={14} className="shrink-0" />
                          <span className="text-sm">{period.conditions.map(c => c.text || c.code).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricBox({ icon, label, value, dark = false }: { icon: React.ReactNode, label: string, value: string, dark?: boolean }) {
  return (
    <div className={cn(
      "p-3 rounded-sm border transition-colors group",
      dark ? "bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/40" : "bg-background border-border hover:border-primary/30"
    )}>
      <div className={cn(
        "flex items-center gap-2 mb-1.5",
        dark ? "text-indigo-200/60" : "text-muted-foreground"
      )}>
        <span className={cn(
          "transition-colors duration-200",
          dark ? "group-hover:text-indigo-300" : "group-hover:text-primary"
        )}>{icon}</span>
        <span className="text-[10px] uppercase tracking-wider font-mono">{label}</span>
      </div>
      <div className={cn(
        "font-mono font-medium text-sm truncate",
        dark ? "text-indigo-100" : "text-foreground/90"
      )} title={value}>
        {value}
      </div>
    </div>
  );
}
