// Weather API utilities for validation, rate limiting, and security
import { NextRequest } from "next/server";
import { z } from "zod";

// Rate limiting store (in-memory for simplicity)
// In production, consider using Redis or a database
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per hour per IP

/**
 * Simple rate limiting implementation
 * Returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(clientId: string): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    // 1% chance to clean up
    cleanupExpiredEntries();
  }

  if (!entry || now > entry.resetTime) {
    // First request or window expired, create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    rateLimitStore.set(clientId, newEntry);

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Increment counter
  entry.count++;
  rateLimitStore.set(clientId, entry);

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - entry.count);
  const allowed = entry.count <= RATE_LIMIT_MAX_REQUESTS;

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get client identifier for rate limiting
 * Uses IP address with fallback to user agent
 */
export function getClientId(request: NextRequest): string {
  // Try to get real IP from various headers (for proxy/CDN scenarios)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const cfConnectingIp = request.headers.get("cf-connecting-ip");

  let ip =
    forwardedFor?.split(",")[0]?.trim() ||
    realIp ||
    cfConnectingIp ||
    "unknown";

  // Fallback to user agent if IP is not available
  if (ip === "unknown") {
    const userAgent = request.headers.get("user-agent") || "unknown-ua";
    ip = `ua-${Buffer.from(userAgent).toString("base64").slice(0, 16)}`;
  }

  return ip;
}

/**
 * Validate ICAO codes with detailed error messages
 */
export const IcaoValidationSchema = z
  .string()
  .regex(/^[A-Z]{4}$/, "ICAO code must be exactly 4 uppercase letters")
  .transform((val) => val.toUpperCase());

export const IcaosArraySchema = z
  .array(IcaoValidationSchema)
  .min(1, "At least one ICAO code is required")
  .max(25, "Maximum 25 ICAO codes allowed per request");

/**
 * Parse and validate ICAO codes from query parameter
 */
export function parseIcaos(icaosParam: string | null): {
  success: boolean;
  data?: string[];
  error?: string;
} {
  if (!icaosParam) {
    return {
      success: false,
      error: "Missing required parameter: icaos",
    };
  }

  try {
    const icaos = icaosParam
      .split(",")
      .map((icao) => icao.trim())
      .filter((icao) => icao.length > 0);

    const result = IcaosArraySchema.safeParse(icaos);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => issue.message);
      return {
        success: false,
        error: errorMessages.join("; "),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    return {
      success: false,
      error: "Failed to parse ICAO codes",
    };
  }
}

/**
 * Validate radius parameter for area searches
 */
export const RadiusValidationSchema = z
  .string()
  .transform((val) => parseInt(val, 10))
  .refine((val) => !isNaN(val), "Radius must be a valid number")
  .refine((val) => val >= 1, "Radius must be at least 1 mile")
  .refine((val) => val <= 250, "Radius cannot exceed 250 miles");

/**
 * Parse and validate radius parameter
 */
export function parseRadius(radiusParam: string | null): {
  success: boolean;
  data?: number;
  error?: string;
} {
  if (!radiusParam) {
    return {
      success: false,
      error: "Missing required parameter: miles",
    };
  }

  const result = RadiusValidationSchema.safeParse(radiusParam);

  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => issue.message);
    return {
      success: false,
      error: errorMessages.join("; "),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Sanitize and validate single ICAO code
 */
export function parseSingleIcao(icaoParam: string | null): {
  success: boolean;
  data?: string;
  error?: string;
} {
  if (!icaoParam) {
    return {
      success: false,
      error: "Missing required parameter: icao",
    };
  }

  const result = IcaoValidationSchema.safeParse(icaoParam.trim());

  if (!result.success) {
    const errorMessages = result.error.issues.map((issue) => issue.message);
    return {
      success: false,
      error: `Invalid ICAO code: ${errorMessages.join("; ")}`,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  error: string,
  statusCode: number = 400
): Response {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      data: [],
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * Create rate limit exceeded response
 */
export function createRateLimitResponse(
  remaining: number,
  resetTime: number
): Response {
  const resetDate = new Date(resetTime);

  return new Response(
    JSON.stringify({
      success: false,
      error: "Rate limit exceeded. Please try again later.",
      data: [],
      timestamp: new Date().toISOString(),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": RATE_LIMIT_MAX_REQUESTS.toString(),
        "X-RateLimit-Remaining": remaining.toString(),
        "X-RateLimit-Reset": Math.floor(resetTime / 1000).toString(),
        "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    }
  );
}

/**
 * Log API usage for monitoring
 */
export function logApiUsage(
  endpoint: string,
  clientId: string,
  icaos?: string[],
  success: boolean = true,
  error?: string
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    endpoint,
    clientId: clientId.startsWith("ua-") ? "user-agent-based" : clientId,
    icaoCount: icaos?.length || 0,
    icaos: icaos?.slice(0, 5), // Log first 5 ICAOs for debugging
    success,
    error,
  };

  // In development, log to console
  if (process.env.NODE_ENV === "development") {
    console.log("Weather API Usage:", logData);
  }

  // In production, you might want to send this to a logging service
  // or store in a database for analytics
}

/**
 * Security headers for API responses
 */
export const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
} as const;
