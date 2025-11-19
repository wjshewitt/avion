export type TimeOfDay = 'night' | 'dawn' | 'morning' | 'day' | 'sunset' | 'dusk';
export type WeatherCondition = 'clear' | 'partly-cloudy' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow';

export function calculateSolarVisualHour(
  nowIso: string,
  sunriseIso: string,
  sunsetIso: string
): number {
  const now = new Date(nowIso).getTime();
  const sunrise = new Date(sunriseIso).getTime();
  const sunset = new Date(sunsetIso).getTime();

  // Check for valid dates
  if (isNaN(now) || isNaN(sunrise) || isNaN(sunset)) {
    // Fallback to standard hour from current time if data is missing
    const d = new Date(nowIso);
    if (isNaN(d.getTime())) return 12;
    return d.getHours() + d.getMinutes() / 60;
  }

  // Handle polar days/nights (sunrise/sunset might be same or invalid in some APIs)
  // Assuming valid different timestamps for normal latitudes for now.

  // 1. Determine if we are in Night (Pre-Sunrise), Day, or Night (Post-Sunset)
  
  // To handle "night" correctly, we need the previous sunset (for pre-sunrise)
  // and next sunrise (for post-sunset).
  // For this visual engine, we map:
  // Sunrise -> 6.0
  // Sunset -> 18.0
  // Solar Noon -> 12.0 (approx)
  
  if (now < sunrise) {
    // Night (Morning side)
    // We ideally map midnight to sunrise as 0 -> 6
    // Approximate "midnight" as start of this day or sunrise - 6 hours?
    // Simple linear interpolation from midnight (00:00 local) to sunrise.
    
    // Let's use the day boundaries of 'now'
    const dayStart = new Date(nowIso);
    dayStart.setHours(0, 0, 0, 0);
    const midnight = dayStart.getTime();
    
    // If now is before midnight (shouldn't happen if dayStart is derived from now), 
    // but just in case standard safety:
    if (now < midnight) return 0; 
    
    const nightDuration = sunrise - midnight;
    if (nightDuration <= 0) return 6; // Edge case
    
    const ratio = (now - midnight) / nightDuration;
    // Map 0..1 to 0..6
    return ratio * 6;
    
  } else if (now > sunset) {
    // Night (Evening side)
    // Map sunset to midnight as 18 -> 24
    
    const dayEnd = new Date(nowIso);
    dayEnd.setHours(23, 59, 59, 999);
    const nextMidnight = dayEnd.getTime();
    
    const nightDuration = nextMidnight - sunset;
    if (nightDuration <= 0) return 18;
    
    const ratio = (now - sunset) / nightDuration;
    // Map 0..1 to 18..24
    return 18 + (ratio * 6);
    
  } else {
    // Daylight
    // Map sunrise to sunset as 6 -> 18
    const dayDuration = sunset - sunrise;
    if (dayDuration <= 0) return 12;
    
    const ratio = (now - sunrise) / dayDuration;
    // Map 0..1 to 6..18
    return 6 + (ratio * 12);
  }
}

export const SkyEngine = {
  getGradient: (hour: number, condition: WeatherCondition) => {
    // Normalize hour 0-24
    const h = hour;
    
    // Base palettes
    let top, bottom;

    if (h < 5.5 || h > 21) { // NIGHT (Strict Night) - Expanded range to prevent early dawn
      top = '#020204'; bottom = '#11141c';
    } else if (h >= 5.5 && h < 7) { // DAWN (Very short window around sunrise)
      top = '#1e1b2e'; bottom = '#8a4b38';
    } else if (h >= 7 && h < 9) { // MORNING
      top = '#2c5364'; bottom = '#bdc3c7';
    } else if (h >= 9 && h < 17) { // DAY
      top = '#2980b9'; bottom = '#6dd5fa'; // Typical Apple Blue
    } else if (h >= 17 && h < 20) { // SUNSET (Golden Hour)
      top = '#3a6073'; bottom = '#d1913c';
    } else { // DUSK
      top = '#0f2027'; bottom = '#203a43';
    }

    // Overrides for weather
    if (condition === 'storm') {
      top = '#0f0c29'; bottom = '#302b63'; // Deep purple/black
    } else if (condition === 'rain') {
      if (h < 5.5 || h > 21) { // Rainy night
        top = '#08080a'; bottom = '#1a1a1e';
      } else {
        top = '#1F1F24'; bottom = '#4A4A52'; // Flat Slate
      }
    } else if (condition === 'fog') {
      if (h < 5.5 || h > 21) { // Foggy night
        top = '#0f1114'; bottom = '#202329';
      } else {
        top = '#373B44'; bottom = '#606c88'; // Muted Grey
      }
    } else if (condition === 'snow') {
      if (h < 5 || h > 21) {
        top = '#0B1026'; bottom = '#2B32B2'; // Night snow
      } else {
        top = '#83a4d4'; bottom = '#b6fbff'; // Day snow
      }
    } else if (condition === 'cloudy') {
      if (h < 5 || h > 21) {
         top = '#1a1a1a'; bottom = '#2c3e50'; // Night clouds
      } else {
         top = '#5D6D7E'; bottom = '#BDC3C7'; // Day clouds
      }
    } else if (condition === 'partly-cloudy') {
      if (h < 5.5 || h > 21) {
         top = '#05070a'; bottom = '#1c2333'; // Slightly lighter night
      } else if (h >= 5.5 && h < 7) {
         top = '#2c2742'; bottom = '#9e5643'; // Partly cloudy dawn
      } else {
         top = '#3a7bd5'; bottom = '#82e4fa'; // Slightly softer day blue
      }
    }

    return `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)`;
  },

  getSunPosition: (hour: number) => {
    // Sun arc: 6am (left/down) -> 12pm (center/up) -> 6pm (right/down)
    if (hour < 6 || hour > 20) {
      // MOON LOGIC (Simple placeholder for now, opposite of sun)
      // Moon arc: 8pm -> 12am -> 5am
      // Just hiding it for now or static moon? 
      // Let's just return hidden sun for now as per spec, maybe later add moon.
      // Actually, the spec implies we just want the sun logic. 
      // But for night cards we might want something.
      return { top: '120%', left: '50%', opacity: 0, color: '#fff', isSun: false }; 
    }
    
    const percentOfDay = (hour - 6) / 14; // 0 to 1
    // Widen the arc: 5% to 95% (was 20% to 80%)
    const x = 5 + (percentOfDay * 90); 
    const y = 80 - (Math.sin(percentOfDay * Math.PI) * 70); // Arc
    
    // Sun color changes (White at noon, Orange at edges)
    let color = '#fff';
    if (hour < 8 || hour > 17) color = '#FDB813';
    if (hour < 7 || hour > 18) color = '#FF6B00';

    return { top: `${y}%`, left: `${x}%`, opacity: 1, color: color, isSun: true };
  }
};
