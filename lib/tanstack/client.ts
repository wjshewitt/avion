import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

/**
 * Create persister for localStorage (only for chat data)
 */
export const persister = typeof window !== 'undefined' 
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: 'FLIGHTCHAT_QUERY_CACHE',
    })
  : undefined;

/**
 * Determines if an error is a network-related error that should be retried
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("timeout")
    );
  }

  // Check for network error codes
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    return (
      err.code === "ECONNREFUSED" ||
      err.code === "ETIMEDOUT" ||
      err.code === "ENOTFOUND"
    );
  }

  return false;
}

/**
 * Determines if an error is an authentication error that should not be retried
 */
function isAuthError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const err = error as any;
    return err.status === 401 || err.code === "PGRST301";
  }
  return false;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds default
      gcTime: 5 * 60 * 1000, // 5 minutes default garbage collection time
      refetchOnWindowFocus: true, // Enable for weather data freshness (overridden per query)
      refetchOnReconnect: true, // Refetch when network reconnects
      refetchOnMount: true, // Default behavior (overridden for chat queries)
      refetchInterval: false, // Disable automatic polling by default
      retry: (failureCount, error) => {
        // Don't retry on auth errors
        if (isAuthError(error)) {
          return false;
        }

        // Retry network errors up to 3 times
        if (isNetworkError(error)) {
          return failureCount < 3;
        }

        // For other errors, retry once
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => {
        // Exponential backoff: 1s, 2s, 4s
        return Math.min(1000 * 2 ** attemptIndex, 30000);
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry auth errors
        if (isAuthError(error)) {
          return false;
        }

        // Retry network errors once
        if (isNetworkError(error)) {
          return failureCount < 1;
        }

        // Don't retry other mutation errors
        return false;
      },
    },
  },
});
