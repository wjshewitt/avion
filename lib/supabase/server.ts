import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { Database } from "./types";

function isRequestScopeError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message?.toLowerCase() ?? "";
  return message.includes("outside a request scope") ||
    message.includes("headers() is not supported in the edge runtime");
}

export const runtime = "nodejs";

export async function createServerSupabase(): Promise<SupabaseClient<Database>> {
  try {
    const cookieStore = await cookies();

    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Handle cookie setting errors in middleware
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Handle cookie removal errors in middleware
            }
          },
        },
      }
    );
  } catch (error) {
    if (!isRequestScopeError(error)) {
      throw error;
    }

    // Fallback for environments without a Next.js request context (tests, scripts)
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    );
  }
}

// Alias for backwards compatibility
export const createClient = createServerSupabase;
