'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, BookOpen, Globe, Users, Plane, ArrowRight, Calculator, FileText, Star, ChevronRight } from 'lucide-react';
import { regulations, briefingItems, operationalScenarios } from '@/lib/compliance/regulations';
import { countryRequirements } from '@/lib/compliance/countries';

export default function CompliancePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crew-duty' | 'passenger-briefing' | 'country-requirements'>('all');

  // Search across all content
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    
    const query = searchQuery.toLowerCase();
    const results: any[] = [];

    // Search regulations
    regulations.forEach(reg => {
      if (
        reg.title.toLowerCase().includes(query) ||
        reg.summary.toLowerCase().includes(query) ||
        reg.plainEnglish.toLowerCase().includes(query) ||
        reg.keyPoints.some(kp => kp.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'regulation',
          item: reg,
          relevance: reg.title.toLowerCase().includes(query) ? 2 : 1,
        });
      }
    });

    // Search countries
    countryRequirements.forEach(country => {
      if (
        country.countryName.toLowerCase().includes(query) ||
        country.specialRequirements.some(req => req.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'country',
          item: country,
          relevance: country.countryName.toLowerCase().includes(query) ? 2 : 1,
        });
      }
    });

    // Search scenarios
    operationalScenarios.forEach(scenario => {
      if (
        scenario.title.toLowerCase().includes(query) ||
        scenario.question.toLowerCase().includes(query) ||
        scenario.tags.some(tag => tag.toLowerCase().includes(query))
      ) {
        results.push({
          type: 'scenario',
          item: scenario,
          relevance: scenario.title.toLowerCase().includes(query) ? 2 : 1,
        });
      }
    });

    return results.sort((a, b) => b.relevance - a.relevance);
  }, [searchQuery]);

  const showSearchResults = searchQuery.length >= 2;

  return (
    <div className="flex-1 overflow-auto p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-2">
          REGULATORY REFERENCE
        </div>
        <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-2">
          Compliance Intelligence
        </h1>
        <p className="text-muted-foreground">
          Quick regulatory answers for flight operations coordinators
        </p>
      </div>

      {/* Hero Search Bar */}
      <div className="mb-8">
        <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Search size={24} strokeWidth={1.5} className="text-[#2563EB]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search regulations, countries, or scenarios..."
              className="flex-1 bg-transparent text-lg text-foreground placeholder:text-muted-foreground focus:outline-none"
              autoFocus
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Try:</span>
            {['crew duty limits', 'morocco overflight', 'passenger briefing', 'same day turnaround'].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-2 py-1 bg-muted/30 hover:bg-muted/50 rounded text-xs transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {showSearchResults && (
          <div className="mt-4 bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="text-sm font-semibold text-foreground mb-4">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </div>
            <div className="space-y-3">
              {searchResults.slice(0, 10).map((result, idx) => (
                <div
                  key={idx}
                  className="border border-border rounded-sm p-4 hover:border-[#2563EB] transition-colors"
                >
                  {result.type === 'regulation' && (
                    <Link href={`/compliance/regulations/${result.item.id}`}>
                      <div className="flex items-start gap-3">
                        <BookOpen size={20} strokeWidth={1.5} className="text-[#2563EB] mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-foreground mb-1">{result.item.title}</div>
                          <div className="text-xs text-muted-foreground mb-2">{result.item.reference}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{result.item.summary}</div>
                        </div>
                        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  )}
                  {result.type === 'country' && (
                    <Link href={`/compliance/countries/${result.item.countryCode}`}>
                      <div className="flex items-start gap-3">
                        <Globe size={20} strokeWidth={1.5} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-foreground mb-1">{result.item.countryName}</div>
                          <div className="text-xs text-muted-foreground mb-2">{result.item.region}</div>
                          <div className="text-sm text-muted-foreground">
                            {result.item.overflightPermit.required 
                              ? `Permit required: ${result.item.overflightPermit.advanceNoticeHours}hr notice`
                              : 'No permit required'}
                          </div>
                        </div>
                        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  )}
                  {result.type === 'scenario' && (
                    <Link href={`/compliance/scenarios#${result.item.id}`}>
                      <div className="flex items-start gap-3">
                        <FileText size={20} strokeWidth={1.5} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-foreground mb-1">{result.item.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{result.item.question}</div>
                        </div>
                        <ChevronRight size={16} strokeWidth={1.5} className="text-muted-foreground flex-shrink-0" />
                      </div>
                    </Link>
                  )}
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference Sections */}
      {!showSearchResults && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Crew Duty Regulations */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users size={24} strokeWidth={1.5} className="text-[#2563EB]" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  CREW DUTY REGULATIONS
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Can my pilot fly this leg?
                </h2>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div className="bg-muted/30 rounded-sm p-4">
                <div className="text-xs text-muted-foreground mb-2">Single Pilot (24 hours)</div>
                <div className="text-2xl font-mono font-bold text-foreground tabular-nums">8 hours</div>
              </div>
              <div className="bg-muted/30 rounded-sm p-4">
                <div className="text-xs text-muted-foreground mb-2">Two Pilots (24 hours)</div>
                <div className="text-2xl font-mono font-bold text-foreground tabular-nums">10 hours</div>
              </div>
              <div className="bg-muted/30 rounded-sm p-4">
                <div className="text-xs text-muted-foreground mb-2">Required Rest Period</div>
                <div className="text-2xl font-mono font-bold text-foreground tabular-nums">10 hours</div>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/compliance/calculators/crew-duty"
                className="flex items-center justify-between px-4 py-3 bg-[#2563EB] text-white rounded-sm hover:bg-[#2563EB]/90 transition-colors"
              >
                <span className="text-sm font-medium">Open Duty Calculator</span>
                <Calculator size={16} strokeWidth={1.5} />
              </Link>
              <Link
                href="/compliance/regulations/crew-duty"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-sm hover:border-[#2563EB] transition-colors"
              >
                <span className="text-sm font-medium text-foreground">View Full Regulation</span>
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Passenger Briefing */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Plane size={24} strokeWidth={1.5} className="text-emerald-500" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  PASSENGER BRIEFINGS
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  What do I tell passengers?
                </h2>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {briefingItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                  <span className="text-[#2563EB] mt-1">•</span>
                  <span className="text-foreground">{item.title}</span>
                </div>
              ))}
              <div className="text-xs text-muted-foreground pt-2">
                +{briefingItems.length - 5} more items
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/compliance/briefings/passenger"
                className="flex items-center justify-between px-4 py-3 bg-emerald-500 text-white rounded-sm hover:bg-emerald-500/90 transition-colors"
              >
                <span className="text-sm font-medium">Open Briefing Checklist</span>
                <FileText size={16} strokeWidth={1.5} />
              </Link>
              <Link
                href="/compliance/regulations/passenger-briefing"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-sm hover:border-emerald-500 transition-colors"
              >
                <span className="text-sm font-medium text-foreground">View Regulation (FAR 135.117)</span>
                <ArrowRight size={16} strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          {/* Country Requirements */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={24} strokeWidth={1.5} className="text-amber-500" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  COUNTRY & AIRPORT REQUIREMENTS
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  What do we need to operate in [country]?
                </h2>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="text-sm text-muted-foreground mb-3">
                {countryRequirements.length} countries in database
              </div>
              {countryRequirements.slice(0, 5).map((country) => (
                <Link
                  key={country.id}
                  href={`/compliance/countries/${country.countryCode}`}
                  className="flex items-center justify-between px-3 py-2 border border-border rounded-sm hover:border-amber-500 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground">{country.countryName}</span>
                  <span className="text-xs text-muted-foreground">{country.region}</span>
                </Link>
              ))}
            </div>

            <Link
              href="/compliance/countries"
              className="flex items-center justify-center px-4 py-3 border border-border rounded-sm hover:border-amber-500 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">View All Countries</span>
            </Link>
          </div>

          {/* Common Scenarios */}
          <div className="bg-card dark:bg-[#2A2A2A] border border-border rounded-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} strokeWidth={1.5} className="text-[#F04E30]" />
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  COMMON SCENARIOS
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Real-world operational questions
                </h2>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {operationalScenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/compliance/scenarios#${scenario.id}`}
                  className="block px-3 py-3 border border-border rounded-sm hover:border-[#F04E30] transition-colors"
                >
                  <div className="text-sm font-medium text-foreground mb-1">{scenario.title}</div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{scenario.question}</div>
                </Link>
              ))}
            </div>

            <Link
              href="/compliance/scenarios"
              className="flex items-center justify-center px-4 py-3 border border-border rounded-sm hover:border-[#F04E30] transition-colors"
            >
              <span className="text-sm font-medium text-foreground">View All Scenarios</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
