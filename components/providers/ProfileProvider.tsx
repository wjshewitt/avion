"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useStore } from "@/store";
import { createClient } from "@/lib/supabase/client";
import type { UserPreferences } from "@/types/profile";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const setUserProfile = useStore((state) => state.setUserProfile);
  const setIsLoadingProfile = useStore((state) => state.setIsLoadingProfile);
  const setWeatherViewMode = useStore((state) => state.setWeatherViewMode);
  const setWeatherUnits = useStore((state) => state.setWeatherUnits);
  const { setTheme } = useTheme();
  // Track if we've already initialized the theme from profile to prevent overwriting user changes
  // during the same session if the profile re-fetches
  const isThemeInitialized = useRef(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      
      try {
        // Check if user is authenticated
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserProfile(null);
          setIsLoadingProfile(false);
          return;
        }

        // Fetch profile from API
        const response = await fetch('/api/user/profile');
        
        if (!response.ok) {
          console.error('Failed to fetch profile:', response.status);
          setUserProfile(null);
          setIsLoadingProfile(false);
          return;
        }

        const data = await response.json();

        if (data.profile) {
          setUserProfile(data.profile);

          const prefs = (data.profile.preferences ?? {}) as UserPreferences;
          setWeatherViewMode(prefs.weather_view_mode === "ops" ? "advanced" : "standard");
          setWeatherUnits({
            speed: prefs.weather_speed_unit ?? "kt",
            visibility: prefs.weather_visibility_unit ?? "mi",
          });

          // Only set theme from profile on first load
          if (data.profile.theme_preference && !isThemeInitialized.current) {
            setTheme(data.profile.theme_preference);
            isThemeInitialized.current = true;
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [setUserProfile, setIsLoadingProfile, setWeatherViewMode, setWeatherUnits, setTheme]);

  return <>{children}</>;
}
