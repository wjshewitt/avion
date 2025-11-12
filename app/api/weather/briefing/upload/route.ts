import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const flightId = formData.get("flightId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["application/pdf"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF is allowed." },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage (bucket must exist and be public or signed)
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const safeFlightId = (flightId || "general").replace(/[^a-zA-Z0-9-]/g, "");
    const fileName = `${user.id}-${safeFlightId}-${ts}.pdf`;
    const filePath = `briefings/${user.id}/${safeFlightId}/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("briefings")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL (bucket should be configured public; otherwise use signed URL policy)
    const {
      data: { publicUrl },
    } = supabase.storage.from("briefings").getPublicUrl(filePath);

    return NextResponse.json({ url: publicUrl, path: uploadData?.path });
  } catch (error) {
    console.error("Error uploading briefing PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
