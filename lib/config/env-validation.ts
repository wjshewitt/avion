// Environment Variable Validation for AirportDB Integration
// Ensures all required environment variables are present and valid

import { z } from "zod";

// ============================================================================
// Environment Variable Schemas
// ============================================================================

// AirportDB API Configuration Schema
const AirportDBConfigSchema = z.object({
  AIRPORTDB_API_KEY: z
    .string()
    .min(10, "AirportDB API key must be at least 10 characters")
    .refine(
      (key) => key.trim().length > 0 && !key.includes("your_airportdb_api_key"),
      "AirportDB API key appears to be a placeholder - please use a real API key"
    ),
});

// Complete Environment Schema (including existing variables)
const EnvironmentSchema = z.object({
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().refine((url) => {
    try {
      new URL(url);
      return url.startsWith("https://");
    } catch {
      return false;
    }
  }, "Supabase URL must be a valid HTTPS URL"),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(100, "Supabase anon key appears to be invalid (too short)"),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(100, "Supabase service role key appears to be invalid (too short)"),

  // Weather API Configuration
  CHECKWX_API_KEY: z
    .string()
    .min(16, "CheckWX API key must be at least 16 characters")
    .optional(),

  // AirportDB Configuration
  AIRPORTDB_API_KEY: AirportDBConfigSchema.shape.AIRPORTDB_API_KEY,

  WEATHER_SSOT_ENABLED: z
    .enum(["0", "1", "true", "false"])
    .optional(),

  NEXT_PUBLIC_WEATHER_SSOT_ENABLED: z
    .enum(["0", "1", "true", "false"])
    .optional(),

  // Mapbox Configuration (optional for airport features)
  NEXT_PUBLIC_MAPBOX_TOKEN: z
    .string()
    .startsWith("pk.", 'Mapbox token must start with "pk."')
    .optional(),

  // Node Environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates all environment variables required for the application
 * @throws {Error} If any required environment variables are missing or invalid
 */
export function validateEnvironment(): z.infer<typeof EnvironmentSchema> {
  try {
    const env = EnvironmentSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((err: any) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });

      throw new Error(
        `Environment validation failed:\n${missingVars.join("\n")}\n\n` +
          "Please check your .env.local file and ensure all required variables are set."
      );
    }
    throw error;
  }
}

/**
 * Validates only AirportDB-specific environment variables
 * @throws {Error} If AirportDB API key is missing or invalid
 */
export function validateAirportDBConfig(): z.infer<
  typeof AirportDBConfigSchema
> {
  try {
    const config = AirportDBConfigSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((err: any) => err.message).join(", ");
      throw new Error(
        `AirportDB configuration validation failed: ${issues}\n\n` +
          "Please ensure AIRPORTDB_API_KEY is set in your .env.local file with a valid API key from AirportDB.io"
      );
    }
    throw error;
  }
}

/**
 * Checks if AirportDB integration is properly configured
 * @returns {boolean} True if AirportDB API key is valid
 */
export function isAirportDBConfigured(): boolean {
  try {
    validateAirportDBConfig();
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets validated environment configuration
 * Safe to use after calling validateEnvironment()
 */
export function getEnvironmentConfig() {
  return validateEnvironment();
}

/**
 * Gets validated AirportDB configuration
 * Safe to use after calling validateAirportDBConfig()
 */
export function getAirportDBConfig() {
  return validateAirportDBConfig();
}

// ============================================================================
// Environment Variable Helpers
// ============================================================================

/**
 * Safely gets an environment variable with optional default
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue!;
}

/**
 * Gets a required environment variable and throws if not found
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

/**
 * Checks if we're running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Checks if we're running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * Checks if we're running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === "test";
}

// ============================================================================
// Startup Validation
// ============================================================================

/**
 * Validates environment on application startup
 * Call this early in your application lifecycle
 */
export function validateEnvironmentOnStartup(): void {
  try {
    const env = validateEnvironment();

    if (isDevelopment()) {
      console.log("✅ Environment validation passed");
      console.log(
        "🔑 AirportDB integration:",
        isAirportDBConfigured() ? "enabled" : "disabled"
      );
      console.log(
        "🗺️  Mapbox integration:",
        env.NEXT_PUBLIC_MAPBOX_TOKEN ? "enabled" : "disabled"
      );
      console.log(
        "🌤️  Weather integration:",
        env.CHECKWX_API_KEY ? "enabled" : "disabled"
      );
    }
  } catch (error) {
    console.error("❌ Environment validation failed:");
    console.error(error instanceof Error ? error.message : String(error));

    if (isProduction()) {
      // In production, exit the process if environment is invalid
      process.exit(1);
    } else {
      // In development, just warn but continue
      console.warn(
        "⚠️  Continuing in development mode with invalid environment"
      );
    }
  }
}

// ============================================================================
// Type Exports
// ============================================================================

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;
export type AirportDBConfig = z.infer<typeof AirportDBConfigSchema>;

// ============================================================================
// Default Export for Easy Import
// ============================================================================

export default {
  validate: validateEnvironment,
  validateAirportDB: validateAirportDBConfig,
  isConfigured: isAirportDBConfigured,
  getConfig: getEnvironmentConfig,
  getAirportDBConfig,
  validateOnStartup: validateEnvironmentOnStartup,
  isDevelopment,
  isProduction,
  isTest,
};
