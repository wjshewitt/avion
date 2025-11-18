import type { Metadata } from "next";
import { ExperimentalSectionShell } from "@/components/experimental/ExperimentalSectionShell";
import { ExperimentalWeatherViewport } from "@/components/experimental/ExperimentalWeatherViewport";
import { ExperimentalRiskGauge } from "@/components/experimental/ExperimentalRiskGauge";
import { ExperimentalFuelMonitor } from "@/components/experimental/ExperimentalFuelMonitor";
import { ExperimentalChecklist } from "@/components/experimental/ExperimentalChecklist";
import { ExperimentalAltimeter } from "@/components/experimental/ExperimentalAltimeter";
import { ExperimentalVerticalProfile } from "@/components/experimental/ExperimentalVerticalProfile";
import { ExperimentalWeightBalance } from "@/components/experimental/ExperimentalWeightBalance";
import { ExperimentalHeadingIndicator } from "@/components/experimental/ExperimentalHeadingIndicator";
import { ExperimentalVerticalSpeed } from "@/components/experimental/ExperimentalVerticalSpeed";
import { ExperimentalNotamTimeline } from "@/components/experimental/ExperimentalNotamTimeline";
import { ExperimentalRunwayDiagram } from "@/components/experimental/ExperimentalRunwayDiagram";
import { ExperimentalFlightProgress } from "@/components/experimental/ExperimentalFlightProgress";

export const metadata: Metadata = {
  title: "Experimental Components · Avion Flight OS",
  description: "Instrument lab for experimental Avion UI components.",
};

export default function ExperimentalComponentsPage() {
  return (
    <main className="flex-1 overflow-auto bg-[#1A1A1A] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA]">
              EXPERIMENTAL MODULES
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Experimental Components</h1>
            <p className="mt-1 max-w-xl text-sm text-[#A1A1AA]">
              Instrument lab for iterating on Avion Flight OS UI patterns before they graduate
              into operational dashboards.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-sm border border-[#333] bg-[#2A2A2A] px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-[#A1A1AA]">
            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(0,0,0,0.6)]" />
            <span>Lab Mode</span>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {/* Original Components */}
          <ExperimentalSectionShell
            label="WEATHER · VIEWPORT"
            name="Atmosphere Engine"
            description="Animated viewport rendering precipitation, visibility, and flight rules as a live instrument."
            status="experimental"
          >
            <ExperimentalWeatherViewport />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="RISK ENGINE · GAUGE"
            name="Risk Prism Gauge"
            description="Radial risk gauge exploring motion, thresholds, and factor breakdown styling."
            status="experimental"
          >
            <ExperimentalRiskGauge />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="INSTRUMENTATION · FUEL"
            name="Fuel Monitor"
            description="Three-tank fuel monitor with groove tanks, balance indicator, and endurance readout."
            status="beta"
          >
            <ExperimentalFuelMonitor />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="PROCEDURES · CHECKLIST"
            name="Mechanical Checklist"
            description="Pre-flight checklist prototype with mechanical switches and tactile motion."
            status="experimental"
          >
            <ExperimentalChecklist />
          </ExperimentalSectionShell>

          {/* New Wave 2 Components */}
          <ExperimentalSectionShell
            label="INSTRUMENTATION · ALTITUDE"
            name="Drum Altimeter"
            description="Classic rolling-drum altitude display with MSL/AGL reference and pressure setting."
            status="experimental"
          >
            <ExperimentalAltimeter />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="NAVIGATION · PROFILE"
            name="Vertical Profile Chart"
            description="Cross-section visualization showing flight path elevation against terrain and weather hazards."
            status="experimental"
          >
            <ExperimentalVerticalProfile />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="PERFORMANCE · WEIGHT/BALANCE"
            name="CG Envelope Monitor"
            description="Weight and balance visualization with CG envelope boundaries and real-time status indication."
            status="experimental"
          >
            <ExperimentalWeightBalance />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="NAVIGATION · HEADING"
            name="Compass Indicator"
            description="Rotating compass rose with magnetic/true reference toggle and wind correction display."
            status="experimental"
          >
            <ExperimentalHeadingIndicator />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="INSTRUMENTATION · VSI"
            name="Vertical Speed Indicator"
            description="Vertical tape VSI gauge showing climb/descent rate with trend prediction."
            status="experimental"
          >
            <ExperimentalVerticalSpeed />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="OPERATIONS · NOTAMS"
            name="NOTAM Timeline"
            description="Chronological display of NOTAMs along flight timeline with severity indication and filtering."
            status="experimental"
          >
            <ExperimentalNotamTimeline />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="AERODROME · RUNWAY"
            name="Runway Diagram"
            description="Top-down runway layout with conditions, lighting, and wind component analysis."
            status="experimental"
          >
            <ExperimentalRunwayDiagram />
          </ExperimentalSectionShell>

          <ExperimentalSectionShell
            label="NAVIGATION · PROGRESS"
            name="Flight Progress Tracker"
            description="Waypoint-based route progress with ETA tracking and completion status visualization."
            status="experimental"
          >
            <ExperimentalFlightProgress />
          </ExperimentalSectionShell>
        </div>
      </div>
    </main>
  );
}
