'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/types/profile';

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const response = await fetch('/api/user/profile', {
      method: 'GET',
      cache: 'no-store'
    });
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return null;
      }
      // Log more detailed error information
      const errorText = await response.text();
      console.error('Profile API error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      return null; // Return null instead of throwing to prevent page crashes
    }
    
    const data = await response.json();
    return data.profile;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export function useProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Retry twice on failure
    retryDelay: 1000, // Wait 1 second between retries
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent repeated errors
  });
}
