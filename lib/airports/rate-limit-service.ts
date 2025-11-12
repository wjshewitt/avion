// API Rate Limiting Service for AirportDB Integration
// Manages API usage quotas and prevents quota exhaustion
// Provides request throttling and usage monitoring

import { createServerSupabase } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  windowStart: Date;
  windowEnd: Date;
}

export interface UsageStats {
  serviceName: string;
  currentCount: number;
  limit: number;
  windowStart: Date;
  windowEnd: Date;
  utilizationPercent: number;
}

export interface RateLimitConfig {
  serviceName: string;
  requestsPerWindow: number;
  windowDurationMs: number;
  burstAllowance?: number;
}

/**
 * Rate Limiting Service Implementation
 * Manages API request quotas using sliding window approach
 */
export class RateLimitService {
  private config: Required<RateLimitConfig>;

  constructor(config: RateLimitConfig) {
    this.config = {
      ...config,
      burstAllowance:
        config.burstAllowance ?? Math.floor(config.requestsPerWindow * 0.1),
    };
  }

  /**
   * Check if a request is allowed under current rate limits
   */
  async checkRateLimit(): Promise<RateLimitResult> {
    try {
      const supabase = await createServerSupabase();
      const now = new Date();
      const windowStart = new Date(
        now.getTime() - this.config.windowDurationMs
      );

      // Get current window data
      const { data: currentWindow, error } = await supabase
        .from("api_rate_limits")
        .select("*")
        .eq("service_name", this.config.serviceName)
        .gte("window_end", now.toISOString())
        .order("window_start", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      let requestCount = 0;
      let windowStartTime = windowStart;
      let windowEndTime = new Date(
        now.getTime() + this.config.windowDurationMs
      );

      if (currentWindow) {
        const window = currentWindow as any;
        requestCount = window.request_count;
        windowStartTime = new Date(window.window_start);
        windowEndTime = new Date(window.window_end);
      }

      // Check if request is allowed
      const allowed = requestCount < this.config.requestsPerWindow;
      const remaining = Math.max(
        0,
        this.config.requestsPerWindow - requestCount
      );

      return {
        allowed,
        remaining,
        resetTime: windowEndTime,
        windowStart: windowStartTime,
        windowEnd: windowEndTime,
      };
    } catch (error) {
      console.error("Failed to check rate limit:", error);
      // Fail open - allow request if rate limiting service is down
      return {
        allowed: true,
        remaining: this.config.requestsPerWindow,
        resetTime: new Date(Date.now() + this.config.windowDurationMs),
        windowStart: new Date(Date.now() - this.config.windowDurationMs),
        windowEnd: new Date(Date.now() + this.config.windowDurationMs),
      };
    }
  }

  /**
   * Record an API request and update usage counters
   */
  async recordRequest(): Promise<void> {
    try {
      const supabase = await createServerSupabase();
      const now = new Date();
      const windowEnd = new Date(now.getTime() + this.config.windowDurationMs);

      // Try to update existing window
      const { data: existingWindow, error: selectError } = await supabase
        .from("api_rate_limits")
        .select("*")
        .eq("service_name", this.config.serviceName)
        .gte("window_end", now.toISOString())
        .order("window_start", { ascending: false })
        .limit(1)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        throw selectError;
      }

      if (existingWindow) {
        // Update existing window
        const window = existingWindow as any;
        const { error: updateError } = await (supabase
          .from("api_rate_limits") as any)
          .update({
            request_count: window.request_count + 1,
            updated_at: now.toISOString(),
          })
          .eq("id", window.id);

        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new window
        const { error: insertError } = await (supabase
          .from("api_rate_limits") as any)
          .insert({
            service_name: this.config.serviceName,
            request_count: 1,
            window_start: now.toISOString(),
            window_end: windowEnd.toISOString(),
          });

        if (insertError) {
          throw insertError;
        }
      }

      console.log(`Recorded API request for ${this.config.serviceName}`);
    } catch (error) {
      console.error("Failed to record API request:", error);
      // Don't throw - recording failure shouldn't block the request
    }
  }

  /**
   * Get current usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    try {
      const supabase = await createServerSupabase();
      const now = new Date();

      const { data: currentWindow, error } = await supabase
        .from("api_rate_limits")
        .select("*")
        .eq("service_name", this.config.serviceName)
        .gte("window_end", now.toISOString())
        .order("window_start", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      const window = currentWindow as any;
      const currentCount = window?.request_count || 0;
      const windowStart = window
        ? new Date(window.window_start)
        : new Date(now.getTime() - this.config.windowDurationMs);
      const windowEnd = window
        ? new Date(window.window_end)
        : new Date(now.getTime() + this.config.windowDurationMs);

      return {
        serviceName: this.config.serviceName,
        currentCount,
        limit: this.config.requestsPerWindow,
        windowStart,
        windowEnd,
        utilizationPercent: Math.round(
          (currentCount / this.config.requestsPerWindow) * 100
        ),
      };
    } catch (error) {
      console.error("Failed to get usage stats:", error);
      return {
        serviceName: this.config.serviceName,
        currentCount: 0,
        limit: this.config.requestsPerWindow,
        windowStart: new Date(Date.now() - this.config.windowDurationMs),
        windowEnd: new Date(Date.now() + this.config.windowDurationMs),
        utilizationPercent: 0,
      };
    }
  }

  /**
   * Reset rate limit window (for administrative use)
   */
  async resetWindow(): Promise<void> {
    try {
      const supabase = await createServerSupabase();

      const { error } = await supabase
        .from("api_rate_limits")
        .delete()
        .eq("service_name", this.config.serviceName);

      if (error) {
        throw error;
      }

      console.log(`Reset rate limit window for ${this.config.serviceName}`);
    } catch (error) {
      console.error("Failed to reset rate limit window:", error);
      throw error;
    }
  }

  /**
   * Clean up expired rate limit windows
   */
  async cleanupExpiredWindows(): Promise<number> {
    try {
      const supabase = await createServerSupabase();
      const now = new Date();

      const { data, error } = await supabase
        .from("api_rate_limits")
        .delete()
        .lt("window_end", now.toISOString())
        .select("id");

      if (error) {
        throw error;
      }

      const cleanedCount = data?.length || 0;
      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired rate limit windows`);
      }

      return cleanedCount;
    } catch (error) {
      console.error("Failed to cleanup expired windows:", error);
      return 0;
    }
  }

  /**
   * Check if service is approaching rate limits
   */
  async isApproachingLimit(thresholdPercent: number = 80): Promise<boolean> {
    try {
      const stats = await this.getUsageStats();
      return stats.utilizationPercent >= thresholdPercent;
    } catch (error) {
      console.error("Failed to check if approaching limit:", error);
      return false;
    }
  }

  /**
   * Get time until rate limit resets
   */
  async getTimeUntilReset(): Promise<number> {
    try {
      const stats = await this.getUsageStats();
      return Math.max(0, stats.windowEnd.getTime() - Date.now());
    } catch (error) {
      console.error("Failed to get time until reset:", error);
      return 0;
    }
  }
}

/**
 * Pre-configured rate limiters for different services
 */
export const rateLimiters = {
  // AirportDB.io rate limiter (adjust based on actual API limits)
  airportdb: new RateLimitService({
    serviceName: "airportdb",
    requestsPerWindow: 1000, // Adjust based on actual API limits
    windowDurationMs: 60 * 60 * 1000, // 1 hour window
    burstAllowance: 100,
  }),

  // Conservative rate limiter for testing
  airportdbConservative: new RateLimitService({
    serviceName: "airportdb_conservative",
    requestsPerWindow: 100,
    windowDurationMs: 60 * 60 * 1000, // 1 hour window
    burstAllowance: 10,
  }),
};

/**
 * Get rate limiter for a specific service
 */
export function getRateLimiter(
  serviceName: keyof typeof rateLimiters
): RateLimitService {
  return rateLimiters[serviceName];
}

/**
 * Middleware function to check rate limits before API calls
 */
export async function withRateLimit<T>(
  serviceName: keyof typeof rateLimiters,
  operation: () => Promise<T>
): Promise<T> {
  const rateLimiter = getRateLimiter(serviceName);

  const rateCheck = await rateLimiter.checkRateLimit();

  if (!rateCheck.allowed) {
    const resetTime = Math.ceil(
      (rateCheck.resetTime.getTime() - Date.now()) / 1000
    );
    throw new Error(`Rate limit exceeded. Try again in ${resetTime} seconds.`);
  }

  // Record the request
  await rateLimiter.recordRequest();

  // Execute the operation
  return await operation();
}
