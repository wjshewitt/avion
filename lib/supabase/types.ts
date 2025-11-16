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
  notes: string | null;
  passenger_count: number | null;
  crew_count: number | null;
  origin_icao: string | null;
  destination_icao: string | null;
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
          notes?: string | null;
          passenger_count?: number | null;
          crew_count?: number | null;
          origin_icao?: string | null;
          destination_icao?: string | null;
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
