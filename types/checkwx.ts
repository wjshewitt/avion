// CheckWX Aviation Weather API Types with Zod Validation
import { z } from "zod";

// ============================================================================
// Base Data Types
// ============================================================================

// Country data
export const CountryDataSchema = z.object({
  code: z.string(),
  name: z.string(),
});
export type CountryData = z.infer<typeof CountryDataSchema>;

// State/Province data
export const StateDataSchema = z.object({
  code: z.string(),
  name: z.string(),
});
export type StateData = z.infer<typeof StateDataSchema>;

// Geographic point
export const GeoPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});
export type GeoPoint = z.infer<typeof GeoPointSchema>;

// Elevation data
export const ElevationDataSchema = z.object({
  feet: z.number(),
  meters: z.number(),
});
export type ElevationData = z.infer<typeof ElevationDataSchema>;

// Temperature data
export const TemperatureDataSchema = z.object({
  celsius: z.number(),
  fahrenheit: z.number(),
});
export type TemperatureData = z.infer<typeof TemperatureDataSchema>;

// Barometer data
export const BarometerDataSchema = z.object({
  hg: z.number(),
  hpa: z.number(),
  kpa: z.number(),
  mb: z.number(),
});
export type BarometerData = z.infer<typeof BarometerDataSchema>;

// Humidity data
export const HumidityDataSchema = z.object({
  percent: z.number(),
});
export type HumidityData = z.infer<typeof HumidityDataSchema>;

// Visibility data
export const VisibilityDataSchema = z.object({
  miles: z.union([z.string(), z.number()]).optional(),
  miles_float: z.number().optional(),
  miles_text: z.string().optional(),
  meters: z.union([z.string(), z.number()]).optional(),
  meters_float: z.number().optional(),
  meters_text: z.string().optional(),
});
export type VisibilityData = z.infer<typeof VisibilityDataSchema>;

// Wind data
export const WindDataSchema = z.object({
  degrees: z.number().optional(),
  speed_kts: z.number().optional(),
  speed_mph: z.number().optional(),
  speed_mps: z.number().optional(),
  speed_kph: z.number().optional(),
  gust_kts: z.number().optional(),
  gust_mph: z.number().optional(),
  gust_mps: z.number().optional(),
  gust_kph: z.number().optional(),
});
export type WindData = z.infer<typeof WindDataSchema>;

// Cloud layer data
export const CloudLayerSchema = z.object({
  code: z.string(),
  text: z.string(),
  feet: z.number().optional(),
  meters: z.number().optional(),
  base_feet_agl: z.number().optional(),
  base_meters_agl: z.number().optional(),
});
export type CloudLayer = z.infer<typeof CloudLayerSchema>;

// Runway data
export const RunwayDataSchema = z.object({
  ident1: z.string(),
  ident2: z.string(),
  length_ft: z.number(),
  width_ft: z.number(),
  surface: z.string(),
  lights: z.boolean(),
});
export type RunwayData = z.infer<typeof RunwayDataSchema>;

// Timezone data
export const TimezoneDataSchema = z.object({
  name: z.string(),
  offset: z.string(),
  dst: z.boolean(),
});
export type TimezoneData = z.infer<typeof TimezoneDataSchema>;

// ============================================================================
// Station Information
// ============================================================================

export const StationDataSchema = z.object({
  icao: z.string().optional(),
  iata: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  country: CountryDataSchema.optional(),
  state: StateDataSchema.optional(),
  geometry: GeoPointSchema.optional(),
  elevation: ElevationDataSchema.optional(),
  runways: z.array(RunwayDataSchema).optional(),
  timezone: TimezoneDataSchema.optional(),
});
export type StationData = z.infer<typeof StationDataSchema>;

// ============================================================================
// METAR Data
// ============================================================================

export const DecodedMetarSchema = z.object({
  icao: z.string(),
  name: z.string().optional(),
  observed: z.string(), // ISO 8601 timestamp
  raw_text: z.string(),
  barometer: BarometerDataSchema.optional(),
  ceiling: z
    .object({
      feet: z.number().optional(),
      meters: z.number().optional(),
    })
    .optional(),
  clouds: z.array(CloudLayerSchema).optional(),
  dewpoint: TemperatureDataSchema.optional(),
  elevation: ElevationDataSchema.optional(),
  flight_category: z.enum(["VFR", "MVFR", "IFR", "LIFR"]).optional(),
  humidity: HumidityDataSchema.optional(),
  temperature: TemperatureDataSchema.optional(),
  visibility: VisibilityDataSchema.optional(),
  wind: WindDataSchema.optional(),
  station: StationDataSchema.optional(),
});
export type DecodedMetar = z.infer<typeof DecodedMetarSchema>;

// ============================================================================
// TAF Data
// ============================================================================

// TAF forecast period
export const TafForecastPeriodSchema = z.object({
  timestamp: z
    .union([
      z.string(), // ISO 8601 timestamp
      z.object({
        from: z.string(),
        to: z.string(),
      }),
    ])
    .optional(),
  raw_text: z.string().optional(),
  barometer: BarometerDataSchema.optional(),
  clouds: z.array(CloudLayerSchema).optional(),
  flight_category: z.enum(["VFR", "MVFR", "IFR", "LIFR"]).optional(),
  temperature: TemperatureDataSchema.optional(),
  visibility: VisibilityDataSchema.optional(),
  wind: WindDataSchema.optional(),
  change: z
    .object({
      indicator: z
        .union([
          z.enum(["BECMG", "TEMPO", "FM", "PROB"]),
          z.object({
            code: z.string(),
            text: z.string().optional(),
            desc: z.string().optional(),
          }),
        ])
        .optional(),
      period: z
        .object({
          from: z.string(),
          to: z.string(),
        })
        .optional(),
    })
    .optional(),
});
export type TafForecastPeriod = z.infer<typeof TafForecastPeriodSchema>;

export const DecodedTafSchema = z.object({
  icao: z.string(),
  name: z.string().optional(),
  issued: z.string().optional(), // ISO 8601 timestamp
  bulletin_time: z.string().optional(), // ISO 8601 timestamp
  valid_time_from: z.string().optional(), // ISO 8601 timestamp
  valid_time_to: z.string().optional(), // ISO 8601 timestamp
  timestamp: z
    .object({
      from: z.string(),
      to: z.string(),
    })
    .optional(),
  raw_text: z.string(),
  station: StationDataSchema.optional(),
  forecast: z.array(TafForecastPeriodSchema).optional(),
});
export type DecodedTaf = z.infer<typeof DecodedTafSchema>;

// ============================================================================
// API Response Wrappers
// ============================================================================

// Generic API response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    results: z.number(),
    data: z.array(dataSchema),
  });

// Specific response types
export const MetarResponseSchema = ApiResponseSchema(DecodedMetarSchema);
export type MetarResponse = z.infer<typeof MetarResponseSchema>;

export const TafResponseSchema = ApiResponseSchema(DecodedTafSchema);
export type TafResponse = z.infer<typeof TafResponseSchema>;

export const StationResponseSchema = ApiResponseSchema(StationDataSchema);
export type StationResponse = z.infer<typeof StationResponseSchema>;

// ============================================================================
// Error Types
// ============================================================================

export const CheckWXErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.number().optional(),
});
export type CheckWXError = z.infer<typeof CheckWXErrorSchema>;

// ============================================================================
// API Route Response Types
// ============================================================================

// Generic API route response wrapper for consistent error handling
export const WeatherApiResponseSchema = <T extends z.ZodTypeAny>(
  dataSchema: T
) =>
  z.object({
    data: dataSchema,
    success: z.boolean(),
    error: z.string().optional(),
    cached: z.boolean().optional(),
    timestamp: z.string(),
  });

// Specific API route response types
export const MetarApiResponseSchema = WeatherApiResponseSchema(
  z.array(DecodedMetarSchema)
);
export type MetarApiResponse = z.infer<typeof MetarApiResponseSchema>;

export const TafApiResponseSchema = WeatherApiResponseSchema(
  z.array(DecodedTafSchema)
);
export type TafApiResponse = z.infer<typeof TafApiResponseSchema>;

export const StationApiResponseSchema = WeatherApiResponseSchema(
  z.array(StationDataSchema)
);
export type StationApiResponse = z.infer<typeof StationApiResponseSchema>;

// ============================================================================
// Request Parameter Types
// ============================================================================

// ICAO validation
export const IcaoSchema = z
  .string()
  .regex(/^[A-Z]{4}$/, "ICAO code must be 4 uppercase letters");
export type Icao = z.infer<typeof IcaoSchema>;

// Multiple ICAOs
export const IcaosSchema = z.array(IcaoSchema).min(1).max(25); // CheckWX API limit is 25
export type Icaos = z.infer<typeof IcaosSchema>;

// Radius search parameters
export const RadiusSearchSchema = z.object({
  icao: IcaoSchema,
  radiusMiles: z.number().min(1).max(250), // CheckWX API limit is 250 miles
});
export type RadiusSearch = z.infer<typeof RadiusSearchSchema>;

// ============================================================================
// Utility Types
// ============================================================================

// Flight category with color mapping
export const FlightCategoryColors = {
  VFR: "green",
  MVFR: "blue",
  IFR: "red",
  LIFR: "purple",
} as const;

// Weather condition severity
export type WeatherSeverity = "low" | "moderate" | "high" | "extreme";

// Weather concern types for briefings
export type WeatherConcernType =
  | "low_visibility"
  | "low_ceiling"
  | "high_winds"
  | "gusts"
  | "icing_conditions"
  | "thunderstorms"
  | "turbulence";

// Weather briefing data
export const WeatherBriefingSchema = z.object({
  departure: z.object({
    icao: IcaoSchema,
    metar: DecodedMetarSchema.optional(),
    taf: DecodedTafSchema.optional(),
  }),
  arrival: z.object({
    icao: IcaoSchema,
    metar: DecodedMetarSchema.optional(),
    taf: DecodedTafSchema.optional(),
  }),
  concerns: z.array(
    z.object({
      type: z.enum([
        "low_visibility",
        "low_ceiling",
        "high_winds",
        "gusts",
        "icing_conditions",
        "thunderstorms",
        "turbulence",
      ]),
      severity: z.enum(["low", "moderate", "high", "extreme"]),
      description: z.string(),
      airport: IcaoSchema,
    })
  ),
  generated_at: z.string(),
  valid_until: z.string(),
});
export type WeatherBriefing = z.infer<typeof WeatherBriefingSchema>;
