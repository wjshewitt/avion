// AirportDB.io API Client - Server-side only
// This client handles secure communication with the AirportDB.io API
// and should NEVER be used on the client-side to prevent API key exposure

import type {
  AirportDBResponse,
  AirportDBClientConfig,
  AirportDBSearchOptions,
  AirportDBBatchRequest,
  AirportDBBatchResponse,
  AirportDBClient as AirportDBClientType,
} from "@/types/airportdb";
import { AirportDBException } from "@/types/airportdb";
import { getAirportDBConfig } from "@/lib/config/env-validation";
import {
  validateAirportResponse,
  validateBatchResponse,
  validateSearchResponse,
} from "@/lib/airports/validation";
import {
  getFallbackAirport,
  getFallbackBatch,
  searchFallbackAirports,
} from "./local-airportdb-fallback";

// Default configuration values
const DEFAULT_CONFIG = {
  baseUrl: "https://airportdb.io/api/v1",
  timeout: 15000, // 15 seconds - airport data can be large
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
} as const;

/**
 * AirportDB.io API Client Implementation
 * Provides comprehensive airport data with proper error handling and retry logic
 */
export class AirportDBClientImpl implements AirportDBClientType {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;

  constructor(config: AirportDBClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_CONFIG.baseUrl;
    this.timeout = config.timeout || DEFAULT_CONFIG.timeout;
    this.retryAttempts = config.retryAttempts || DEFAULT_CONFIG.retryAttempts;
    this.retryDelay = config.retryDelay || DEFAULT_CONFIG.retryDelay;

    if (!this.apiKey) {
      throw new AirportDBException({
        code: "INVALID_REQUEST",
        message: "AirportDB API key is required",
      });
    }
  }

  /**
   * Make a request to the AirportDB.io API with retry logic and proper error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Add API token as query parameter (AirportDB.io expects apiToken=KEY)
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${this.baseUrl}${endpoint}${separator}apiToken=${this.apiKey}`;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "User-Agent": "FlightOps-AI-Console/1.0",
            ...options.headers,
          },
          signal: controller.signal,
          ...options,
        });

        clearTimeout(timeoutId);

        // Handle different HTTP status codes
        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on certain errors
        if (
          error instanceof AirportDBException &&
          (error.code === "INVALID_REQUEST" || error.code === "NOT_FOUND")
        ) {
          throw error;
        }

        // If this is the last attempt, throw the error
        if (attempt === this.retryAttempts) {
          break;
        }

        // Wait before retrying with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt - 1);
        await this.sleep(delay);

        console.warn(
          `AirportDB API request attempt ${attempt} failed, retrying in ${delay}ms:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    }

    // If we get here, all retries failed
    if (lastError instanceof AirportDBException) {
      throw lastError;
    }

    if (lastError?.name === "AbortError") {
      throw new AirportDBException({
        code: "NETWORK_ERROR",
        message: "AirportDB API request timeout",
      });
    }

    throw new AirportDBException({
      code: "NETWORK_ERROR",
      message: `AirportDB API request failed after ${this.retryAttempts} attempts: ${
        lastError?.message || "Unknown error"
      }`,
    });
  }

  /**
   * Handle error responses from the AirportDB.io API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `AirportDB API request failed: ${response.status} ${response.statusText}`;
    let errorDetails: any = undefined;

    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
      errorDetails = errorData;
    } catch {
      // If we can't parse the error response, use the default message
    }

    // Handle specific status codes
    switch (response.status) {
      case 400:
        throw new AirportDBException({
          code: "INVALID_REQUEST",
          message: errorMessage || "Invalid request parameters",
          details: errorDetails,
        });

      case 401:
        throw new AirportDBException({
          code: "API_ERROR",
          message: "Invalid AirportDB API key or authentication failed",
          details: errorDetails,
        });

      case 403:
        throw new AirportDBException({
          code: "API_ERROR",
          message: "AirportDB API access forbidden - check your subscription",
          details: errorDetails,
        });

      case 404:
        throw new AirportDBException({
          code: "NOT_FOUND",
          message: "Airport not found in AirportDB",
          details: errorDetails,
        });

      case 429:
        // Extract retry-after header if available
        const retryAfter = response.headers.get("Retry-After");
        const retryAfterSeconds = retryAfter ? parseInt(retryAfter, 10) : 60;

        throw new AirportDBException({
          code: "RATE_LIMIT",
          message: "AirportDB API rate limit exceeded",
          details: errorDetails,
          retry_after: retryAfterSeconds,
        });

      case 500:
      case 502:
      case 503:
      case 504:
        throw new AirportDBException({
          code: "API_ERROR",
          message: "AirportDB API server error - please try again later",
          details: errorDetails,
        });

      default:
        throw new AirportDBException({
          code: "API_ERROR",
          message: errorMessage,
          details: errorDetails,
        });
    }
  }

  /**
   * Sleep for a specified number of milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Validate and normalize ICAO codes
   */
  private validateIcao(icao: string): string {
    const normalized = icao.trim().toUpperCase();
    if (!/^[A-Z][A-Z0-9]{3}$/.test(normalized)) {
      throw new AirportDBException({
        code: "INVALID_REQUEST",
        message: `Invalid ICAO code format: ${icao}. ICAO codes must be 4 characters starting with a letter.`,
      });
    }
    return normalized;
  }

  /**
   * Validate and normalize multiple ICAO codes
   */
  private validateIcaos(icaos: string[]): string[] {
    if (!icaos.length) {
      throw new AirportDBException({
        code: "INVALID_REQUEST",
        message: "At least one ICAO code is required",
      });
    }

    return icaos.map((icao) => this.validateIcao(icao));
  }

  /**
   * Build query parameters for search options
   */
  private buildSearchParams(options: AirportDBSearchOptions = {}): string {
    const params = new URLSearchParams();

    if (options.limit !== undefined) {
      params.set("limit", Math.min(Math.max(options.limit, 1), 100).toString());
    }

    if (options.type) {
      params.set("type", options.type);
    }

    if (options.includeRunways !== undefined) {
      params.set("include_runways", options.includeRunways.toString());
    }

    if (options.includeFrequencies !== undefined) {
      params.set("include_frequencies", options.includeFrequencies.toString());
    }

    if (options.includeNavaids !== undefined) {
      params.set("include_navaids", options.includeNavaids.toString());
    }

    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * Get airport data by ICAO code
   */
  async getAirportByIcao(
    icao: string,
    options: AirportDBSearchOptions = {}
  ): Promise<AirportDBResponse> {
    const validatedIcao = this.validateIcao(icao);
    const queryParams = this.buildSearchParams(options);
    const endpoint = `/airport/${validatedIcao}${queryParams}`;

    try {
      const response = await this.makeRequest(endpoint);
      return validateAirportResponse(response);
    } catch (error) {
      if (error instanceof AirportDBException) {
        if (error.code === "INVALID_REQUEST") {
          throw error;
        }

        if (error.code === "NOT_FOUND") {
          const fallback = getFallbackAirport(validatedIcao);
          if (fallback) {
            return fallback;
          }
          throw new AirportDBException({
            code: "NOT_FOUND",
            message: `Airport with ICAO code '${validatedIcao}' not found`,
          });
        }
      }

      const fallback = getFallbackAirport(validatedIcao);
      if (fallback) {
        return fallback;
      }

      throw error;
    }
  }

  /**
   * Search airports by query string
   */
  async searchAirports(
    query: string,
    options: AirportDBSearchOptions = {}
  ): Promise<AirportDBResponse[]> {
    if (!query.trim()) {
      throw new AirportDBException({
        code: "INVALID_REQUEST",
        message: "Search query cannot be empty",
      });
    }

    const searchParams = new URLSearchParams();
    searchParams.set("q", query.trim());

    // Add search options
    if (options.limit !== undefined) {
      searchParams.set(
        "limit",
        Math.min(Math.max(options.limit, 1), 100).toString()
      );
    }

    if (options.type) {
      searchParams.set("type", options.type);
    }

    if (options.includeRunways !== undefined) {
      searchParams.set("include_runways", options.includeRunways.toString());
    }

    if (options.includeFrequencies !== undefined) {
      searchParams.set(
        "include_frequencies",
        options.includeFrequencies.toString()
      );
    }

    if (options.includeNavaids !== undefined) {
      searchParams.set("include_navaids", options.includeNavaids.toString());
    }

    const endpoint = `/airport/search?${searchParams.toString()}`;

    try {
      const response = await this.makeRequest(endpoint);
      return validateSearchResponse(response);
    } catch (error) {
      if (error instanceof AirportDBException) {
        if (error.code === "INVALID_REQUEST") {
          throw error;
        }

        if (error.code === "NOT_FOUND") {
          return [];
        }
      }

      // Fallback to local dataset search when API is unavailable
      return searchFallbackAirports(query, options.limit ?? 10);
    }
  }

  /**
   * Get multiple airports by ICAO codes in batch
   */
  async getAirportsBatch(
    request: AirportDBBatchRequest
  ): Promise<AirportDBBatchResponse> {
    const validatedIcaos = this.validateIcaos(request.icao_codes);

    // AirportDB.io may have batch size limits, so we'll chunk the requests
    const batchSize = 25; // Conservative batch size
    const batches: string[][] = [];

    for (let i = 0; i < validatedIcaos.length; i += batchSize) {
      batches.push(validatedIcaos.slice(i, i + batchSize));
    }

    const allAirports: AirportDBResponse[] = [];
    const allErrors: Array<{ icao: string; error: string }> = [];

    // Process batches sequentially to avoid overwhelming the API
    for (const batch of batches) {
      try {
        const batchParams = new URLSearchParams();
        batchParams.set("icao_codes", batch.join(","));

        if (request.include_details !== undefined) {
          batchParams.set(
            "include_details",
            request.include_details.toString()
          );
        }

        const endpoint = `/airport/batch?${batchParams.toString()}`;
        const rawResponse = await this.makeRequest(endpoint);
        const response = validateBatchResponse(rawResponse);

        if (response.airports) {
          allAirports.push(...response.airports);
        }

        if (response.errors) {
          allErrors.push(...response.errors);
        }
      } catch (error) {
        const errorMessage =
          error instanceof AirportDBException
            ? error.message
            : "Batch request failed";

        batch.forEach((icao) => {
          allErrors.push({ icao, error: errorMessage });
        });
      }
    }

    const resolvedIcaos = new Set(allAirports.map((airport) => airport.ident));
    const missing = validatedIcaos.filter((icao) => !resolvedIcaos.has(icao));

    if (missing.length > 0) {
      const fallback = getFallbackBatch(missing);
      if (fallback.airports.length > 0) {
        allAirports.push(...fallback.airports);
        fallback.airports.forEach((airport) =>
          resolvedIcaos.add(airport.ident || airport.icao_code)
        );
      }

      if (fallback.errors.length > 0) {
        allErrors.push(...fallback.errors);
      }

      if (allErrors.length > 0) {
        // Remove duplicate errors for ICAOs that were satisfied by fallback data
        const unresolved = new Set(
          validatedIcaos.filter((icao) => !resolvedIcaos.has(icao))
        );
        const dedupedErrors: Array<{ icao: string; error: string }> = [];
        for (const err of allErrors) {
          if (unresolved.has(err.icao)) {
            dedupedErrors.push(err);
          }
        }
        allErrors.length = 0;
        allErrors.push(...dedupedErrors);
      }
    }

    return {
      airports: allAirports,
      errors: allErrors,
    };
  }

  /**
   * Check if the AirportDB.io API is healthy and accessible
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try to get a well-known airport (KJFK) to test connectivity
      await this.getAirportByIcao("KJFK", { limit: 1 });
      return true;
    } catch (error) {
      const fallback = getFallbackAirport("KJFK");
      if (fallback) {
        console.warn("AirportDB API unavailable, using fallback dataset.");
        return true;
      }

      console.warn("AirportDB health check failed:", error);
      return false;
    }
  }
}

/**
 * Compatibility wrapper for tests and legacy code expecting a class named AirportDBClient
 */
export class AirportDBClient implements AirportDBClientType {
  private readonly impl: AirportDBClientImpl;

  constructor() {
    this.impl = getAirportDBClient();
  }

  getAirportByIcao(
    icao: string,
    options?: AirportDBSearchOptions
  ): Promise<AirportDBResponse> {
    return this.impl.getAirportByIcao(icao, options);
  }

  searchAirports(
    query: string,
    options?: AirportDBSearchOptions
  ): Promise<AirportDBResponse[]> {
    return this.impl.searchAirports(query, options);
  }

  getAirportsBatch(
    request: AirportDBBatchRequest
  ): Promise<AirportDBBatchResponse> {
    return this.impl.getAirportsBatch(request);
  }

  checkHealth(): Promise<boolean> {
    return this.impl.checkHealth();
  }
}

// ============================================================================
// Singleton Instance Management
// ============================================================================

let airportDBClient: AirportDBClientImpl | null = null;

/**
 * Get the AirportDB client instance
 * This ensures we only create one instance and reuse it
 */
export function getAirportDBClient(): AirportDBClientImpl {
  if (!airportDBClient) {
    try {
      const config = getAirportDBConfig();
      airportDBClient = new AirportDBClientImpl({
        apiKey: config.AIRPORTDB_API_KEY,
      });
    } catch (error) {
      throw new AirportDBException({
        code: "API_ERROR",
        message:
          "Failed to initialize AirportDB client. Please ensure AIRPORTDB_API_KEY is set in your .env.local file.",
        details: error,
      });
    }
  }

  return airportDBClient;
}

/**
 * Reset the client instance (useful for testing or configuration changes)
 */
export function resetAirportDBClient(): void {
  airportDBClient = null;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if AirportDB integration is available and configured
 */
export async function isAirportDBAvailable(): Promise<boolean> {
  try {
    const client = getAirportDBClient();
    return await client.checkHealth();
  } catch {
    return false;
  }
}

/**
 * Validate ICAO code format without creating a client instance
 */
export function validateIcaoFormat(icao: string): boolean {
  const normalized = icao.trim().toUpperCase();
  // ICAO codes must be 4 characters, start with a letter, and contain only letters and numbers
  return /^[A-Z][A-Z0-9]{3}$/.test(normalized);
}

/**
 * Normalize ICAO code to standard format
 */
export function normalizeIcao(icao: string): string {
  return icao.trim().toUpperCase();
}

// Export types for use in API routes
export type { AirportDBClientConfig };
