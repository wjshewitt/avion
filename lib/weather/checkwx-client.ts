// CheckWX API Client - Server-side only
// This client handles secure communication with the CheckWX API
// and should NEVER be used on the client-side to prevent API key exposure

import {
  DecodedMetar,
  DecodedTaf,
  StationData,
  MetarResponse,
  TafResponse,
  StationResponse,
  MetarResponseSchema,
  TafResponseSchema,
  StationResponseSchema,
  CheckWXError,
  CheckWXErrorSchema,
} from "@/types/checkwx";

// Custom error class for CheckWX API errors
export class CheckWXApiError extends Error {
  public readonly statusCode: number;
  public readonly checkwxError?: CheckWXError;

  constructor(
    message: string,
    statusCode: number,
    checkwxError?: CheckWXError
  ) {
    super(message);
    this.name = "CheckWXApiError";
    this.statusCode = statusCode;
    this.checkwxError = checkwxError;
  }
}

// CheckWX API client configuration
interface CheckWXClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

// CheckWX API client class
export class CheckWXClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: CheckWXClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://api.checkwx.com";
    this.timeout = config.timeout || 5000; // 5 seconds default timeout

    if (!this.apiKey) {
      throw new Error("CheckWX API key is required");
    }
  }

  /**
   * Make a request to the CheckWX API with proper error handling
   */
  private async makeRequest<T>(endpoint: string, schema: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-API-Key": this.apiKey,
          Accept: "application/json",
          "User-Agent": "FlightOps-AI-Console/1.0",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle different HTTP status codes
      if (!response.ok) {
        let errorMessage = `CheckWX API request failed: ${response.status} ${response.statusText}`;
        let checkwxError: CheckWXError | undefined;

        try {
          const errorData = await response.json();
          const parsedError = CheckWXErrorSchema.safeParse(errorData);
          if (parsedError.success) {
            checkwxError = parsedError.data;
            errorMessage = checkwxError.message || errorMessage;
          }
        } catch {
          // If we can't parse the error response, use the default message
        }

        // Handle specific status codes
        switch (response.status) {
          case 401:
            throw new CheckWXApiError(
              "Invalid CheckWX API key or authentication failed",
              401,
              checkwxError
            );
          case 403:
            throw new CheckWXApiError(
              "CheckWX API access forbidden - check your subscription",
              403,
              checkwxError
            );
          case 404:
            throw new CheckWXApiError(
              "Requested weather data not found",
              404,
              checkwxError
            );
          case 429:
            throw new CheckWXApiError(
              "CheckWX API rate limit exceeded - please try again later",
              429,
              checkwxError
            );
          case 500:
          case 502:
          case 503:
          case 504:
            throw new CheckWXApiError(
              "CheckWX API server error - please try again later",
              response.status,
              checkwxError
            );
          default:
            throw new CheckWXApiError(
              errorMessage,
              response.status,
              checkwxError
            );
        }
      }

      const data = await response.json();

      // Validate response data with Zod schema
      const parseResult = schema.safeParse(data);
      if (!parseResult.success) {
        console.error(
          "CheckWX API response validation failed:",
          parseResult.error.issues
        );
        throw new CheckWXApiError(
          "Invalid response format from CheckWX API",
          500
        );
      }

      return parseResult.data;
    } catch (error) {
      if (error instanceof CheckWXApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new CheckWXApiError("CheckWX API request timeout", 408);
        }

        // Network or other fetch errors
        throw new CheckWXApiError(
          `CheckWX API request failed: ${error.message}`,
          0
        );
      }

      throw new CheckWXApiError("Unknown error occurred", 500);
    }
  }

  /**
   * Batch ICAO codes into chunks for API requests
   * CheckWX API supports up to 25 ICAO codes per request
   */
  private batchIcaos(icaos: string[]): string[][] {
    const batches: string[][] = [];
    const batchSize = 25; // CheckWX API limit

    for (let i = 0; i < icaos.length; i += batchSize) {
      batches.push(icaos.slice(i, i + batchSize));
    }

    return batches;
  }

  /**
   * Validate and normalize ICAO codes
   */
  private validateIcaos(icaos: string[]): string[] {
    return icaos.map((icao) => {
      const normalized = icao.trim().toUpperCase();
      if (!/^[A-Z]{4}$/.test(normalized)) {
        throw new Error(`Invalid ICAO code: ${icao}`);
      }
      return normalized;
    });
  }

  /**
   * Get METAR data for one or more airports
   */
  async getMetar(icaos: string[]): Promise<DecodedMetar[]> {
    if (!icaos.length) {
      throw new Error("At least one ICAO code is required");
    }

    const validatedIcaos = this.validateIcaos(icaos);
    const batches = this.batchIcaos(validatedIcaos);
    const results: DecodedMetar[] = [];

    // Process batches sequentially to avoid overwhelming the API
    for (const batch of batches) {
      const icaoString = batch.join(",");
      const endpoint = `/metar/${icaoString}/decoded`;

      const response = await this.makeRequest<MetarResponse>(
        endpoint,
        MetarResponseSchema
      );

      results.push(...response.data);
    }

    return results;
  }

  /**
   * Get TAF data for one or more airports
   */
  async getTaf(icaos: string[]): Promise<DecodedTaf[]> {
    if (!icaos.length) {
      throw new Error("At least one ICAO code is required");
    }

    const validatedIcaos = this.validateIcaos(icaos);
    const batches = this.batchIcaos(validatedIcaos);
    const results: DecodedTaf[] = [];

    // Process batches sequentially to avoid overwhelming the API
    for (const batch of batches) {
      const icaoString = batch.join(",");
      const endpoint = `/taf/${icaoString}/decoded`;

      const response = await this.makeRequest<TafResponse>(
        endpoint,
        TafResponseSchema
      );

      results.push(...response.data);
    }

    return results;
  }

  /**
   * Get station information for one or more airports
   */
  async getStation(icaos: string[]): Promise<StationData[]> {
    if (!icaos.length) {
      throw new Error("At least one ICAO code is required");
    }

    const validatedIcaos = this.validateIcaos(icaos);
    const batches = this.batchIcaos(validatedIcaos);
    const results: StationData[] = [];

    // Process batches sequentially to avoid overwhelming the API
    for (const batch of batches) {
      const icaoString = batch.join(",");
      const endpoint = `/station/${icaoString}`;

      const response = await this.makeRequest<StationResponse>(
        endpoint,
        StationResponseSchema
      );

      results.push(...response.data);
    }

    return results;
  }

  /**
   * Get METAR data for airports within a radius of a center point
   */
  async getMetarRadius(
    centerIcao: string,
    radiusMiles: number
  ): Promise<DecodedMetar[]> {
    if (radiusMiles < 1 || radiusMiles > 250) {
      throw new Error("Radius must be between 1 and 250 miles");
    }

    const validatedIcao = this.validateIcaos([centerIcao])[0];
    const endpoint = `/metar/radius/${validatedIcao}/${radiusMiles}/decoded`;

    const response = await this.makeRequest<MetarResponse>(
      endpoint,
      MetarResponseSchema
    );

    return response.data;
  }
}

// Singleton instance for server-side use
let checkwxClient: CheckWXClient | null = null;

/**
 * Get the CheckWX client instance
 * This ensures we only create one instance and reuse it
 */
export function getCheckWXClient(): CheckWXClient {
  if (!checkwxClient) {
    const apiKey = process.env.CHECKWX_API_KEY;

    if (!apiKey) {
      throw new Error(
        "CHECKWX_API_KEY environment variable is not set. " +
          "Please add your CheckWX API key to your .env.local file."
      );
    }

    checkwxClient = new CheckWXClient({ apiKey });
  }

  return checkwxClient;
}

// Export types for use in API routes
export type { CheckWXClientConfig };
