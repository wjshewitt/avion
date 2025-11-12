export interface UserProfile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string;
  avatar_url: string | null;
  role: 'pilot' | 'crew' | 'admin' | 'dispatcher';
  status: 'online' | 'offline' | 'away' | 'busy';
  bio: string | null;
  phone: string | null;
  affiliated_organization: string | null;
  timezone: string;
  language: string;
  theme: 'light' | 'dark' | 'system';
  notifications_email: boolean;
  notifications_push: boolean;
  notifications_flight_updates: boolean;
  notifications_weather_alerts: boolean;
  preferences: UserPreferences;
  onboarding_completed: boolean;
}

export interface UserPreferences {
  selected_timezones?: string[];
  // Weather page view selection. Defaults to 'standard' when undefined.
  weather_view_mode?: 'standard' | 'ops';
  // Time format preference. Defaults to false (12-hour format) when undefined.
  use_24_hour_time?: boolean;
  // Airports: show minute airport/runway technical details (default: false)
  airports_show_minute_details?: boolean;
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
