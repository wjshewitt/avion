'use client';

import { useState } from 'react';
import { ComplianceCountrySearch } from '@/components/compliance/ComplianceCountrySearch';
import { CountryComplianceDisplay } from '@/components/compliance/CountryComplianceDisplay';
import type { RestructuredCountryRequirement } from '@/types/compliance';
import { restructuredCountryRequirements } from '@/lib/compliance/restructured-countries';
import { Plane } from 'lucide-react';

export default function CompliancePage() {
  const [selectedCountry, setSelectedCountry] = useState<RestructuredCountryRequirement | null>(restructuredCountryRequirements[0]);

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          REGULATORY REFERENCE
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Compliance Intelligence
        </h1>
        <p className="text-muted-foreground">
          Country-specific regulations for global flight operations.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl">
        <ComplianceCountrySearch 
          onCountrySelect={setSelectedCountry} 
          placeholder="Search for a country..."
        />
      </div>

      {/* Main Content */}
      {selectedCountry ? (
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
