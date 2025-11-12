import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ConcernSchema = z.object({
  airport: z.string(),
  source: z.enum(["METAR", "TAF"]).or(z.string()),
  severity: z.enum(["low", "moderate", "high", "extreme"]),
  type: z.string(),
  description: z.string(),
  details: z
    .object({
      current_value: z.any().optional(),
      threshold: z.any().optional(),
      unit: z.string().optional(),
    })
    .optional(),
  timestamp: z
    .union([
      z.string(),
      z.object({ from: z.string(), to: z.string() }),
    ])
    .optional(),
});

const SaveBriefingSchema = z.object({
  flightId: z.string().uuid(),
  departureIcao: z.string().min(3),
  arrivalIcao: z.string().min(3),
  riskScore: z.number().min(0).max(100),
  alertLevel: z.enum(["green", "yellow", "red"]),
  briefingTime: z.string(),
  pdfUrl: z.string().url().optional(),
  depMetar: z.any().optional(),
  depTaf: z.any().optional(),
  arrMetar: z.any().optional(),
  arrTaf: z.any().optional(),
  concerns: z.array(ConcernSchema).default([]),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const payload = SaveBriefingSchema.parse(body);

    // Auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure ownership
    const { data: flight, error: fetchErr } = await (supabase as any)
      .from("user_flights")
      .select("id, user_id")
      .eq("id", payload.flightId)
      .single();

    if (fetchErr || !flight || flight.user_id !== user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Build update
    const update: any = {
      weather_data: {
        origin: { metar: payload.depMetar ?? null, taf: payload.depTaf ?? null },
        destination: { metar: payload.arrMetar ?? null, taf: payload.arrTaf ?? null },
        concerns: payload.concerns,
        briefing_time: payload.briefingTime,
        pdf_url: payload.pdfUrl ?? null,
        route: `${payload.departureIcao.toUpperCase()}-${payload.arrivalIcao.toUpperCase()}`,
      },
      weather_risk_score: payload.riskScore,
      weather_alert_level: payload.alertLevel,
      weather_updated_at: new Date().toISOString(),
    };

    const { error: updateErr } = await (supabase as any)
      .from("user_flights")
      .update(update)
      .eq("id", payload.flightId);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, pdfUrl: payload.pdfUrl });
  } catch (error: any) {
    console.error("Save briefing error:", error);
    const message = error?.message || "Invalid request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
