"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Globe, Search, ArrowLeft, ChevronRight } from "lucide-react";
import { countryRequirements } from "@/lib/compliance/countries";

export default function CountryIndexPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countryRequirements;
    return countryRequirements.filter((c) => {
      return (
        c.countryName.toLowerCase().includes(q) ||
        c.countryCode.toLowerCase().includes(q) ||
        (c.region && c.region.toLowerCase().includes(q))
      );
    });
  }, [query]);

  return (
    <div className="flex-1 overflow-auto p-8">
      <Link
        href="/compliance"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back to Compliance
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
            COUNTRY REGULATORY PROFILES
          </div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Business Aviation by Country
          </h1>
        </div>
      </div>

      <div className="mb-6 bg-card border border-border rounded-sm p-4 flex items-center gap-3">
        <Search size={18} strokeWidth={1.5} className="text-[#2563EB]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by country name, code, or region..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((country) => (
          <Link
            key={country.id}
            href={`/compliance/countries/${country.countryCode}`}
            className="bg-card border border-border rounded-sm p-4 hover:border-[#2563EB] transition-colors flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <Globe size={22} strokeWidth={1.5} className="text-[#2563EB]" />
              <div>
                <div className="text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  {country.region} • {country.countryCode}
                </div>
                <div className="text-sm font-semibold text-foreground">
                  {country.countryName}
                </div>
              </div>
            </div>
            {country.overview && (
              <p className="text-xs text-muted-foreground line-clamp-3">
                {country.overview}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span>
                Overflight: {country.overflightPermit.required ? "Permit" : "No permit"}
              </span>
              <span className="inline-flex items-center gap-1">
                Open
                <ChevronRight size={14} strokeWidth={1.5} />
              </span>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground py-12">
            No countries match "{query}".
          </div>
        )}
      </div>
    </div>
  );
}
