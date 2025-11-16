export type AirportKind =
  | "large_airport"
  | "medium_airport"
  | "small_airport"
  | "heliport"
  | "seaplane_base"
  | "closed";

export interface AirportLite {
  icao: string;
  iata?: string | null;
  name: string;
  municipality?: string | null;
  country?: string | null;
  region?: string | null;
  latitude: number;
  longitude: number;
  elevation_ft?: number | null;
  type: AirportKind;
  scheduled_service: boolean;
  longest_runway_ft: number;
  surface_types: string[];
  ils_equipped: boolean;
  all_lighted: boolean;
  popularity_score: number;
}

export interface AirportLiteResponse {
  success: boolean;
  data: {
    airports: AirportLite[];
    updatedAt: string;
    total: number;
    source: "cache" | "live";
  };
}

export interface AirportLiteDataset {
  airports: AirportLite[];
  updatedAt: string;
  total: number;
}

export interface AirportFilterContext {
  query?: string;
  country?: string | null;
  region?: string | null;
  type?: AirportKind | null;
  scheduledService?: boolean;
  minRunwayLength?: number;
  surfaceType?: "ALL" | "PAVED" | "UNPAVED";
  requiresILS?: boolean;
  requiresLighting?: boolean;
  selectedIcao?: string | null;
  highlightedIcaos?: Set<string>;
}
