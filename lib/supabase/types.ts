export interface Flight {
  id: string;
  code: string;
  origin: string;
  destination: string;
  status: "On Time" | "Delayed" | "Cancelled";
  scheduled_at: string;
  arrival_at: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  operator: string | null;
  aircraft: string | null;
  operator_id: string | null;
  operator_country_code: string | null;
  aircraft_tail_number: string | null;
  aircraft_registry_code: string | null;
  notes: string | null;
  passenger_count: number | null;
  crew_count: number | null;
  origin_icao: string | null;
  destination_icao: string | null;
  origin_country_code: string | null;
  destination_country_code: string | null;
  weather_data: Record<string, any> | null;
  weather_risk_score: number | null;
  weather_focus:
    | "pre_flight"
    | "active_window"
    | "in_flight"
    | "post_flight"
    | null;
  weather_updated_at: string | null;
  weather_cache_expires: string | null;
  weather_alert_level: "green" | "yellow" | "red" | null;
  compliance_context: Record<string, any> | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  role: "pilot" | "crew" | "admin" | "dispatcher";
  status: "online" | "offline" | "away" | "busy";
  bio: string | null;
  phone: string | null;
  affiliated_organization: string | null;
  timezone: string;
  language: string;
  theme: "light" | "dark" | "system";
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_flight_updates: boolean;
  notifications_weather_alerts: boolean;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface FlightEvent {
  id: string;
  flight_id: string | null;
  event_type: "created" | "updated" | "deleted" | "status_changed";
  user_id: string | null;
  changed_data: Record<string, any> | null;
  created_at: string;
}

export interface WeatherCache {
  id: string;
  cache_key: string;
  icao_code: string;
  data_type: string;
  weather_data: Record<string, any>;
  expires_at: string;
  stale_at: string | null;
  needs_refresh_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AirportCache {
  id: string;
  icao_code: string;
  iata_code: string | null;
  core_data: Record<string, any>;
  runway_data: Record<string, any> | null;
  communication_data: Record<string, any> | null;
  navigation_data: Record<string, any> | null;
  capability_data: Record<string, any> | null;
  raw_api_response: Record<string, any> | null;
  data_completeness: number;
  processing_version: string;
  created_at: string;
  updated_at: string;
  last_verified_at: string;
  name?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  elevation_ft?: number | null;
  runways?: Record<string, any> | any[] | null;
  frequencies?: Record<string, any> | any[] | null;
  raw?: Record<string, any> | null;
  fbo_overview?: string | null;
  intel_updated_at?: string | null;
}

export interface ApiRateLimit {
  id: string;
  service_name: string;
  request_count: number;
  window_start: string;
  window_end: string;
  created_at: string;
  updated_at: string;
}

export interface Jurisdiction {
  code: string;
  name: string;
  type: "country" | "region" | "bloc";
  iso3: string | null;
  parent_code: string | null;
  alt_names: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Operator {
  id: string;
  name: string;
  domain: string | null;
  region: string | null;
  country_code: string | null;
  iata_code: string | null;
  icao_code: string | null;
  logo_url: string | null;
  logo_cached_at: string | null;
  active: boolean;
  operator_type: "charter" | "private" | "cargo" | "air_ambulance" | "military" | "unknown";
  jurisdiction_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface AircraftRecord {
  tail_number: string;
  operator_id: string | null;
  operator_name: string | null;
  registry_country_code: string | null;
  manufacturer: string | null;
  model: string | null;
  mtow_kg: number | null;
  equipment: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRegulation {
  id: string;
  title: string;
  regulator: string | null;
  reference: string | null;
  summary: string | null;
  description: string | null;
  compliance_action: string | null;
  status: "active" | "sunset" | "draft";
  risk_level: "low" | "moderate" | "high" | null;
  citation_url: string | null;
  effective_date: string | null;
  categories: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ComplianceRegulationScope {
  id: number;
  regulation_id: string;
  scope: "arrival" | "departure" | "state_of_operator" | "state_of_registry";
  trigger_notes: string | null;
}

export interface ComplianceRegulationJurisdiction {
  id: number;
  regulation_id: string;
  scope: "arrival" | "departure" | "state_of_operator" | "state_of_registry";
  jurisdiction_code: string | null;
  applicability: string | null;
  notes: string | null;
}

export interface ComplianceRegulationOperatorProfile {
  id: number;
  regulation_id: string;
  operator_type: "charter" | "private" | "cargo" | "air_ambulance" | "military" | "unknown";
  notes: string | null;
}

export interface ComplianceRegulationAircraftProfile {
  id: number;
  regulation_id: string;
  aircraft_class: string | null;
  mtow_min_kg: number | null;
  mtow_max_kg: number | null;
  required_equipment: string[];
  notes: string | null;
}

export interface ComplianceRegulationRevision {
  id: number;
  regulation_id: string;
  change_summary: string;
  source_url: string | null;
  recorded_at: string;
}

export interface FlightComplianceEntry {
  id: string;
  flight_id: string;
  scope: "arrival" | "departure" | "state_of_operator" | "state_of_registry";
  regulation_ids: string[];
  computed_at: string;
  context: Record<string, any>;
}

export interface AirportRow {
  icao: string;
  iata: string | null;
  name: string;
  city: string | null;
  state: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  elevation_ft: number | null;
  runways: Record<string, any> | null;
  frequencies: Record<string, any> | null;
  raw: Record<string, any>;
  fbo_overview?: string | null;
  intel_updated_at?: string | null;
  updated_at: string;
}

export interface IntelIngestionQueueRow {
  id: string;
  entity_type: 'airport' | 'operator' | 'unknown';
  entity_id_guess: string | null;
  query: string;
  exa_payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
  failure_reason: string | null;
  processed_at: string | null;
  retry_count: number;
  requested_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface IntelCitation {
  id: string;
  intel_entry_id: string;
  title: string | null;
  url: string;
  confidence: number | null;
  ranking: number | null;
  created_at: string;
}

export interface AirportIntelEntry {
  id: string;
  airport_icao: string;
  category: string;
  field: string;
  summary: string | null;
  value: Record<string, any> | null;
  confidence: number | null;
  source_rank: number;
  source_type: string | null;
  source_label: string | null;
  source_url: string | null;
  dedupe_hash: string;
  created_at: string;
  updated_at: string;
}

export interface OperatorIntelEntry {
  id: string;
  operator_id: string;
  category: string;
  field: string;
  summary: string | null;
  value: Record<string, any> | null;
  confidence: number | null;
  source_rank: number;
  source_type: string | null;
  source_label: string | null;
  source_url: string | null;
  dedupe_hash: string;
  created_at: string;
  updated_at: string;
}

export interface ChatConversation {
  id: string;
  flight_id: string | null;
  user_id: string;
  title: string | null;
  chat_type: 'general' | 'flight';
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens_used: Record<string, any> | null;
  created_at: string;
}

export interface GeminiUsageLog {
  id: string;
  conversation_id: string | null;
  flight_id: string | null;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number | null;
  model: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      user_flights: {
        Row: Flight;
        Insert: {
          code: string;
          origin: string;
          destination: string;
          status: "On Time" | "Delayed" | "Cancelled";
          scheduled_at: string;
          user_id: string;
          arrival_at?: string | null;
          operator?: string | null;
          aircraft?: string | null;
          operator_id?: string | null;
          operator_country_code?: string | null;
          aircraft_tail_number?: string | null;
          aircraft_registry_code?: string | null;
          notes?: string | null;
          passenger_count?: number | null;
          crew_count?: number | null;
          origin_icao?: string | null;
          destination_icao?: string | null;
          origin_country_code?: string | null;
          destination_country_code?: string | null;
          weather_data?: Record<string, any> | null;
          weather_risk_score?: number | null;
          weather_focus?:
            | "pre_flight"
            | "active_window"
            | "in_flight"
            | "post_flight"
            | null;
          weather_updated_at?: string | null;
          weather_cache_expires?: string | null;
          weather_alert_level?: "green" | "yellow" | "red" | null;
          compliance_context?: Record<string, any> | null;
        };
        Update: Partial<Omit<Flight, "id" | "created_at" | "user_id">> & {
          weather_data?: Record<string, any> | null;
          weather_risk_score?: number | null;
          weather_focus?:
            | "pre_flight"
            | "active_window"
            | "in_flight"
            | "post_flight"
            | null;
          weather_updated_at?: string | null;
          weather_cache_expires?: string | null;
          weather_alert_level?: "green" | "yellow" | "red" | null;
          compliance_context?: Record<string, any> | null;
        };
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<UserProfile, "id" | "created_at" | "user_id">>;
      };
      flight_events: {
        Row: FlightEvent;
        Insert: Omit<FlightEvent, "id" | "created_at">;
        Update: Partial<Omit<FlightEvent, "id" | "created_at">>;
      };
      weather_cache: {
        Row: WeatherCache;
        Insert: Omit<WeatherCache, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<WeatherCache, "created_at" | "id">>;
      };
      airport_cache: {
        Row: AirportCache;
        Insert: Omit<AirportCache, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<AirportCache, "created_at" | "id">>;
      };
      api_rate_limits: {
        Row: ApiRateLimit;
        Insert: Omit<ApiRateLimit, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<ApiRateLimit, "created_at" | "id">>;
      };
      airports: {
        Row: AirportRow;
        Insert: Omit<AirportRow, "updated_at">;
        Update: Partial<Omit<AirportRow, "icao">>;
      };
      jurisdictions: {
        Row: Jurisdiction;
        Insert: Omit<Jurisdiction, "created_at" | "updated_at">;
        Update: Partial<Omit<Jurisdiction, "code">>;
      };
      operators: {
        Row: Operator;
        Insert: Omit<Operator, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<Operator, "id" | "created_at">>;
      };
      aircraft: {
        Row: AircraftRecord;
        Insert: Omit<AircraftRecord, "created_at" | "updated_at">;
        Update: Partial<Omit<AircraftRecord, "tail_number">>;
      };
      compliance_regulations: {
        Row: ComplianceRegulation;
        Insert: Omit<ComplianceRegulation, "id" | "created_at" | "updated_at"> & {
          id?: string;
        };
        Update: Partial<Omit<ComplianceRegulation, "id" | "created_at">>;
      };
      compliance_regulation_scopes: {
        Row: ComplianceRegulationScope;
        Insert: Omit<ComplianceRegulationScope, "id"> & { id?: number };
        Update: Partial<Omit<ComplianceRegulationScope, "id">>;
      };
      compliance_regulation_jurisdictions: {
        Row: ComplianceRegulationJurisdiction;
        Insert: Omit<ComplianceRegulationJurisdiction, "id"> & { id?: number };
        Update: Partial<Omit<ComplianceRegulationJurisdiction, "id">>;
      };
      compliance_regulation_operator_profiles: {
        Row: ComplianceRegulationOperatorProfile;
        Insert: Omit<ComplianceRegulationOperatorProfile, "id"> & { id?: number };
        Update: Partial<Omit<ComplianceRegulationOperatorProfile, "id">>;
      };
      compliance_regulation_aircraft_profiles: {
        Row: ComplianceRegulationAircraftProfile;
        Insert: Omit<ComplianceRegulationAircraftProfile, "id"> & { id?: number };
        Update: Partial<Omit<ComplianceRegulationAircraftProfile, "id">>;
      };
      compliance_regulation_revisions: {
        Row: ComplianceRegulationRevision;
        Insert: Omit<ComplianceRegulationRevision, "id"> & { id?: number };
        Update: Partial<Omit<ComplianceRegulationRevision, "id">>;
      };
      flight_compliance_entries: {
        Row: FlightComplianceEntry;
        Insert: Omit<FlightComplianceEntry, "id" | "computed_at"> & {
          id?: string;
          computed_at?: string;
        };
        Update: Partial<Omit<FlightComplianceEntry, "id" | "flight_id">>;
      };
      intel_ingestion_queue: {
        Row: IntelIngestionQueueRow;
        Insert: Omit<IntelIngestionQueueRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<IntelIngestionQueueRow, "id">>;
      };
      airport_intel_entries: {
        Row: AirportIntelEntry;
        Insert: Omit<AirportIntelEntry, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<AirportIntelEntry, "id" | "airport_icao">>;
      };
      airport_intel_citations: {
        Row: IntelCitation;
        Insert: Omit<IntelCitation, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<IntelCitation, "id" | "intel_entry_id">>;
      };
      chat_conversations: {
        Row: ChatConversation;
        Insert: Omit<ChatConversation, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ChatConversation, "id" | "created_at" | "flight_id" | "user_id">>;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, "id" | "created_at">;
        Update: Partial<Omit<ChatMessage, "id" | "created_at" | "conversation_id">>;
      };
      gemini_usage_logs: {
        Row: GeminiUsageLog;
        Insert: Omit<GeminiUsageLog, "id" | "created_at">;
        Update: Partial<Omit<GeminiUsageLog, "id" | "created_at">>;
      };
      operator_intel_entries: {
        Row: OperatorIntelEntry;
        Insert: Omit<OperatorIntelEntry, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<OperatorIntelEntry, "id" | "operator_id">>;
      };
      operator_intel_citations: {
        Row: IntelCitation;
        Insert: Omit<IntelCitation, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<IntelCitation, "id" | "intel_entry_id">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      filter_airports: {
        Args: {
          p_query?: string | null;
          p_country?: string | null;
          p_region?: string | null;
          p_type?: string | null;
          p_scheduled_service?: boolean | null;
          p_min_runway_length?: number | null;
          p_requires_ils?: boolean | null;
          p_requires_lighting?: boolean | null;
          p_limit?: number | null;
          p_offset?: number | null;
        };
        Returns: Array<{
          icao_code: string | null;
          iata_code: string | null;
          core_data: Record<string, any> | null;
          runway_data: Record<string, any> | null;
          capability_data: Record<string, any> | null;
          total_count: number | null;
        }>;
      };
      airport_filter_dimensions: {
        Args: Record<string, never>;
        Returns: Array<{
          country: string | null;
          region: string | null;
          type: string | null;
          airport_count: number | null;
        }>;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
