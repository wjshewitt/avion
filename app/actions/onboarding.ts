"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";

export type OnboardingResult = 
  | { success: true } 
  | { success: false; error: string };

export interface OnboardingData {
  username: string;
  avatar_url?: string | null;
  role?: 'pilot' | 'crew' | 'admin' | 'dispatcher';
  timezone?: string;
  theme?: 'light' | 'dark' | 'system';
}

export async function completeOnboarding(data: OnboardingData): Promise<OnboardingResult> {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Validate username format
    if (!data.username || !/^[a-zA-Z0-9_]{3,20}$/.test(data.username)) {
      return {
        success: false,
        error: "Username must be 3-20 characters and contain only letters, numbers, and underscores",
      };
    }

    // Check username availability
    const { data: existingUser } = await (supabase as any)
      .from('user_profiles')
      .select('id')
      .ilike('username', data.username)
      .neq('user_id', user.id)
      .single();

    if (existingUser) {
      return {
        success: false,
        error: "Username is already taken",
      };
    }

    // Update profile with onboarding data
    const updateData = {
      username: data.username,
      onboarding_completed: true,
      ...(data.avatar_url !== undefined && { avatar_url: data.avatar_url }),
      ...(data.role && { role: data.role }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.theme && { theme: data.theme }),
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await (supabase as any)
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Onboarding update error:', updateError);
      return {
        success: false,
        error: updateError.message || "Failed to complete onboarding",
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Onboarding error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete onboarding",
    };
  }
}

export async function updateOnboardingProgress(data: Partial<OnboardingData>): Promise<OnboardingResult> {
  try {
    const supabase = await createServerSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await (supabase as any)
      .from('user_profiles')
      .update(updateData)
      .eq('user_id', user.id);

    if (updateError) {
      return {
        success: false,
        error: updateError.message || "Failed to update profile",
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update progress error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
