"use client";

import { useEffect } from "react";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useRouter } from "next/navigation";
import { queryClient, persister } from "@/lib/tanstack/client";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { FlightsRealtimeProvider } from "@/components/providers/FlightsRealtimeProvider";

function GlobalErrorHandler() {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    const handleError = async (error: any) => {
      // Handle 401 Unauthorized - session expired
      if (error?.status === 401 || error?.code === "PGRST301") {
        console.error("Session expired, attempting refresh...", {
          timestamp: new Date().toISOString(),
          error,
        });

        // Attempt to refresh session
        const supabase = createClient();
        const { data, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !data.session) {
          // Session refresh failed, redirect to login
          console.error("Session refresh failed:", refreshError);
          toast.error("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }

        // Session refreshed successfully
        console.log("Session refreshed successfully");
        toast.success("Session refreshed");
        // Invalidate all queries to refetch with new session
        queryClient.invalidateQueries();
        return;
      }

      // Handle network errors
      if (
        error?.message?.includes("fetch") ||
        error?.message?.includes("network") ||
        error?.code === "ECONNREFUSED"
      ) {
        console.error("Network error:", {
          timestamp: new Date().toISOString(),
          message: error.message,
          code: error.code,
        });
        // Don't show toast for network errors - let retry UI handle it
        return;
      }

      // Handle Supabase specific errors
      if (error?.code?.startsWith("PGRST")) {
        console.error("Database error:", {
          timestamp: new Date().toISOString(),
          code: error.code,
          message: error.message,
          details: error.details,
        });
        toast.error("A database error occurred. Please try again.");
        return;
      }

      // Enhanced error logging with categorization
      const errorType = 
        error?.status === 401 || error?.code === "PGRST301" ? "auth" :
        error?.message?.includes("fetch") || error?.message?.includes("network") ? "network" :
        error?.status >= 500 ? "server" :
        error?.status >= 400 ? "client" :
        "unknown";

      console.group(`🔴 Query Error [${errorType}]`);
      console.error("Timestamp:", new Date().toISOString());
      console.error("Error Type:", errorType);
      console.error("Error Details:", error);
      if (error?.message) console.error("Message:", error.message);
      if (error?.status) console.error("Status Code:", error.status);
      if (error?.stack) console.error("Stack:", error.stack);
      console.groupEnd();
    };

    // Listen to query errors with better context
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "updated" && event.query.state.error) {
        const error = event.query.state.error;
        const queryKey = event.query.queryKey;
        
        // Add query context to error logging
        console.group("Query Error Context");
        console.log("Query Key:", queryKey);
        console.log("Query Hash:", event.query.queryHash);
        console.groupEnd();
        
        handleError(error);
      }
    });

    return unsubscribe;
  }, [queryClient, router]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Use PersistQueryClientProvider for automatic cache persistence
  if (persister) {
    return (
      <PersistQueryClientProvider 
        client={queryClient} 
        persistOptions={{ 
          persister,
          maxAge: 1000 * 60 * 60 * 24, // 24 hours
          dehydrateOptions: {
            // Only persist chat-related queries
            shouldDehydrateQuery: (query) => {
              const queryKey = query.queryKey[0] as string;
              return (
                queryKey === 'general-conversations' ||
                queryKey === 'conversation-messages' ||
                queryKey === 'conversation'
              );
            },
          },
        }}
      >
        <GlobalErrorHandler />
        <FlightsRealtimeProvider />
        {children}
      </PersistQueryClientProvider>
    );
  }

  // Fallback for SSR
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorHandler />
      <FlightsRealtimeProvider />
      {children}
    </QueryClientProvider>
  );
}
