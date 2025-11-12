"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import { handleServerError, type ActionResult } from "@/lib/utils/errors";
import { Flight, type Database } from "@/lib/supabase/types";
import { fetchFlightWeather } from "@/lib/weather/weather-integration";
import { convertToIcao } from "@/lib/airports/conversion";
import { getOrRefreshAirport } from "@/lib/airports/airportdb";

// Validation schema for flight creation
const createFlightSchema = z.object({
  code: z
    .string()
    .min(3, "Flight code must be at least 3 characters")
    .max(10, "Flight code must be at most 10 characters"),
  origin: z
    .string()
    .regex(/^[A-Za-z]{3,4}$/i, "Origin must be a valid IATA (3) or ICAO (4) code"),
  destination: z
    .string()
    .regex(/^[A-Za-z]{3,4}$/i, "Destination must be a valid IATA (3) or ICAO (4) code"),
  status: z.enum(["On Time", "Delayed", "Cancelled"]).default("On Time"),
  scheduled_at: z.string().datetime("Invalid scheduled datetime format"),
  arrival_at: z
    .string()
    .datetime("Invalid arrival datetime format")
    .optional()
    .nullable(),
  operator: z.string().optional().nullable(),
  aircraft: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  passenger_count: z.number().int().optional().nullable(),
  crew_count: z.number().int().optional().nullable(),
});

// Helpers to coerce empty strings/null to undefined for optional fields
const emptyToUndefined = (val: unknown) =>
  val === "" || val === null || typeof val === "undefined" ? undefined : val;
const emptyToNull = (val: unknown) => (val === "" ? null : (val as any));

// Validation schema for flight updates (tolerant of empty strings from forms)
const updateFlightSchema = z.object({
  id: z.string().uuid("Invalid flight ID"),
  code: z.preprocess(emptyToUndefined, z.string().min(3).max(10)).optional(),
  origin: z
    .preprocess(
      emptyToUndefined,
      z.string().regex(/^[A-Za-z]{3,4}$/i, "Origin must be a valid IATA (3) or ICAO (4) code")
    )
    .optional(),
  destination: z
    .preprocess(
      emptyToUndefined,
      z.string().regex(/^[A-Za-z]{3,4}$/i, "Destination must be a valid IATA (3) or ICAO (4) code")
    )
    .optional(),
  status: z
    .preprocess((v) => {
      if (typeof v === "string") {
        const t = v.trim();
        return t.length === 0 ? undefined : t;
      }
      return v;
    }, z.enum(["On Time", "Delayed", "Cancelled"]))
    .optional(),
  scheduled_at: z
    .preprocess(emptyToUndefined, z.string().datetime())
    .optional(),
  arrival_at: z
    .preprocess((v) => (v === "" ? null : v), z.string().datetime())
    .optional()
    .nullable(),
  operator: z.preprocess(emptyToUndefined, z.string()).optional().nullable(),
  aircraft: z.preprocess(emptyToUndefined, z.string()).optional().nullable(),
  notes: z.preprocess((v) => (typeof v === "string" ? v : v ?? null), z.string()).optional().nullable(),
  passenger_count: z.number().int().optional().nullable(),
  crew_count: z.number().int().optional().nullable(),
});

/**
 * Creates a new flight record and logs the creation event
 */
export async function createFlight(
  data: z.infer<typeof createFlightSchema>
): Promise<ActionResult<Flight>> {
  try {
    // Validate input
    const validatedData = createFlightSchema.parse(data);

    const supabase = await createServerSupabase();

    // Get current user - required for user isolation
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be authenticated to create flights");
    }

    const originInput = validatedData.origin.trim().toUpperCase();
    const destinationInput = validatedData.destination.trim().toUpperCase();

    let originIcao: string;
    let destinationIcao: string;

    try {
      const [originResult, destinationResult] = await Promise.all([
        convertToIcao(originInput),
        convertToIcao(destinationInput),
      ]);
      originIcao = originResult;
      destinationIcao = destinationResult;
    } catch (conversionError) {
      throw new Error(
        conversionError instanceof Error
          ? conversionError.message
          : "Unable to convert airport codes to ICAO identifiers."
      );
    }

    // Add user_id and ICAO codes to the flight data
    const flightDataWithUser = {
      code: validatedData.code.trim().toUpperCase(),
      origin: originInput,
      destination: destinationInput,
      status: validatedData.status,
      scheduled_at: validatedData.scheduled_at,
      arrival_at: validatedData.arrival_at ?? null,
      operator: validatedData.operator ?? null,
      aircraft: validatedData.aircraft ?? null,
      notes: validatedData.notes ?? null,
      passenger_count: validatedData.passenger_count ?? null,
      crew_count: validatedData.crew_count ?? null,
      user_id: user.id,
      origin_icao: originIcao,
      destination_icao: destinationIcao,
    } satisfies Database['public']['Tables']['user_flights']['Insert'];

    // Insert flight record
    const { data: flight, error: flightError } = await ((supabase as any)
      .from("user_flights")
      .insert(flightDataWithUser)
      .select()
      .single());

    if (flightError) throw flightError;
    if (!flight) throw new Error("Failed to create flight");

    // Fetch initial weather data for the flight
    try {
      const weatherData = await fetchFlightWeather(flight);
      
      if (weatherData) {
        // Update flight with weather data
        const weatherUpdate = {
          weather_data: {
            origin: weatherData.origin,
            destination: weatherData.destination,
          },
          weather_risk_score: weatherData.riskScore,
          weather_alert_level: weatherData.alertLevel,
          weather_focus: weatherData.focus.period,
          weather_updated_at: weatherData.lastUpdated.toISOString(),
          weather_cache_expires: weatherData.origin.expiresAt.toISOString(),
        } satisfies Database['public']['Tables']['user_flights']['Update'];

        const { error: weatherUpdateError } = await ((supabase as any)
          .from("user_flights")
          .update(weatherUpdate)
          .eq("id", flight.id));

        if (weatherUpdateError) {
          console.error("Failed to update flight weather data:", weatherUpdateError);
        }
      }
    } catch (weatherError) {
      console.error("Failed to fetch weather for new flight:", weatherError);
      // Don't fail flight creation if weather fetch fails
    }

    // Concurrently fetch and persist authoritative airports (non-blocking if fails)
    try {
      await Promise.all([
        getOrRefreshAirport(originIcao),
        getOrRefreshAirport(destinationIcao),
      ]);
    } catch (airportErr) {
      console.error("Background airport fetch failed:", airportErr);
    }

    // Log creation event
    try {
      const admin = createAdminClient();
      const eventData = {
        flight_id: flight.id,
        event_type: "created" as const,
        user_id: user.id,
        changed_data: {
          ...validatedData,
          code: validatedData.code.trim().toUpperCase(),
          origin: originInput,
          destination: destinationInput,
        } as Record<string, any>,
      } satisfies Database['public']['Tables']['flight_events']['Insert'];

      const { error: eventError } = await ((admin as any)
        .from("flight_events")
        .insert(eventData));

      if (eventError) {
        console.error("Failed to log flight creation event:", eventError);
      }
    } catch (eventError) {
      console.error("Failed to log flight creation event:", eventError);
    }

    // Revalidate the flights page cache
    revalidatePath("/flights");

    return { success: true, data: flight };
  } catch (error) {
    console.error("Create flight error:", error);
    return {
      success: false,
      error: handleServerError(error),
    };
  }
}

/**
 * Updates an existing flight record and logs the update event
 */
export async function updateFlight(
  data: z.infer<typeof updateFlightSchema>
): Promise<ActionResult<Flight>> {
  try {
    // Validate input
    const validatedData = updateFlightSchema.parse(data);
    const { id, ...updateFields } = validatedData;

    const supabase = await createServerSupabase();

    // Get current user for event logging
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get the current flight data before update for event logging
    const { data: currentFlight } = await supabase
      .from("user_flights")
      .select()
      .eq("id", id)
      .single();

    // Prepare typed update payload
    const typedUpdateFields: Record<string, any> = {};

    if (updateFields.code !== undefined) {
      const normalizedCode = updateFields.code.trim().toUpperCase();
      typedUpdateFields.code = normalizedCode;
      updateFields.code = normalizedCode;
    }

    if (updateFields.origin !== undefined) {
      const normalizedOrigin = updateFields.origin.trim().toUpperCase();
      try {
        const originIcao = await convertToIcao(normalizedOrigin);
        typedUpdateFields.origin = normalizedOrigin;
        typedUpdateFields.origin_icao = originIcao;
        updateFields.origin = normalizedOrigin;
      } catch (conversionError) {
        throw new Error(
          conversionError instanceof Error
            ? conversionError.message
            : "Unable to convert origin airport code to ICAO."
        );
      }
    }

    if (updateFields.destination !== undefined) {
      const normalizedDestination = updateFields.destination.trim().toUpperCase();
      try {
        const destinationIcao = await convertToIcao(normalizedDestination);
        typedUpdateFields.destination = normalizedDestination;
        typedUpdateFields.destination_icao = destinationIcao;
        updateFields.destination = normalizedDestination;
      } catch (conversionError) {
        throw new Error(
          conversionError instanceof Error
            ? conversionError.message
            : "Unable to convert destination airport code to ICAO."
        );
      }
    }

    if (updateFields.status !== undefined) typedUpdateFields.status = updateFields.status;
    if (updateFields.scheduled_at !== undefined) typedUpdateFields.scheduled_at = updateFields.scheduled_at;
    if (updateFields.arrival_at !== undefined) typedUpdateFields.arrival_at = updateFields.arrival_at ?? null;
    if (updateFields.operator !== undefined) typedUpdateFields.operator = updateFields.operator ?? null;
    if (updateFields.aircraft !== undefined) typedUpdateFields.aircraft = updateFields.aircraft ?? null;
    if (updateFields.notes !== undefined) typedUpdateFields.notes = updateFields.notes ?? null;
    if (updateFields.passenger_count !== undefined) typedUpdateFields.passenger_count = updateFields.passenger_count ?? null;
    if (updateFields.crew_count !== undefined) typedUpdateFields.crew_count = updateFields.crew_count ?? null;

    // Update flight record
    const { data: flight, error: flightError } = await ((supabase as any)
      .from("user_flights")
      .update(typedUpdateFields)
      .eq("id", id)
      .select()
      .single());

    if (flightError) throw flightError;
    if (!flight) throw new Error("Flight not found");

    // Log update event
    try {
      const admin = createAdminClient();
      const eventData = {
        flight_id: flight.id,
        event_type: "updated" as const,
        user_id: user?.id ?? null,
        changed_data: {
          before: currentFlight,
          after: updateFields,
        } as Record<string, any>,
      } satisfies Database['public']['Tables']['flight_events']['Insert'];

      const { error: eventError } = await ((admin as any)
        .from("flight_events")
        .insert(eventData));

      if (eventError) {
        console.error("Failed to log flight update event:", eventError);
      }
    } catch (eventError) {
      console.error("Failed to log flight update event:", eventError);
    }

    // Revalidate the flights page cache
    revalidatePath("/flights");
    revalidatePath(`/flights/${id}`);

    return { success: true, data: flight };
  } catch (error) {
    console.error("Update flight error:", error);
    return {
      success: false,
      error: handleServerError(error),
    };
  }
}

/**
 * Deletes a flight record and logs the deletion event
 */
export async function deleteFlight(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    // Validate ID format
    const idSchema = z.string().uuid("Invalid flight ID");
    const validatedId = idSchema.parse(id);

    const supabase = await createServerSupabase();

    // Get current user for event logging
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get the flight data before deletion for event logging
    const { data: flightToDelete } = await supabase
      .from("user_flights")
      .select()
      .eq("id", validatedId)
      .single();

    if (!flightToDelete) {
      throw new Error("Flight not found");
    }

    // Log deletion event before removing the flight
    try {
      const admin = createAdminClient();
      const eventData = {
        flight_id: validatedId,
        event_type: "deleted" as const,
        user_id: user?.id ?? null,
        changed_data: flightToDelete as Record<string, any>,
      } satisfies Database['public']['Tables']['flight_events']['Insert'];

      const { error: eventError } = await ((admin as any)
        .from("flight_events")
        .insert(eventData));

      if (eventError) {
        console.error("Failed to log flight deletion event:", eventError);
      }
    } catch (eventError) {
      console.error("Failed to log flight deletion event:", eventError);
    }

    // Delete flight record (cascade will delete related events)
    const { error: deleteError } = await supabase
      .from("user_flights")
      .delete()
      .eq("id", validatedId);

    if (deleteError) throw deleteError;

    // Revalidate the flights page cache
    revalidatePath("/flights");

    return { success: true, data: { id: validatedId } };
  } catch (error) {
    console.error("Delete flight error:", error);
    return {
      success: false,
      error: handleServerError(error),
    };
  }
}
