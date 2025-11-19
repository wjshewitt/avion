"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useStore } from "@/store";
import { useAppStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import type { UserPreferences } from "@/types/profile";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const setUserProfile = useStore((state) => state.setUserProfile);
  const setIsLoadingProfile = useStore((state) => state.setIsLoadingProfile);
  const setWeatherViewMode = useStore((state) => state.setWeatherViewMode);
  const setWeatherUnits = useStore((state) => state.setWeatherUnits);
  
  // App store (UI state)
  const setPinnedAirports = useAppStore((state) => state.setPinnedAirports);
  const pinnedAirports = useAppStore((state) => state.pinnedAirports);
  
  const { setTheme } = useTheme();
  // Track if we've already initialized the theme from profile to prevent overwriting user changes
  // during the same session if the profile re-fetches
  const isThemeInitialized = useRef(false);
  // Track the last known server state of pinned airports to prevent loops/unnecessary saves
  const lastServerPinnedAirports = useRef<string[] | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      
      try {
        // Check if user is authenticated
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserProfile(null);
          setPinnedAirports([]); // Clear pinned airports on logout
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

          // Sync pinned airports
          if (prefs.pinned_airports) {
             setPinnedAirports(prefs.pinned_airports);
             lastServerPinnedAirports.current = prefs.pinned_airports;
          } else {
             setPinnedAirports([]);
             lastServerPinnedAirports.current = [];
          }

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
  }, [setUserProfile, setIsLoadingProfile, setWeatherViewMode, setWeatherUnits, setTheme, setPinnedAirports]);

  // Sync pinned airports changes back to server
  useEffect(() => {
    // Skip if we haven't loaded the profile yet (lastServerPinnedAirports is null)
    if (lastServerPinnedAirports.current === null) return;

    // Check if there's a difference
    const currentPins = pinnedAirports;
    const lastPins = lastServerPinnedAirports.current;
    
    const isDifferent = 
      currentPins.length !== lastPins.length || 
      !currentPins.every((val, index) => val === lastPins[index]);

    if (isDifferent) {
      const savePreferences = async () => {
        try {
           // Update local ref immediately to avoid double-fires
           lastServerPinnedAirports.current = currentPins;

           // Get current user profile from the store to merge preferences
           // We use getState() to get the absolute latest value without subscribing to updates
           const currentProfile = useStore.getState().userProfile;
           const currentPrefs = currentProfile?.preferences || {};

           // Merge with existing preferences to avoid overwriting other settings
           const newPrefs = {
             ...currentPrefs,
             pinned_airports: currentPins
           };

           const response = await fetch('/api/user/profile', {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               preferences: newPrefs
             })
           });
           
           if (response.ok) {
             const data = await response.json();
             if (data.profile) {
               setUserProfile(data.profile);
             }
           }
        } catch (error) {
          console.error('Failed to save pinned airports:', error);
          // Revert ref if failed? No, because the UI is still showing the new state.
          // In a real app, we might show a toast error.
        }
      };

      // Debounce slightly or just fire
      const timeoutId = setTimeout(savePreferences, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [pinnedAirports]);

  return <>{children}</>;
}
