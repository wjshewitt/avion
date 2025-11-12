// Aviation Weather Center (AWC) Types

export interface MetarData {
  icaoId: string;
  receiptTime: string;
  obsTime: { value: string };
  reportType: "METAR" | "SPECI";
  temp_c: number | null;
  dewpoint_c: number | null;
  wind_speed_kt: number | null;
  wind_dir_degrees: number | null;
  wind_gust_kt: number | null;
  altim_in_hg: number | null;
  vis_statute_mi: number | null;
  ceiling_ft_agl: number | null;
  flight_category: "VFR" | "MVFR" | "IFR" | "LIFR" | null;
  raw_text: string;
}

export interface TafForecast {
  fcstTime: string;
  change_indicator: "BECMG" | "TEMPO" | "FM" | null;
  time_becoming?: string;
  temp_c?: number;
  wind_speed_kt?: number;
  wind_dir_degrees?: number;
  vis_statute_mi?: number;
  ceiling_ft_agl?: number;
  weather?: string;
}

export interface TafData {
  icaoId: string;
  receiptTime: string;
  validFrom: string;
  validTo: string;
  reportType: "TAF";
  raw_text: string;
  forecast?: TafForecast[];
}

export interface SigmetData {
  id: string;
  icaoId?: string;
  validTime?: { from: string; to: string };
  hazard: string;
  raw_text: string;
  polygon?: [number, number][];
  severity?: string;
}

export interface MetarResponse {
  results: MetarData[];
}

export interface TafResponse {
  results: TafData[];
}

export interface SigmetResponse {
  results: SigmetData[];
}

// NOAA Weather API Types

export interface PointsResponse {
  properties: {
    grid: { id: string; x: number; y: number };
    forecast: string;
    forecastHourly: string;
    relativeLocation: { properties: { city: string; state: string } };
    timeZone: string;
  };
}

export interface ForecastPeriod {
  number: number;
  name: string;
  startTime: string;
  endTime: string;
  isDaytime: boolean;
  temperature: number;
  temperatureTrend: "falling" | "rising" | null;
  probabilityOfPrecipitation: { value: number | null };
  windSpeed: string;
  windDirection: string;
  icon: string;
  shortForecast: string;
  detailedForecast: string;
}

export interface ForecastResponse {
  properties: {
    periods: ForecastPeriod[];
  };
}

export interface WeatherAlert {
  id: string;
  properties: {
    event: string;
    headline: string;
    description: string;
    instruction: string;
    severity: "Minor" | "Moderate" | "Severe" | "Extreme";
    urgency: "Past" | "Unknown" | "Future" | "Immediate";
    onset: string;
    expires: string;
    senderName: string;
    areaDesc: string;
  };
}

export interface AlertResponse {
  features: WeatherAlert[];
}

// Enriched types for flight operations
export interface MetarEnriched extends MetarData {
  ageMinutes: number;
  dewpoint_depression_c: number | null;
  icing_risk: "low" | "moderate" | "high" | null;
}

export interface TafSummary {
  worst_condition: "VFR" | "MVFR" | "IFR" | "LIFR";
  worst_time: string;
  trend: "improving" | "stable" | "deteriorating";
  trend_description: string;
}

export interface TafEnriched extends TafData {
  summary?: TafSummary;
}

export interface SigmetEnriched extends SigmetData {
  altitude_range?: {
    low_ft: number;
    high_ft: number;
  };
  hazard_type:
    | "turbulence"
    | "icing"
    | "thunderstorm"
    | "volcanic_ash"
    | "wind_shear"
    | "other";
}
