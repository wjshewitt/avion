/**
 * Weather Data Adapter
 * Transforms METAR data structure into the expected Weather interface
 */

import type { Weather, WeatherCondition } from '@/lib/types';
import type { DecodedMetar } from '@/types/checkwx';

/**
 * Transforms METAR data into the Weather interface expected by components
 * @param metar - The decoded METAR data from CheckWX API
 * @returns Weather object or null if data is invalid
 */
export function adaptMetarToWeather(metar: DecodedMetar | null | undefined): Weather | null {
  if (!metar) {
    return null;
  }

  // Map flight_category from METAR to condition enum
  const condition = mapFlightCategoryToCondition(metar.flight_category);

  // Extract temperature in Fahrenheit, fallback to Celsius converted to F
  const temperature = metar.temperature?.fahrenheit ?? 
    (metar.temperature?.celsius ? Math.round(metar.temperature.celsius * 9/5 + 32) : 0);

  // Extract wind data in knots
  const windSpeed = metar.wind?.speed_kts ?? 0;
  const windDirection = metar.wind?.degrees ?? 0;

  // Extract visibility in statute miles
  const visibility = typeof metar.visibility?.miles_float === 'number' 
    ? metar.visibility.miles_float 
    : (typeof metar.visibility?.miles === 'number' ? metar.visibility.miles : 0);

  // Extract ceiling in feet (lowest broken/overcast layer)
  const ceiling = metar.ceiling?.feet ?? 
    (metar.clouds?.find(cloud => cloud.code === 'BKN' || cloud.code === 'OVC')?.feet);

  // Extract weather risks based on conditions
  const risks = extractWeatherRisks(metar, condition);

  return {
    condition,
    temperature,
    wind: {
      speed: windSpeed,
      direction: windDirection,
    },
    visibility,
    ceiling: ceiling || undefined,
    risks,
  };
}

/**
 * Maps CheckWX flight_category to WeatherCondition enum
 */
function mapFlightCategoryToCondition(flightCategory: string | undefined): WeatherCondition {
  switch (flightCategory) {
    case 'VFR':
      return 'VFR';
    case 'MVFR':
      return 'MVFR';
    case 'IFR':
      return 'IFR';
    case 'LIFR':
      return 'LIFR';
    default:
      // Default to IFR if category is unknown (safer for aviation)
      return 'IFR';
  }
}

/**
 * Extracts weather risks based on METAR conditions
 */
function extractWeatherRisks(metar: DecodedMetar, condition: WeatherCondition): string[] {
  const risks: string[] = [];

  // Add condition-based risks
  if (condition === 'IFR' || condition === 'LIFR') {
    risks.push('Low visibility/ceiling');
  }

  // High wind risks (gusty or sustained high winds)
  const windSpeed = metar.wind?.speed_kts || 0;
  const gustSpeed = metar.wind?.gust_kts || 0;
  if (gustSpeed > 25 || windSpeed > 20) {
    risks.push('High winds');
  } else if (gustSpeed > 15 || windSpeed > 15) {
    risks.push('Moderate winds');
  }

  // Check for hazardous weather conditions in the raw text
  const rawText = metar.raw_text?.toUpperCase() || '';
  
  // Thunderstorms
  if (rawText.includes('TS') || rawText.includes('TSRA') || rawText.includes('TSGR')) {
    risks.push('Thunderstorms');
  }

  // Icing conditions
  if (rawText.includes('ICE') || rawText.includes('FZRA') || rawText.includes('FZDZ')) {
    risks.push('Icing');
  }

  // Snow
  if (rawText.includes('SN') || rawText.includes('SG')) {
    risks.push('Snow');
  }

  // Rain
  if (rawText.includes('RA') && !rawText.includes('TS')) {
    risks.push('Rain');
  }

  // Fog/Mist
  if (rawText.includes('FG') || rawText.includes('BR')) {
    risks.push('Reduced visibility');
  }

  // Dust/Sand/Volcanic ash
  if (rawText.includes('DU') || rawText.includes('SA') || rawText.includes('VA')) {
    risks.push('Reduced visibility');
  }

  // Return unique risks only
  return [...new Set(risks)];
}

/**
 * Creates a safe weather object with default values if metar data is missing
 */
export function createDefaultWeather(icao: string): Weather {
  return {
    condition: 'VFR', // Default to VFR (safest assumption)
    temperature: 15, // Room temperature in F
    wind: {
      speed: 0,
      direction: 0,
    },
    visibility: 10, // Good visibility
    risks: [],
  };
}
