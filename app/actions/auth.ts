"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export type AuthResult = 
  | { success: true; requiresEmailConfirmation?: boolean } 
  | { success: false; error: string };

export async function login(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let errorMessage = error.message;
      
      // Provide helpful message for unconfirmed email
      if (error.message.toLowerCase().includes("email not confirmed") || 
          error.message.toLowerCase().includes("invalid login credentials")) {
        errorMessage = "Invalid login credentials. If you just signed up, please check your email and click the confirmation link first.";
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to login",
    };
  }
}

export async function signup(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        error: "Email and password are required",
      };
    }

    const supabase = await createServerSupabase();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      // Check for user already registered error
      if (error.message.toLowerCase().includes("already registered") || 
          error.message.toLowerCase().includes("user already exists")) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }
      
      return {
        success: false,
        error: error.message,
      };
    }

    // Supabase returns a user even if email is already taken (for security)
    // Check if this is an existing user by seeing if we got a user but no session and no confirmation needed
    if (data.user && !data.session) {
      // Try to check if the user already exists by looking at identities
      // If identities is empty, it means the user already exists but wasn't created just now
      if (data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: "An account with this email already exists. Please sign in instead.",
        };
      }
    }

    // Check if email confirmation is required
    const requiresConfirmation = !!data.user && !data.session;

    revalidatePath("/", "layout");
    return { 
      success: true,
      requiresEmailConfirmation: requiresConfirmation
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to sign up",
    };
  }
}

export async function logout(): Promise<void> {
  try {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Logout error:", error);
  }

  redirect("/login");
}

export async function requestPasswordReset(formData: FormData): Promise<AuthResult> {
  try {
    const email = formData.get("email") as string;

    if (!email) {
      return {
        success: false,
        error: "Email is required",
      };
    }

    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to request password reset",
    };
  }
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  try {
    const password = formData.get("password") as string;

    if (!password) {
      return {
        success: false,
        error: "Password is required",
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: "Password must be at least 6 characters",
      };
    }

    const supabase = await createServerSupabase();

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update password",
    };
  }
}
