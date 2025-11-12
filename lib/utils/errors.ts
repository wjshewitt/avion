import { ZodError, type ZodIssue } from "zod";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Handles server-side errors and converts them to user-friendly messages
 */
export function handleServerError(error: unknown): string {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return error.issues
      .map((e: ZodIssue) => `${e.path.join(".")}: ${e.message}`)
      .join(", ");
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle Supabase errors
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }

  // Fallback for unknown error types
  return "An unexpected error occurred";
}

/**
 * Transforms technical errors into user-friendly messages for display
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  // Handle network errors
  if (
    error instanceof Error &&
    (error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("Failed to fetch"))
  ) {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  // Handle Supabase/PostgreSQL errors
  if (typeof error === "object" && error !== null) {
    const err = error as any;

    // Handle specific PostgreSQL error codes
    if (err.code) {
      switch (err.code) {
        case "PGRST301":
          return "Your session has expired. Please log in again.";
        case "PGRST116":
          return "The requested data could not be found.";
        case "23505":
          return "This record already exists.";
        case "23503":
          return "Cannot complete this action due to related data.";
        case "42P01":
          return "Database table not found. Please contact support.";
        default:
          if (err.code.startsWith("PGRST")) {
            return "A database error occurred. Please try again.";
          }
      }
    }

    // Handle authentication errors
    if (err.status === 401 || err.code === "PGRST301") {
      return "Your session has expired. Please log in again.";
    }

    // Handle not found errors
    if (err.status === 404) {
      return "The requested resource was not found.";
    }

    // Handle server errors
    if (err.status >= 500) {
      return "A server error occurred. Please try again later.";
    }
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return "Please check your input and try again.";
  }

  // Default user-friendly message
  return "Something went wrong. Please try again.";
}

/**
 * Logs error with context information
 */
export function logErrorWithContext(
  error: unknown,
  context: {
    operation: string;
    queryKey?: unknown[];
    params?: Record<string, unknown>;
  }
) {
  console.error(`Error in ${context.operation}:`, {
    timestamp: new Date().toISOString(),
    error,
    queryKey: context.queryKey,
    params: context.params,
    errorType: error instanceof Error ? error.constructor.name : typeof error,
    message: error instanceof Error ? error.message : String(error),
  });
}

/**
 * Wraps a Server Action function with standardized error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    console.error("Server action error:", error);
    return {
      success: false,
      error: handleServerError(error),
    };
  }
}
