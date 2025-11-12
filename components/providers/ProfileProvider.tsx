"use client";

import { useEffect } from "react";
import { useStore } from "@/store";
import { createClient } from "@/lib/supabase/client";

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const setUserProfile = useStore((state) => state.setUserProfile);
  const setIsLoadingProfile = useStore((state) => state.setIsLoadingProfile);

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
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setUserProfile(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [setUserProfile, setIsLoadingProfile]);

  return <>{children}</>;
}
