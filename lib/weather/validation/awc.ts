import { z } from "zod";

const CoordinateSchema = z
  .array(z.number())
  .min(2)
  .transform((values) => [values[0], values[1]] as [number, number]);
const LinearRingSchema = z.array(CoordinateSchema).min(3);

const PolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(LinearRingSchema),
});

const MultiPolygonSchema = z.object({
  type: z.literal("MultiPolygon"),
  coordinates: z.array(z.array(LinearRingSchema)),
});

const PointSchema = z.object({
  type: z.literal("Point"),
  coordinates: CoordinateSchema,
});

export const AwcGeometrySchema = z
  .union([PolygonSchema, MultiPolygonSchema, PointSchema])
  .nullable()
  .optional();

const MovementSchema = z
  .object({
    direction: z.number().nullable().optional(),
    speed: z.number().nullable().optional(),
  })
  .partial();

const FlightLevelsSchema = z
  .object({
    lower: z.number().nullable().optional(),
    upper: z.number().nullable().optional(),
  })
  .partial();

const TimestampSchema = z
  .union([z.string(), z.number(), z.null()])
  .optional()
  .transform((value) => {
    if (typeof value === "number") {
      return new Date(value * 1000).toISOString();
    }
    if (typeof value === "string") {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    return undefined;
  });

const FlexibleFlightLevelsSchema = z
  .union([
    FlightLevelsSchema,
    z.array(z.union([z.string(), z.number()])).length(2),
    z.string(),
    z.number(),
  ])
  .optional()
  .transform((value) => {
    if (!value) return undefined;
    if (typeof value === "string") {
      const matches = value.match(/(\d+)/g);
      if (!matches) return undefined;
      const [lower, upper] = matches.map((num) => Number(num));
      return {
        lower,
        upper,
      };
    }
    if (typeof value === "number") {
      return {
        lower: value,
        upper: value,
      };
    }
    if (Array.isArray(value)) {
      const parsed = value.map((item) => {
        if (typeof item === "string") {
          return Number(item.replace(/\D/g, ""));
        }
        return item;
      });
      return {
        lower: parsed[0] ?? undefined,
        upper: parsed[1] ?? undefined,
      };
    }
    return {
      lower: value.lower ?? undefined,
      upper: value.upper ?? undefined,
    };
  });

const HazardPropertiesBaseSchema = z.object({
  hazard: z.string().nullable().optional(),
  phenomenon: z.string().nullable().optional(),
  severity: z.union([z.string(), z.number()]).nullable().optional(),
  issueTime: TimestampSchema,
  validTime: TimestampSchema,
  expireTime: TimestampSchema,
  validTimeFrom: TimestampSchema,
  validTimeTo: TimestampSchema,
  rawText: z.string().nullable().optional(),
  rawAirSigmet: z.string().nullable().optional(),
  movement: MovementSchema.optional(),
  flightLevels: FlexibleFlightLevelsSchema,
  altitude: z
    .object({
      min_ft_msl: z.number().nullable().optional(),
      max_ft_msl: z.number().nullable().optional(),
    })
    .partial()
    .optional(),
  icaoId: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  advisoryId: z.string().nullable().optional(),
});

export const AwcHazardFeatureSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.literal("Feature").optional(),
  properties: HazardPropertiesBaseSchema,
  geometry: AwcGeometrySchema,
});

export const AwcHazardGeoJsonSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(AwcHazardFeatureSchema),
});

const PirepPropertySchema = z.object({
  id: z.string().optional(),
  obs_time: z.string().optional(),
  aircraft_ref: z.string().optional(),
  altitude_ft_msl: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  wx: z.string().nullable().optional(),
  ice: z.string().nullable().optional(),
  turb: z.string().nullable().optional(),
  sky: z.string().nullable().optional(),
  temp_c: z.number().nullable().optional(),
  raw_text: z.string().nullable().optional(),
  station_id: z.string().nullable().optional(),
  report_type: z.string().nullable().optional(),
});

export const AwcPirepFeatureSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  type: z.literal("Feature").optional(),
  properties: PirepPropertySchema,
  geometry: AwcGeometrySchema,
});

export const AwcPirepGeoJsonSchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(AwcPirepFeatureSchema),
});

export const AwcStationInfoSchema = z.object({
  stations: z.array(
    z.object({
      icaoId: z.string(),
      name: z.string().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      elevation_m: z.number().nullable().optional(),
      elevation_ft: z.number().nullable().optional(),
      timezone: z.string().nullable().optional(),
      siteType: z.array(z.string()).optional(),
      runway: z
        .array(
          z.object({
            id: z.string().optional(),
            length_ft: z.number().nullable().optional(),
            surface: z.string().nullable().optional(),
          })
        )
        .optional(),
    })
  ),
});

export type AwcHazardFeature = z.infer<typeof AwcHazardFeatureSchema>;
export type AwcHazardGeoJson = z.infer<typeof AwcHazardGeoJsonSchema>;
export type AwcPirepFeature = z.infer<typeof AwcPirepFeatureSchema>;
export type AwcPirepGeoJson = z.infer<typeof AwcPirepGeoJsonSchema>;
export type AwcStationInfoResponse = z.infer<typeof AwcStationInfoSchema>;
export type AwcBoundingBox = z.infer<typeof AwcBboxSchema>;

export const AwcBboxSchema = z
  .string()
  .transform((value) => value.split(",").map((segment) => Number(segment)))
  .refine((segments) => segments.length === 4, "Bounding box must have four values")
  .refine(
    (segments) => segments.every((segment) => Number.isFinite(segment)),
    "Bounding box values must be numeric"
  )
  .transform(([west, south, east, north]) => ({ west, south, east, north }));
