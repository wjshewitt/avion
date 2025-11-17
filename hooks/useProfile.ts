'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@/types/profile';

async function fetchProfile(): Promise<UserProfile | null> {
  try {
    const response = await fetch('/api/user/profile');
    
    if (!response.ok) {
      if (response.status === 401) {
        return null;
      }
      throw new Error('Failed to fetch profile');
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
  });
}
