'use client';

import type { RestructuredCountryRequirement, ComplianceSilo, ComplianceSiloItem } from '@/types/compliance';
import { AvionTabs } from '@/components/ui/avion-tabs';
import { useState } from 'react';
import { ComplianceSiloItemCard } from './ComplianceSiloItemCard';

interface CountryComplianceDisplayProps {
  country: RestructuredCountryRequirement;
}

export function CountryComplianceDisplay({ country }: CountryComplianceDisplayProps) {
  const [selectedTab, setSelectedTab] = useState<string>('landing');

  const tabs = country.silos.map(silo => ({
    id: silo.category,
    label: silo.category.charAt(0).toUpperCase() + silo.category.slice(1),
  }));

  const selectedSilo = country.silos.find(silo => silo.category === selectedTab);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          {country.countryCode} - {country.region}
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">{country.countryName}</h2>
        <p className="mt-2 text-muted-foreground max-w-prose">{country.summary}</p>
      </div>

      {/* Tabs and Content */}
      <div className="bg-card border border-border rounded-sm p-6">
        <AvionTabs
          tabs={tabs}
          selectedTab={selectedTab}
          onSelectTab={setSelectedTab}
          className="mb-6"
        />
        
        <div className="space-y-4">
          {selectedSilo && selectedSilo.items.length > 0 ? (
            selectedSilo.items.map(item => <ComplianceSiloItemCard key={item.id} item={item} />)
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No specific regulations listed for this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* Regulatory Authority */}
       <div className="bg-card border border-border rounded-sm p-6">
         <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-4">Regulatory Authority</h3>
         <a 
          href={country.regulatoryAuthority.website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
        >
          {country.regulatoryAuthority.name}
        </a>
       </div>
    </div>
  );
}
