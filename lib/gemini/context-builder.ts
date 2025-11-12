/**
 * Context Builder for Gemini AI Chat
 * Fetches comprehensive flight data from Supabase and formats it for AI consumption
 */

import { createClient } from '@/lib/supabase/server';
import { getFlightRisk } from '@/lib/weather/riskEngine';
import type { Database } from '@/lib/supabase/types';

type Flight = Database['public']['Tables']['user_flights']['Row'];

interface FlightContext {
  contextString: string;
  sources: string[];
}

/**
 * Builds comprehensive context string for a flight including:
 * - Flight details (route, times, aircraft)
 * - Complete weather data (METAR + TAF for origin and destination)
 * - Risk assessment with factor breakdown
 * - Client notes and requirements
 * 
 * @param flightId - Flight ID to build context for
 * @param preloadedRiskData - Optional: pass in fresh risk data to avoid redundant fetches
 */
export async function buildFlightContext(
  flightId: string,
  preloadedRiskData?: any
): Promise<FlightContext> {
  const supabase = await createClient();
  const sources: string[] = [];
  
  // 1. Fetch flight details
  const { data: flight, error: flightError } = await supabase
    .from('user_flights')
    .select('*')
    .eq('id', flightId)
    .single() as { data: Flight | null; error: any };
  
  if (flightError || !flight) {
    throw new Error(`Flight not found: ${flightId}`);
  }
  
  sources.push('Flight Details');
  
  // 2. Fetch comprehensive risk assessment (includes weather)
  // Use preloaded data if provided, otherwise fetch fresh
  const riskData = preloadedRiskData || await getFlightRisk({ 
    accountId: flight.user_id,
    flightId,
    now: new Date()
  });
  
  sources.push(`METAR ${flight.origin_icao}`, `METAR ${flight.destination_icao}`);
  
  if (riskData.origin.weatherData?.taf) sources.push(`TAF ${flight.origin_icao}`);
  if (riskData.destination.weatherData?.taf) sources.push(`TAF ${flight.destination_icao}`);
  sources.push('Weather Risk Assessment');
  
  // Calculate timing context
  const now = new Date();
  const departureTime = new Date(flight.scheduled_at);
  const hoursUntilDeparture = (departureTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  // Determine response style based on timing
  let responseStyle = 'DISTANT_FLIGHT_NO_FORECASTS';
  let timingGuidance = '';
  let canProvideTacticalForecast = false;
  
  if (hoursUntilDeparture < 0) {
    responseStyle = 'POST_FLIGHT';
    timingGuidance = 'Flight has already departed. Discuss actual conditions if asked.';
    canProvideTacticalForecast = false;
  } else if (hoursUntilDeparture <= 3) {
    responseStyle = 'URGENT_OPERATIONAL';
    timingGuidance = 'Flight is imminent. Be direct, specific, and operational. Focus on current conditions and immediate actions.';
    canProvideTacticalForecast = true;
  } else if (hoursUntilDeparture <= 6) {
    responseStyle = 'CURRENT_OPERATIONS';
    timingGuidance = 'Flight is within 6 hours. Use current METAR and near-term TAF. Be practical and specific.';
    canProvideTacticalForecast = true;
  } else if (hoursUntilDeparture <= 12) {
    responseStyle = 'BRIEFING_MODE';
    timingGuidance = 'Flight is 6-12 hours out. Focus on TAF forecast. Mention once that you\'ll grab fresh data closer to departure, then move on.';
    canProvideTacticalForecast = true;
  } else if (hoursUntilDeparture <= 24) {
    responseStyle = 'DAY_BEFORE_PATTERNS_ONLY';
    timingGuidance = 'Flight is 12-24 hours out. Focus on weather patterns and trends, not specific METAR details. Casual mention of getting updated forecasts later.';
    canProvideTacticalForecast = true;
  } else {
    responseStyle = 'DISTANT_FLIGHT_NO_FORECASTS';
    const daysOut = Math.round(hoursUntilDeparture / 24);
    timingGuidance = `Flight is ${daysOut} days away. You do NOT have forecast data this far out. Acknowledge this honestly. Discuss route characteristics, seasonal patterns, and planning considerations only. If user asks for forecasts, explain TAFs aren\'t issued yet and when they will be available.`;
    canProvideTacticalForecast = false;
  }
  
  // Check TAF validity
  const originTaf = riskData.origin.weatherData?.taf;
  const destTaf = riskData.destination.weatherData?.taf;
  let tafValidityNote = '';
  
  if (originTaf || destTaf) {
    const tafExpiryTimes = [];
    if (originTaf?.timestamp?.to) tafExpiryTimes.push(new Date(originTaf.timestamp.to));
    if (destTaf?.timestamp?.to) tafExpiryTimes.push(new Date(destTaf.timestamp.to));
    
    const earliestExpiry = tafExpiryTimes.length > 0 ? Math.min(...tafExpiryTimes.map(d => d.getTime())) : null;
    
    if (earliestExpiry && departureTime.getTime() > earliestExpiry) {
      tafValidityNote = 'NOTE: Current TAFs expire before scheduled departure. Mention this ONCE casually if relevant, then proceed with analysis.';
    }
  }
  
  // Calculate METAR age
  const metarObservedTime = riskData.origin.weatherData?.metar?.observed 
    ? new Date(riskData.origin.weatherData.metar.observed) 
    : null;
  const metarAgeMinutes = metarObservedTime 
    ? Math.floor((now.getTime() - metarObservedTime.getTime()) / (1000 * 60))
    : null;
  
  // Check if TAF covers flight time
  const tafCoversFlightTime = originTaf?.timestamp?.to 
    ? new Date(originTaf.timestamp.to).getTime() > departureTime.getTime()
    : false;
  
  // 3. Build comprehensive context string
  const context = `
=== TIMING CONTEXT ===
Current Time: ${now.toISOString()}
Scheduled Departure: ${flight.scheduled_at} UTC
Hours Until Departure: ${hoursUntilDeparture.toFixed(1)}
Recommended Response Style: ${responseStyle}
Guidance: ${timingGuidance}
${tafValidityNote ? `${tafValidityNote}\n` : ''}

=== DATA AVAILABILITY ===
TAF Valid for Flight Time: ${tafCoversFlightTime ? 'YES' : 'NO - Flight is beyond current TAF validity period'}
METAR Age: ${metarAgeMinutes !== null ? `${metarAgeMinutes} minutes` : 'Unknown'}
Can Provide Tactical Forecast: ${canProvideTacticalForecast ? 'YES' : 'NO - Flight too distant for tactical forecasts'}
${!canProvideTacticalForecast ? '\n⚠️ CRITICAL: You do NOT have forecast data for this flight. If user asks for forecasts, acknowledge this limitation immediately and offer to discuss route patterns or planning instead.\n' : ''}

=== FLIGHT INFORMATION ===
Route: ${flight.origin_icao} → ${flight.destination_icao}
Scheduled Departure: ${flight.scheduled_at} UTC
Scheduled Arrival: ${flight.arrival_at} UTC
Aircraft Type: ${flight.aircraft || 'Not specified'}
Status: ${flight.status || 'scheduled'}

${flight.notes ? `CLIENT NOTES / REQUIREMENTS:\n${flight.notes}\n` : ''}

=== ORIGIN WEATHER (${flight.origin_icao}) ===
${formatWeatherData(riskData.origin.weatherData, 'origin')}

=== DESTINATION WEATHER (${flight.destination_icao}) ===
${formatWeatherData(riskData.destination.weatherData, 'destination')}

=== WEATHER RISK ASSESSMENT ===
Overall Flight Risk: ${riskData.result.score}/100 (${riskData.result.tier})
Flight Phase: ${riskData.phase}
Confidence: ${(riskData.result.confidence * 100).toFixed(0)}%

Origin Risk Score: ${riskData.origin.result.score}/100 (${riskData.origin.result.tier})
Destination Risk Score: ${riskData.destination.result.score}/100 (${riskData.destination.result.tier})

RISK FACTOR BREAKDOWN:
${riskData.result.factorBreakdown.map((factor: any) => `
- ${factor.name}: ${factor.score}/100 (${factor.severity})
  ${factor.messages.map((msg: string) => `  • ${msg}`).join('\n')}
  ${factor.details?.actualValue ? `  Actual Value: ${factor.details.actualValue}` : ''}
  ${factor.details?.threshold ? `  Threshold: ${factor.details.threshold}` : ''}
  ${factor.timeframe ? `  Timeframe: ${factor.timeframe.from || 'now'} to ${factor.timeframe.to || 'later'}` : ''}
`).join('\n')}

DATA FRESHNESS:
Last Updated: ${riskData.weatherData?.lastUpdated || 'Unknown'}
Data Staleness: ${riskData.dataStalenessMinutes || 0} minutes
Datasets Available: ${riskData.datasetsAvailable} (METAR + TAF)

${riskData.messaging ? `
AUTOMATED RISK MESSAGES:
${Object.entries(riskData.messaging).map(([key, msg]: [string, any]) => `
${key.toUpperCase()}:
  Summary: ${msg.summary}
  ${msg.concerns?.length > 0 ? `Concerns: ${msg.concerns.join(', ')}` : ''}
  ${msg.recommendations?.length > 0 ? `Recommendations: ${msg.recommendations.join(', ')}` : ''}
`).join('\n')}
` : ''}
`;

  return { contextString: context, sources };
}

/**
 * Formats weather data (METAR + TAF) into human-readable text
 */
function formatWeatherData(weatherData: any, location: 'origin' | 'destination'): string {
  if (!weatherData) return 'Weather data not available';
  
  const metar = weatherData.metar;
  const taf = weatherData.taf;
  
  let formatted = '';
  
  // METAR
  if (metar) {
    formatted += `CURRENT CONDITIONS (METAR):\n`;
    formatted += `Raw: ${metar.raw_text || 'N/A'}\n`;
    formatted += `Observed: ${metar.observed || 'N/A'}\n`;
    formatted += `Flight Category: ${metar.flight_category || 'N/A'}\n\n`;
    
    formatted += `Decoded:\n`;
    formatted += `  Temperature: ${metar.temperature?.celsius || 'N/A'}°C / ${metar.temperature?.fahrenheit || 'N/A'}°F\n`;
    formatted += `  Dewpoint: ${metar.dewpoint?.celsius || 'N/A'}°C\n`;
    formatted += `  Visibility: ${metar.visibility?.miles || 'N/A'} SM\n`;
    formatted += `  Wind: ${metar.wind?.degrees || 'N/A'}° at ${metar.wind?.speed_kts || 'N/A'} kts`;
    if (metar.wind?.gust_kts) formatted += ` gusting ${metar.wind.gust_kts} kts`;
    formatted += `\n`;
    formatted += `  Altimeter: ${metar.barometer?.hg || 'N/A'} inHg / ${metar.barometer?.mb || 'N/A'} mb\n`;
    
    if (metar.clouds?.length > 0) {
      formatted += `  Clouds:\n`;
      metar.clouds.forEach((cloud: any) => {
        formatted += `    ${cloud.code} at ${cloud.feet || cloud.base_feet_agl || 'N/A'} ft\n`;
      });
    }
    
    if (metar.ceiling) {
      formatted += `  Ceiling: ${metar.ceiling.feet || 'N/A'} ft ${metar.ceiling.code || ''}\n`;
    }
    
    if (metar.conditions?.length > 0) {
      formatted += `  Conditions: ${metar.conditions.map((c: any) => c.text || c.code).join(', ')}\n`;
    }
    
    formatted += `\n`;
  }
  
  // TAF
  if (taf) {
    formatted += `FORECAST (TAF):\n`;
    formatted += `Raw: ${taf.raw_text || 'N/A'}\n`;
    formatted += `Issued: ${taf.timestamp?.issued || 'N/A'}\n`;
    formatted += `Valid: ${taf.timestamp?.from || taf.valid_time_from || 'N/A'} to ${taf.timestamp?.to || taf.valid_time_to || 'N/A'}\n\n`;
    
    if (taf.forecast?.length > 0) {
      formatted += `Forecast Periods:\n`;
      taf.forecast.forEach((period: any, idx: number) => {
        formatted += `  Period ${idx + 1} (${period.timestamp?.from || 'N/A'} to ${period.timestamp?.to || 'N/A'}):\n`;
        if (period.wind) formatted += `    Wind: ${period.wind.degrees || 'N/A'}° at ${period.wind.speed_kts || 'N/A'} kts\n`;
        if (period.visibility) formatted += `    Visibility: ${period.visibility.miles || 'N/A'} SM\n`;
        if (period.clouds?.length > 0) {
          formatted += `    Clouds: ${period.clouds.map((c: any) => `${c.code} at ${c.feet || c.base_feet_agl}ft`).join(', ')}\n`;
        }
        if (period.conditions?.length > 0) {
          formatted += `    Conditions: ${period.conditions.map((c: any) => c.text || c.code).join(', ')}\n`;
        }
        formatted += `\n`;
      });
    }
  }
  
  return formatted;
}
