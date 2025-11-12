"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";
import AirportWeatherBriefing from "@/components/weather/AirportWeatherBriefing";
import { toast } from "sonner";

export default function WeatherBriefingPage() {
  const params = useParams<{ icao: string }>();
  const router = useRouter();
  const icao = params?.icao?.toUpperCase() || "";

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    try {
      // Create a simplified text export
      const content = document.querySelector("#briefing-content");
      if (!content) {
        toast.error("Unable to export briefing");
        return;
      }

      const textContent = content.textContent || "";
      const blob = new Blob([textContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `weather-briefing-${icao}-${new Date().toISOString().split("T")[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Weather briefing downloaded");
    } catch (error) {
      toast.error("Failed to download briefing");
      console.error(error);
    }
  };

  if (!icao || icao.length !== 4) {
    return (
      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/weather")}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Weather
            </button>
          </div>
          <div className="border border-red bg-red/5 p-6">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-semibold text-red">Invalid ICAO Code</p>
                <p className="text-sm text-text-secondary">
                  Please provide a valid 4-letter ICAO airport code.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      {/* Header - Fixed */}
      <div className="border-b border-border bg-white px-8 py-4 print:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push(`/weather/${icao.toLowerCase()}`)}
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-lg font-semibold text-text-primary">
              Professional Weather Briefing - {icao}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm hover:bg-surface"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-2 border border-border px-3 py-1.5 text-sm hover:bg-surface"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Briefing Content */}
      <div id="briefing-content" className="px-8 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Print Header */}
          <div className="mb-8 hidden border-b border-border pb-4 print:block">
            <h1 className="text-xl font-bold text-text-primary">
              PROFESSIONAL WEATHER BRIEFING
            </h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-text-secondary">
              <span>Airport: {icao}</span>
              <span>•</span>
              <span>
                Generated: {new Date().toLocaleString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Weather Briefing Component */}
          <AirportWeatherBriefing icao={icao} />
        </div>
      </div>
    </div>
  );
}
