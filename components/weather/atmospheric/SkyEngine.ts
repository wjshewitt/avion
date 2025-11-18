export type TimeOfDay = 'night' | 'dawn' | 'morning' | 'day' | 'sunset' | 'dusk';
export type WeatherCondition = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog' | 'snow';

export const SkyEngine = {
  getGradient: (hour: number, condition: WeatherCondition) => {
    // Normalize hour 0-24
    const h = hour;
    
    // Base palettes
    let top, bottom;

    if (h < 5 || h > 21) { // NIGHT
      top = '#020204'; bottom = '#11141c';
    } else if (h >= 5 && h < 7) { // DAWN
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
      top = '#1F1F24'; bottom = '#4A4A52'; // Flat Slate
    } else if (condition === 'fog') {
      top = '#373B44'; bottom = '#606c88'; // Muted Grey
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
    const x = 20 + (percentOfDay * 60); // 20% to 80%
    const y = 80 - (Math.sin(percentOfDay * Math.PI) * 70); // Arc
    
    // Sun color changes (White at noon, Orange at edges)
    let color = '#fff';
    if (hour < 8 || hour > 17) color = '#FDB813';
    if (hour < 7 || hour > 18) color = '#FF6B00';

    return { top: `${y}%`, left: `${x}%`, opacity: 1, color: color, isSun: true };
  }
};
