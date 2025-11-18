"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plane } from "lucide-react";
import { ComplianceCountrySearch } from "@/components/compliance/ComplianceCountrySearch";
import { CountryComplianceDisplay } from "@/components/compliance/CountryComplianceDisplay";
import type { RestructuredCountryRequirement } from "@/types/compliance";
import { restructuredCountryRequirements } from "@/lib/compliance/restructured-countries";
import { cn } from "@/lib/utils";

function ComplianceCountriesContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');
  
  const getInitialCountry = () => {
    if (initialQuery) {
      const country = restructuredCountryRequirements.find(c => c.countryCode.toLowerCase() === initialQuery.toLowerCase());
      if (country) return country;
    }
    return restructuredCountryRequirements[0];
  }

  const [selectedCountry, setSelectedCountry] = useState<RestructuredCountryRequirement | null>(getInitialCountry());
  const [viewMode, setViewMode] = useState<"detail" | "grid">("detail");

  const handleCountrySelect = (country: RestructuredCountryRequirement) => {
    setSelectedCountry(country);
    setViewMode("detail");
  };

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          COMPLIANCE DATABASE
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Country Requirements
        </h1>
        <p className="text-muted-foreground">
          Detailed, country-specific regulations for global flight operations.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 max-w-2xl">
        <ComplianceCountrySearch
          onCountrySelect={handleCountrySelect}
          placeholder="Search for a country..."
        />
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono tracking-[0.2em] uppercase">View</span>
        <div className="inline-flex rounded-sm border border-border bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={() => setViewMode("detail")}
            className={cn(
              "px-3 py-1 text-[11px] font-mono uppercase tracking-wide rounded-[2px] transition-colors",
              viewMode === "detail"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Detail
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "px-3 py-1 text-[11px] font-mono uppercase tracking-wide rounded-[2px] transition-colors",
              viewMode === "grid"
                ? "bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Grid
          </button>
        </div>
      </div>

      {/* Main Content */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {restructuredCountryRequirements.map((country) => {
            const isSelected = selectedCountry?.id === country.id;

            return (
              <button
                key={country.id}
                type="button"
                onClick={() => {
                  setSelectedCountry(country);
                  setViewMode("detail");
                }}
                className={cn(
                  "group text-left bg-card border border-border rounded-sm p-4 transition-colors",
                  isSelected && "border-amber-500 bg-muted/40",
                )}
              >
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {country.region} • {country.countryCode}
                </div>
                <div className="text-sm font-semibold text-foreground">{country.countryName}</div>
                {country.summary && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    {country.summary}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      ) : selectedCountry ? (
        <CountryComplianceDisplay country={selectedCountry} />
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-20 bg-card border border-dashed rounded-sm">
          <Plane className="mb-4 h-12 w-12 text-muted-foreground/50" strokeWidth={1.5} />
          <h2 className="text-lg font-semibold text-foreground">Select a Country</h2>
          <p className="mt-2 max-w-sm text-sm">
            Use the search bar above to find compliance information for a specific country.
          </p>
        </div>
      )}
    </div>
  );
}

export default function ComplianceCountriesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ComplianceCountriesContent />
    </Suspense>
  );
}
