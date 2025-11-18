export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  role?: 'flight_ops' | 'broker' | 'pilot' | 'crew' | 'admin' | 'dispatcher' | null;
  status?: 'online' | 'offline' | 'away' | 'busy';
  bio: string | null;
  phone: string | null;
  affiliated_organization: string | null;
  timezone?: string;
  language?: string;
  theme?: 'light' | 'dark' | 'system'; // Legacy field
  theme_preference?: 'light' | 'dark' | 'system'; // Database column name
  hq_location?: string | null;
  hq_timezone_same_as_main?: boolean;
  operations_date?: string | null; // yyyy-MM-dd
  notifications_email?: boolean;
  notifications_push?: boolean;
  notifications_flight_updates?: boolean;
  notifications_weather_alerts?: boolean;
  preferences?: UserPreferences;
  onboarding_completed?: boolean;
}

export interface UserPreferences {
  selected_timezones?: string[];
  // Weather page view selection. Defaults to 'standard' when undefined.
  weather_view_mode?: 'standard' | 'ops';
  // Preferred units for weather displays on the site.
  weather_speed_unit?: 'kt' | 'kmh' | 'mph';
  weather_visibility_unit?: 'sm' | 'mi' | 'km';
  // Time format preference. Defaults to false (12-hour format) when undefined.
  use_24_hour_time?: boolean;
  // Airports: show minute airport/runway technical details (default: false)
  airports_show_minute_details?: boolean;
  // UI layout: keep mission control sidebar expanded by default on load
  sidebar_expanded_default?: boolean;
  dashboard_modules?: Record<string, {
    enabled: boolean;
    size: "full" | "half";
    order: number;
    zone: "main" | "sidebar";
  }>;
  [key: string]: any;
}

export type ProfileUpdateData = Partial<UserProfile>;

export type Preferences = Record<string, any>;
